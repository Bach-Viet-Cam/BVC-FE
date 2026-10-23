import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EnsembleFrame } from "@/features/ensemble/components/EnsembleFrame";
import { EnsembleHeader } from "@/features/ensemble/components/EnsembleHeader";
import { MyTakeLane } from "@/features/ensemble/components/MyTakeLane";
import { PieceBriefCard } from "@/features/ensemble/components/PieceBriefCard";
import { ScoreLanes } from "@/features/ensemble/components/ScoreLanes";
import { TransportBar } from "@/features/ensemble/components/TransportBar";
import { useEnsembleAssignment } from "@/features/ensemble/hooks/useEnsembleAssignment";
import { useEnsemblePractice } from "@/features/ensemble/hooks/useEnsemblePractice";
import { useTakePlayback } from "@/features/ensemble/hooks/useTakePlayback";
import { useTrackPeaks } from "@/features/ensemble/hooks/useTrackPeaks";
import { formatDate } from "@/features/ensemble/utils/formatClock";

const LEAVE_CONFIRM_MESSAGE = "Rời màn hình sẽ hủy bản thu đang thực hiện. Bạn có muốn rời đi?";

export function EnsemblePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pieceId = searchParams.get("pieceId") ?? "";
  const assignmentId = searchParams.get("assignmentId") ?? undefined;
  const practice = useEnsemblePractice(pieceId, assignmentId);
  const assignment = useEnsembleAssignment(assignmentId);
  const peaksByTrack = useTrackPeaks(practice.tracks);
  const { status, cancel } = practice;

  const [isAccompanied, setIsAccompanied] = useState(true);
  const playback = useTakePlayback(practice.take, {
    enabled: isAccompanied,
    play: practice.playTracksFrom,
    pause: practice.pauseTracks,
  });
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

  useEffect(() => {
    if (!isBusy && !hasUnsavedTake) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isBusy, hasUnsavedTake]);

  // Phím tắt bàn phím chuẩn phòng thu DAW (Space, R, S)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        if (status === "ready") {
          void practice.start();
        } else if (status === "recording") {
          void practice.stop();
        } else if (status === "preview") {
          playback.togglePlay();
        }
      } else if (event.code === "KeyR" && status === "preview" && !isBusy) {
        event.preventDefault();
        practice.discardTake();
      } else if (event.code === "KeyS" && status === "preview" && !isBusy) {
        event.preventDefault();
        void practice.save();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, isBusy, practice, playback]);

  const leave = () => {
    const message = hasUnsavedTake ? "Bản thu chưa được lưu sẽ mất. Bạn có muốn rời đi?" : LEAVE_CONFIRM_MESSAGE;
    if ((isBusy || hasUnsavedTake) && !window.confirm(message)) return;
    cancel();
    navigate(backTarget);
  };

  const { tracksResult, isLoading, error } = practice;
  if (isLoading || !tracksResult) {
    return (
      <EnsembleFrame>
        <EnsembleHeader title="Luyện hòa tấu" deadline={null} onClose={leave} />
        <div className="flex flex-1 items-center justify-center p-6">
          <p
            className={`text-[14.5px] font-semibold ${error ? "text-bvc-error" : "text-bvc-muted"}`}
            role={error ? "alert" : "status"}
          >
            {isLoading ? "Đang kết nối phòng thu và chuẩn bị các bè mẫu..." : error}
          </p>
        </div>
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
        deadline={assignment ? formatDate(assignment.deadline) : null}
        onClose={leave}
      />

      {/* Workspace 2 cột 50/50 - Vừa khít 1 màn hình laptop, không bị scroll */}
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto p-2.5 sm:p-3 lg:overflow-hidden md:p-3.5">
        <div className="grid min-h-0 grid-cols-1 gap-2.5 sm:gap-3 lg:h-full lg:grid-cols-2 lg:overflow-hidden md:gap-3.5">
          {/* CỘT TRÁI (50%): BÀN THU & TẬP LUYỆN (STUDIO WORKSTATION) */}
          <div className="flex min-h-0 flex-col gap-2.5 sm:gap-3 lg:h-full lg:overflow-hidden md:gap-3.5">
            <PieceBriefCard
              pieceTitle={tracksResult.pieceTitle}
              myInstrumentName={tracksResult.myInstrumentName}
              targetBpm={tracksResult.targetBpm}
              durationSec={practice.durationSec}
              subtitle={subtitle}
            />

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
              onStart={() => void practice.start()}
              onStop={() => void practice.stop()}
              onSave={() => void practice.save()}
              onDiscard={practice.discardTake}
              onPracticeAgain={practice.reset}
              onBack={() => navigate(backTarget)}
              backLabel={assignmentId ? "Về bài tập" : "Về danh sách bài tập"}
            />

            <MyTakeLane
              status={status}
              myInstrumentName={tracksResult.myInstrumentName}
              micAnalyser={practice.micAnalyser}
              isCountInOn={practice.isCountInOn}
              take={practice.take}
              playback={playback}
              isAccompanied={isAccompanied}
              onAccompanimentChange={changeAccompaniment}
              onDownload={downloadTake}
              onDiscard={practice.discardTake}
            />
          </div>

          {/* CỘT PHẢI (50%): TỔNG PHỔ CÁC BÈ HÒA TẤU (SCORE MULTI-TRACK) */}
          <div className="flex min-h-0 flex-col lg:h-full lg:overflow-hidden">
            <ScoreLanes
              tracks={practice.tracks}
              settings={practice.mixer.settings}
              anySolo={practice.mixer.anySolo}
              trackAnalysers={practice.trackAnalysers}
              peaksByTrack={peaksByTrack}
              durationSec={practice.durationSec}
              recordingStartedAt={practice.recordingStartedAt}
              previewPositionSec={practice.take && isAccompanied ? playback.playPos : null}
              onVolumeChange={practice.mixer.setVolume}
              onToggleMute={practice.mixer.toggleMute}
              onToggleSolo={practice.mixer.toggleSolo}
              onReset={practice.mixer.reset}
            />
          </div>
        </div>
      </main>
    </EnsembleFrame>
  );
}

