import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { HeadphonePrompt } from "@/features/ensemble/components/HeadphonePrompt";
import { EnsemblePreparation } from "@/features/ensemble/components/EnsemblePreparation";
import { usePartsPreview } from "@/features/ensemble/hooks/usePartsPreview";
import { TakeActions } from "@/features/ensemble/components/TakeActions";
import { ScoreLanes } from "@/features/ensemble/components/ScoreLanes";
import { EnsembleSessionBar } from "@/features/ensemble/components/EnsembleSessionBar";
import { useEnsembleLiveTempo } from "@/features/ensemble/hooks/useEnsembleLiveTempo";
import { useEnsembleAssignment } from "@/features/ensemble/hooks/useEnsembleAssignment";
import { useEnsemblePractice } from "@/features/ensemble/hooks/useEnsemblePractice";
import { useListeningSetup } from "@/features/ensemble/hooks/useListeningSetup";
import { useTakePlayback } from "@/features/ensemble/hooks/useTakePlayback";
import { useTrackPeaks } from "@/features/ensemble/hooks/useTrackPeaks";
import { type ListeningMode } from "@/features/ensemble/types/ensembleTypes";
import { MIC_CONSTRAINTS } from "@/features/ensemble/utils/listeningMode";
import { formatDate } from "@/features/ensemble/utils/formatClock";
import { UploadPanel } from "@/features/practice/components/UploadPanel";
import { cn } from "@/shared/utils/cn";
import { RecordPanel } from "@/features/practice/components/RecordPanel";
import { usePitchStream } from "@/features/practice/hooks/usePitchStream";
import { usePracticeAudio } from "@/features/practice/hooks/usePracticeAudio";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { ConfirmDialog } from "@/shared/components/bvc/ConfirmDialog";

