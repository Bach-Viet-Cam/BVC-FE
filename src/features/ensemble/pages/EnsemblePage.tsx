import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EnsembleFrame } from "@/features/ensemble/components/EnsembleFrame";
import { EnsembleHeader } from "@/features/ensemble/components/EnsembleHeader";
import { HeadphonePrompt } from "@/features/ensemble/components/HeadphonePrompt";
import { MyTakeLane } from "@/features/ensemble/components/MyTakeLane";
import { EnsemblePreparation } from "@/features/ensemble/components/EnsemblePreparation";
import { usePartsPreview } from "@/features/ensemble/hooks/usePartsPreview";
import { ScoreLanes } from "@/features/ensemble/components/ScoreLanes";
import { TransportBar } from "@/features/ensemble/components/TransportBar";
import { useEnsembleAssignment } from "@/features/ensemble/hooks/useEnsembleAssignment";
import { useEnsemblePractice } from "@/features/ensemble/hooks/useEnsemblePractice";
import { useListeningSetup } from "@/features/ensemble/hooks/useListeningSetup";
import { useTakePlayback } from "@/features/ensemble/hooks/useTakePlayback";
import { useTrackPeaks } from "@/features/ensemble/hooks/useTrackPeaks";
import { type ListeningMode } from "@/features/ensemble/types/ensembleTypes";
import { formatDate } from "@/features/ensemble/utils/formatClock";
import { ConfirmDialog } from "@/shared/components/bvc/ConfirmDialog";

const LEAVE_CONFIRM_MESSAGE = "Rời màn hình sẽ hủy bản thu đang thực hiện. Bạn có muốn rời đi?";

export function EnsemblePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pieceId = searchParams.get("pieceId") ?? "";
  const assignmentId = searchParams.get("assignmentId") ?? undefined;
  const practice = useEnsemblePractice(pieceId, assignmentId);
  const assignment = useEnsembleAssignment(assignmentId);
  const peaksByTrack = useTrackPeaks(practice.tracks);
  const { status, cancel, stop, discardTake } = practice;

  const handleSubmit = useCallback(async () => {
    const submitted = await practice.submit();
    if (submitted) navigate(`/practice/submissions/${submitted.id}/processing`);
  }, [navigate, practice]);

  const listening = useListeningSetup(Boolean(practice.tracksResult));
  const [isPromptForced, setIsPromptForced] = useState(false);
  const [startAfterChoice, setStartAfterChoice] = useState(false);
  const [isPromptDismissed, setIsPromptDismissed] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  // Tự hiện khi không thấy tai nghe và chưa chọn — nhưng chỉ lúc sẵn sàng, không chen ngang khi đang thu/nghe lại (H3).
  const isPromptOpen = isPromptForced || (listening.needsChoice && status === "ready" && !isPromptDismissed);

  const partsPreview = usePartsPreview(practice.durationSec, practice.playTracksFrom, practice.pauseTracks);
  const isPreviewingParts = partsPreview.playing;
  const stopPartsPreview = partsPreview.stop;

  const requestStart = useCallback(() => {
    stopPartsPreview();
    if (!listening.hasMic) {
      void listening.requestAccess();
      return;
    }
    if (listening.permission === "denied") {
      void listening.requestAccess();
      return;
    }
    if (listening.mode) {
      void practice.start(listening.mode);
      return;
    }
    setStartAfterChoice(true);
    setIsPromptForced(true);
  }, [listening, practice, stopPartsPreview]);

  const chooseMode = (mode: ListeningMode) => {
    listening.choose(mode);
    setIsPromptForced(false);
    if (startAfterChoice) void practice.start(mode);
    setStartAfterChoice(false);
  };

  const changePromptOpen = (isOpen: boolean) => {
    if (isOpen) return;
    setIsPromptForced(false);
    setStartAfterChoice(false);
    setIsPromptDismissed(true);
  };

  const deviceKey = `${listening.headphoneLabel ?? ""}|${listening.mode ?? ""}`;
  const [lastDeviceKey, setLastDeviceKey] = useState(deviceKey);
  if (deviceKey !== lastDeviceKey) {
    setLastDeviceKey(deviceKey);
    setIsPromptDismissed(false);
    if (listening.mode) setIsPromptForced(false);
  }

  const [isAccompanied, setIsAccompanied] = useState(true);
  const playback = useTakePlayback(practice.take, {
    enabled: isAccompanied,
    play: practice.playTracksFrom,
    pause: practice.pauseTracks,
  });
  const togglePartsPreview = () => {
    if (playback.playing) playback.togglePlay();
    partsPreview.toggle();
  };
  const seekParts = (seconds: number) => {
    if (playback.playing) {
      playback.seek(seconds);
      return;
    }
    partsPreview.seek(seconds);
    if (!partsPreview.playing) partsPreview.toggle();
  };
  const changeAccompaniment = (enabled: boolean) => {
    setIsAccompanied(enabled);
    playback.syncAccompaniment(enabled);
  };
  const downloadTake = () => {
    const current = practice.take;
    if (!current) return;
    const link = document.createElement("a");
    link.href = current.url;
    link.download = `ban-thu-${practice.tracksResult?.pieceTitle || "hoa-tau"}.wav`;
    link.click();
  };

  const isBusy = status === "countIn" || status === "recording" || status === "processing" || status === "saving";
  const hasUnsavedTake = status === "preview";
  const backTarget = assignmentId ? `/assignment/${assignmentId}` : "/assignments";

  const submitBlockedReason = !practice.tracksResult?.mySheetMusicId
    ? "Nhạc cụ của bạn chưa có bản mẫu cho bài này nên chưa nộp để chấm được. Bạn vẫn có thể luyện và nghe lại."
    : null;
  const isCounted = practice.tracksResult?.isAssignmentCounted ?? false;
  const quotaNote = !assignmentId
    ? "Buổi luyện tập tự do: bản thu được phân tích nhưng không tính vào bài tập nào."
    : !isCounted
      ? "Bài tập này không phải bài Hòa tấu (hoặc đã đóng) nên bản thu chỉ lưu làm bài luyện tập."
      : assignment && !assignment.canSubmit
        ? "Bài tập đã hết lượt nộp — bản thu sẽ chỉ lưu làm bài luyện tập."
        : assignment
          ? `Đã dùng ${assignment.usedSubmissions}/${assignment.maxSubmissions} lượt nộp.`
          : null;

  useEffect(() => {
    if (!isBusy && !hasUnsavedTake) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isBusy, hasUnsavedTake]);

  // Phím tắt thu âm; không chiếm phím của các nút và thanh tua.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isLeaveDialogOpen) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "BUTTON" ||
          target.tagName === "SELECT" ||
          target.tagName === "A" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        if (status === "ready") {
          requestStart();
        } else if (status === "recording") {
          void stop();
        } else if (status === "preview") {
          playback.togglePlay();
        }
      } else if (event.code === "KeyR" && status === "preview" && !isBusy) {
        event.preventDefault();
        discardTake();
      } else if (event.code === "KeyS" && status === "preview" && !isBusy && submitBlockedReason === null) {
        event.preventDefault();
        void handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, isBusy, handleSubmit, playback, requestStart, submitBlockedReason, stop, discardTake, isLeaveDialogOpen]);

  const leave = () => {
    if (isBusy || hasUnsavedTake) {
      setIsLeaveDialogOpen(true);
      return;
    }
    finishLeaving();
  };

  const finishLeaving = () => {
    setIsLeaveDialogOpen(false);
    cancel();
    navigate(backTarget);
  };

  const leaveDialog = (
    <ConfirmDialog
      open={isLeaveDialogOpen}
      onOpenChange={setIsLeaveDialogOpen}
      title="Rời phòng hòa tấu?"
      description={hasUnsavedTake ? "Bản thu chưa được lưu sẽ mất. Bạn có muốn rời đi?" : LEAVE_CONFIRM_MESSAGE}
      confirmLabel="Rời phòng"
      cancelLabel="Ở lại"
      onConfirm={finishLeaving}
    />
  );

  const { tracksResult, isLoading, error } = practice;
  if (isLoading || !tracksResult) {
    return (
      <EnsembleFrame>
        <EnsembleHeader title="Luyện hòa tấu" deadline={null} onClose={leave} />
        <div className="flex flex-1 items-center justify-center p-6">
          <p
            className={`text-[14.5px] font-medium ${error ? "text-bvc-error" : "text-bvc-muted"}`}
            role={error ? "alert" : "status"}
          >
            {isLoading ? "Đang kết nối phòng thu và chuẩn bị các bè mẫu..." : error}
          </p>
        </div>
        {leaveDialog}
      </EnsembleFrame>
    );
  }

  const subtitle = [`Bè ${tracksResult.myInstrumentName}`, assignment?.className, assignment?.title]
    .filter(Boolean)
    .join(" · ");

  return (
    <EnsembleFrame>
      <EnsembleHeader
        title={tracksResult.pieceTitle}
        subtitle={subtitle}
        deadline={isCounted && assignment ? formatDate(assignment.deadline) : null}
        onClose={leave}
      />

      {/* Nghe tổng phổ trước, sau đó chuẩn bị và thu âm. */}
      <main className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
        <div className="mx-auto flex w-full max-w-[1200px] min-w-0 flex-col gap-5">
          {/* Tổng phổ */}
          <div className="min-w-0">
            <ScoreLanes
              myInstrumentId={tracksResult.myInstrumentId}
              isRecording={status === "recording"}
              recordingPositionSec={practice.elapsedSec}
              isPlaying={isPreviewingParts || playback.playing}
              onTogglePlay={togglePartsPreview}
              onSeek={seekParts}
              disabled={isBusy}
              tracks={practice.tracks}
              settings={practice.mixer.settings}
              anySolo={practice.mixer.anySolo}
              trackAnalysers={practice.trackAnalysers}
              peaksByTrack={peaksByTrack}
              durationSec={practice.durationSec}
              recordingStartedAt={practice.recordingStartedAt}
              previewPositionSec={playback.playing && isAccompanied ? playback.playPos : partsPreview.position}
              onVolumeChange={practice.mixer.setVolume}
              onToggleMute={practice.mixer.toggleMute}
              onToggleSolo={practice.mixer.toggleSolo}
              onReset={practice.mixer.reset}
            />
          </div>
          {/* Thu âm hoặc chọn file */}
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[17px] font-semibold text-bvc-ink">Bản thu của bạn</h2>
              <EnsemblePreparation
                sheetId={tracksResult.mySheetMusicId}
                targetBpm={tracksResult.targetBpm}
                disabled={isBusy || Boolean(practice.take)}
                onOpen={stopPartsPreview}
              />
            </div>
            {status === "ready" && (
              <label className="flex min-h-11 cursor-pointer flex-wrap items-center gap-2 rounded-bvc-lg border border-bvc-border bg-white px-4 py-3 text-sm font-medium text-bvc-ink">
                Chọn file bản thu
                <input
                  type="file"
                  accept="audio/wav,audio/mpeg,audio/mp4,audio/x-m4a,.wav,.mp3,.m4a"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) {
                      stopPartsPreview();
                      void practice.selectFile(file);
                    }
                  }}
                />
              </label>
            )}

            <TransportBar
              status={status}
              countBeat={practice.countBeat}
              elapsedSec={practice.elapsedSec}
              durationSec={practice.durationSec}
              takeDurationSec={practice.take?.durationSec ?? null}
              targetBpm={tracksResult.targetBpm}
              recordingStartedAt={practice.recordingStartedAt}
              myInstrumentName={tracksResult.myInstrumentName}
              micError={practice.micError}
              isCountInOn={practice.isCountInOn}
              onCountInChange={practice.setIsCountInOn}
              hasMic={listening.hasMic}
              listeningMode={listening.mode}
              headphoneLabel={listening.headphoneLabel}
              micPermission={listening.permission}
              onChangeListeningMode={() => setIsPromptForced(true)}
              onRequestMicAccess={() => void listening.requestAccess()}
              isPreviewingParts={isPreviewingParts}
              onTogglePartsPreview={togglePartsPreview}
              onStart={requestStart}
              onStop={() => void practice.stop()}
              onSubmit={() => void handleSubmit()}
              onDiscard={practice.discardTake}
              onPracticeAgain={practice.reset}
              onBack={leave}
              backLabel={assignmentId ? "Về bài tập" : "Về danh sách bài tập"}
              uploadPercent={practice.uploadPercent}
              submitBlockedReason={submitBlockedReason}
              submitLabel={!isCounted ? "Gửi phân tích" : undefined}
            />

            {quotaNote && (status === "ready" || status === "preview") && (
              <p className="px-1 text-[12px] text-bvc-muted">{quotaNote}</p>
            )}

            <MyTakeLane
              status={status}
              myInstrumentName={tracksResult.myInstrumentName}
              micAnalyser={practice.micAnalyser}
              isCountInOn={practice.isCountInOn}
              take={practice.take}
              playback={{
                ...playback,
                togglePlay: () => {
                  stopPartsPreview();
                  playback.togglePlay();
                },
              }}
              isAccompanied={isAccompanied}
              onAccompanimentChange={changeAccompaniment}
              onDownload={downloadTake}
              onDiscard={practice.discardTake}
            />
          </div>
        </div>
      </main>

      <HeadphonePrompt isOpen={isPromptOpen} onOpenChange={changePromptOpen} onChoose={chooseMode} />
      {leaveDialog}
    </EnsembleFrame>
  );
}