const TUNER_FMIN_HZ = 65;
const TUNER_FMAX_HZ = 2000;
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
  // Micro + bộ phân tích của trang luyện tập: cấp dữ liệu cho tuner và đo nhịp trực tiếp
  const isMicWindow = status === "ready" || status === "countIn" || status === "recording";
  const practiceAudio = usePracticeAudio({
    micWanted: Boolean(practice.tracksResult) && listening.permission === "granted" && listening.hasMic && isMicWindow,
    fminHz: TUNER_FMIN_HZ,
    constraints: MIC_CONSTRAINTS[listening.mode ?? "headphones"],
  });
  const pitchStream = usePitchStream({
    audio: practiceAudio,
    enabled: (status === "ready" && !practice.take) || status === "recording",
    computePitch: true,
    fminHz: TUNER_FMIN_HZ,
    fmaxHz: TUNER_FMAX_HZ,
  });
  const liveTempo = useEnsembleLiveTempo({
    audio: practiceAudio,
    pitchStream,
    status,
    recordingStartedAt: practice.recordingStartedAt,
    countBeat: practice.countBeat,
    targetBpm: practice.tracksResult?.targetBpm ?? 60,
    micDenied: practiceAudio.micState === "denied",
  });
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

  const playback = useTakePlayback(practice.take, {
    enabled: true,
    play: practice.playTracksFrom,
    pause: practice.pauseTracks,
  });
  const hasTake = Boolean(practice.take) && (status === "preview" || status === "saving");
  const togglePartsPreview = () => {
    if (hasTake) {
      stopPartsPreview();
      playback.togglePlay();
      return;
    }
    if (playback.playing) playback.togglePlay();
    partsPreview.toggle();
  };
  const seekParts = (seconds: number) => {
    if (hasTake) {
      playback.seek(seconds);
      return;
    }
    if (playback.playing) {
      playback.seek(seconds);
      return;
    }
    partsPreview.seek(seconds);
    if (!partsPreview.playing) partsPreview.toggle();
  };
  const downloadTake = () => {
    const current = practice.take;
    if (!current) return;
    const link = document.createElement("a");
    link.href = current.url;
    link.download = `ban-thu-${practice.tracksResult?.pieceTitle || "hoa-tau"}.wav`;
    link.click();
  };

  const [inputMode, setInputMode] = useState<"record" | "upload">("record");
  const fileInput = useRef<HTMLInputElement>(null);
  const isBusy = status === "countIn" || status === "recording" || status === "processing" || status === "saving";
  const hasUnsavedTake = status === "preview";
  const backTarget = assignmentId ? `/assignment/${assignmentId}` : "/assignments";

  const submitBlockedReason = !practice.tracksResult?.mySheetMusicId
    ? "Nhạc cụ của bạn chưa có bản mẫu cho bài này nên chưa nộp để chấm được. Bạn vẫn có thể luyện và nghe lại."
    : null;
  const isCounted = practice.tracksResult?.isAssignmentCounted ?? false;
  const quotaNote = !assignmentId
    ? null
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
      <StudentShell>
        <div className="flex flex-1 items-center justify-center p-6">
          <p
            className={`text-[14.5px] font-medium ${error ? "text-bvc-error" : "text-bvc-muted"}`}
            role={error ? "alert" : "status"}
          >
            {isLoading ? "Đang kết nối phòng thu và chuẩn bị các bè mẫu..." : error}
          </p>
        </div>
        {leaveDialog}
      </StudentShell>
    );
  }

  const subtitle = [
    `Bè ${tracksResult.myInstrumentName}`,
    assignment?.className,
    assignment?.title,
    isCounted && assignment ? `Hạn ${formatDate(assignment.deadline)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <StudentShell>
      {/* Nghe tổng phổ trước, sau đó chuẩn bị và thu âm. */}
      <div className="p-3 sm:p-5">
        <div className="mx-auto flex w-full max-w-[1200px] min-w-0 flex-col gap-5">
          <div className="grid min-w-0 items-stretch gap-5 lg:grid-cols-3">
            <div className="flex min-w-0 flex-col gap-3 lg:col-span-2">
              {/* Tổng phổ */}
              <div className="flex min-w-0 flex-col lg:flex-1">
                <ScoreLanes
                  title={tracksResult.pieceTitle}
                  subtitle={subtitle}
                  myInstrumentId={tracksResult.myInstrumentId}
                  isRecording={status === "recording"}
                  recordingPositionSec={practice.elapsedSec}
                  isPlaying={hasTake ? playback.playing : isPreviewingParts}
                  onTogglePlay={togglePartsPreview}
                  onSeek={seekParts}
                  disabled={isBusy && !hasTake}
                  tracks={practice.tracks}
                  settings={practice.mixer.settings}
                  anySolo={practice.mixer.anySolo}
                  trackAnalysers={practice.trackAnalysers}
                  peaksByTrack={peaksByTrack}
                  durationSec={practice.durationSec}
                  recordingStartedAt={practice.recordingStartedAt}
                  previewPositionSec={hasTake ? playback.playPos : partsPreview.position}
                  take={
                    hasTake && practice.take
                      ? {
                          peaks: practice.take.peaks,
                          durationSec: practice.take.durationSec,
                          volume: Math.round(playback.volume * 100),
                          muted: playback.muted,
                        }
                      : null
                  }
                  onTakeVolumeChange={(value) => playback.setVolume(value / 100)}
                  onToggleTakeMute={playback.toggleMute}
                  recorder={
                    (status === "ready" || status === "countIn" || status === "recording") && (
                      <div className="flex min-w-0 flex-col gap-3">
                        {status === "ready" && (
                          <div className="flex flex-col gap-2.75 md:flex-row md:items-center md:justify-between md:gap-4">
                            <div className="flex shrink-0 gap-1 rounded-full border border-bvc-border-strong bg-bvc-surface p-0.75 md:w-85 md:border-0 md:bg-bvc-panel">
                              {(["record", "upload"] as const).map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  aria-pressed={inputMode === value}
                                  onClick={() => setInputMode(value)}
                                  className={cn(
                                    "min-h-10 flex-1 cursor-pointer rounded-full text-sm font-medium",
                                    inputMode === value ? "bg-bvc-ink text-white" : "text-bvc-muted"
                                  )}
                                >
                                  {value === "record" ? "Ghi âm" : "Tải file lên"}
                                </button>
                              ))}
                            </div>
                            <p className="shrink-0 text-xs leading-normal text-bvc-muted md:text-right md:text-[12.5px]">
                              Định dạng MP3, WAV, M4A · tối đa 20 MB · thời lượng từ 00:10 đến 03:00
                            </p>
                          </div>
                        )}
                        {status === "ready" && inputMode === "upload" ? (
                          <div className="flex min-h-44 flex-col">
                            <UploadPanel
                              file={null}
                              playing={false}
                              position={0}
                              blocked={!practice.tracksResult}
                              weakNetwork={false}
                              errorText=""
                              weakMessage=""
                              sendDisabled
                              sendLabel=""
                              onPick={() => fileInput.current?.click()}
                              onPickOther={() => fileInput.current?.click()}
                              onTogglePlay={() => undefined}
                              onSend={() => undefined}
                            />
                          </div>
                        ) : (
                          <RecordPanel
                            rec={status === "countIn" ? "countin" : status === "recording" ? "recording" : "idle"}
                            elapsed={practice.elapsedSec}
                            countBeat={practice.countBeat}
                            takeLen={practice.take?.durationSec ?? 0}
                            previewPeaks={practice.take?.peaks ?? []}
                            analyser={practice.micAnalyser}
                            playing={playback.playing}
                            playPos={playback.playPos}
                            blocked={!listening.hasMic || listening.permission !== "granted"}
                            micDenied={false}
                            weakNetwork={false}
                            errorText=""
                            weakMessage=""
                            sendDisabled
                            sendLabel=""
                            onStart={requestStart}
                            onStop={() => void practice.stop()}
                            onTogglePlay={() => {
                              stopPartsPreview();
                              playback.togglePlay();
                            }}
                            onSeek={playback.seek}
                            volume={playback.volume}
                            muted={playback.muted}
                            rate={playback.rate}
                            onVolumeChange={playback.setVolume}
                            onToggleMute={playback.toggleMute}
                            onRateChange={playback.setRate}
                            onRerecord={practice.discardTake}
                            onDownload={downloadTake}
                            onSend={() => void handleSubmit()}
                            targetBpm={tracksResult.targetBpm}
                            pieceLen={practice.durationSec}
                            hideIdleStatus
                            idleNote={
                              practice.isCountInOn
                                ? `Chạm nút ghi để bắt đầu. Có 4 tiếng đếm nhịp, rồi các bè khác phát cùng bạn · ${tracksResult.targetBpm} BPM.`
                                : `Chạm nút ghi để vào bè ngay, các bè khác phát cùng bạn · ${tracksResult.targetBpm} BPM.`
                            }
                          />
                        )}
                        <input
                          ref={fileInput}
                          type="file"
                          accept="audio/wav,audio/mpeg,audio/mp4,audio/x-m4a,.wav,.mp3,.m4a"
                          className="hidden"
                          aria-hidden
                          tabIndex={-1}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            event.target.value = "";
                            if (file) {
                              stopPartsPreview();
                              setInputMode("record");
                              void practice.selectFile(file);
                            }
                          }}
                        />
                      </div>
                    )
                  }
                  takeActions={
                    hasTake ? (
                      <TakeActions
                        sendDisabled={status === "saving" || submitBlockedReason !== null}
                        sendLabel={
                          status === "saving" ? "Đang tải lên..." : !isCounted ? "Gửi phân tích" : "Nộp bản thu"
                        }
                        submitBlockedReason={submitBlockedReason}
                        onDownload={downloadTake}
                        onDelete={practice.discardTake}
                        onRerecord={practice.discardTake}
                        onSend={() => void handleSubmit()}
                      />
                    ) : null
                  }
                  onVolumeChange={practice.mixer.setVolume}
                  onToggleMute={practice.mixer.toggleMute}
                  onToggleSolo={practice.mixer.toggleSolo}
                  onReset={practice.mixer.reset}
                />
              </div>
              <EnsembleSessionBar
                status={status}
                hasMic={listening.hasMic}
                micPermission={listening.permission}
                micError={practice.micError}
                listeningMode={listening.mode}
                headphoneLabel={listening.headphoneLabel}
                isCountInOn={practice.isCountInOn}
                onCountInChange={practice.setIsCountInOn}
                onChangeListeningMode={() => setIsPromptForced(true)}
                onRequestMicAccess={() => void listening.requestAccess()}
                uploadPercent={practice.uploadPercent}
                onPracticeAgain={practice.reset}
                onBack={leave}
                backLabel={assignmentId ? "Về bài tập" : "Về danh sách bài tập"}
              />
              {quotaNote && (status === "ready" || status === "preview") && (
                <p className="px-1 text-[12px] text-bvc-muted">{quotaNote}</p>
              )}
            </div>
            <div className="min-w-0 lg:h-full">
              <EnsemblePreparation
                sheetId={tracksResult.mySheetMusicId}
                targetBpm={tracksResult.targetBpm}
                disabled={isBusy || Boolean(practice.take)}
                onOpen={stopPartsPreview}
                audio={practiceAudio}
                pitchStream={pitchStream}
                tempo={liveTempo}
                clickOn={practice.isMetronomeOn}
                onToggleClick={() => practice.setIsMetronomeOn(!practice.isMetronomeOn)}
              />
            </div>
          </div>
        </div>
      </div>

      <HeadphonePrompt isOpen={isPromptOpen} onOpenChange={changePromptOpen} onChoose={chooseMode} />
      {leaveDialog}
    </StudentShell>
  );
}
