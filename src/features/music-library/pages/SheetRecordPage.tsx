import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { TeacherShell } from "@/shared/components/bvc/TeacherShell";
import { TeacherPageHeader } from "@/shared/components/bvc/TeacherPageHeader";
import { ConfirmDialog } from "@/shared/components/bvc/ConfirmDialog";
import { usePageMeta } from "@/shared/hooks/usePageMeta";
import { useLeaveGuard } from "@/shared/hooks/useLeaveGuard";
import { StudioDock } from "@/features/music-library/components/StudioDock";
import { StudioStageHeader } from "@/features/music-library/components/StudioStageHeader";
import { StudioTimeline } from "@/features/music-library/components/StudioTimeline";
import { useReferenceRecordingStudio } from "@/features/music-library/hooks/useReferenceRecordingStudio";
import { useStudioShortcuts } from "@/features/music-library/hooks/useStudioShortcuts";
import { useStudioTimeline } from "@/features/music-library/hooks/useStudioTimeline";

export function SheetRecordPage() {
  usePageMeta({ title: "Thu bản thu mẫu", description: "Ghi âm trực tiếp bản mẫu cho bản nhạc mới." });
  const { songId = "" } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const instrumentId = params.get("instrumentId") ?? "";
  const returnPath = `/songs/${songId}/sheets?new=1${instrumentId ? `&instrument=${encodeURIComponent(instrumentId)}` : ""}`;

  const studio = useReferenceRecordingStudio(songId);
  const timeline = useStudioTimeline(studio);
  const { take, mixer, rec } = studio;
  const isBusy = rec === "countin" || rec === "recording";

  // Đang đếm nhịp, đang thu hoặc có bản thu chưa dùng thì rời trang sẽ mất bản thu: hỏi lại trước
  const leave = useLeaveGuard({ isDirty: rec !== "idle" });
  const goBack = () =>
    leave.guard(() => {
      studio.cancelCountIn();
      navigate(returnPath);
    });

  const useTake = () => {
    if (!take) return;
    // File được giữ trong history state; trang quản lý bản nhạc mở lại form với file này
    navigate(returnPath, { replace: true, state: { recordedReference: take.file } });
  };

  useStudioShortcuts({
    rec,
    isEnabled: !leave.confirmProps.open,
    onStart: () => void studio.start(),
    onCancelCount: studio.cancelCountIn,
    onStop: studio.stop,
    onToggleTake: timeline.toggleTake,
    onDiscard: studio.discard,
  });

  return (
    <TeacherShell className="lg:overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col lg:overflow-y-auto">
        <TeacherPageHeader
          title="Thu bản thu mẫu"
          subtitle={studio.songTitle || "Đang tải bài hát..."}
          onBack={goBack}
        />

        <div className="mx-auto grid w-full max-w-[1200px] items-start gap-4 px-[14px] py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-5 lg:px-8">
          <section
            aria-label="Phòng thu"
            className="flex min-w-0 flex-col gap-4 rounded-[26px] border border-bvc-border bg-white p-3 sm:p-5"
          >
            <StudioStageHeader
              isPlaying={timeline.isPartsPlaying}
              positionSec={timeline.playheadSec}
              endSec={timeline.trackEndSec}
              disabled={isBusy || timeline.lanes.length === 0}
              onToggle={timeline.toggleParts}
            />

            <StudioTimeline
              lanes={timeline.lanes}
              take={timeline.takeLane}
              ticks={timeline.ticks}
              spanSec={timeline.spanSec}
              playheadSec={timeline.playheadSec}
              canSeek={timeline.canSeek}
              isLoading={studio.isLoadingTracks}
              onSeek={timeline.seekTo}
              onLaneVolume={mixer.setVolume}
              onLaneMute={mixer.toggleMute}
              onTakeVolume={(volume) => studio.setVolume(volume / 100)}
              onTakeMute={studio.toggleMute}
            />
          </section>

          <StudioDock
            rec={rec}
            maxSeconds={studio.maxSeconds}
            liveSeconds={timeline.liveSeconds}
            countBeat={studio.countBeat}
            isCountInOn={studio.isCountInOn}
            listeningMode={studio.listeningMode}
            takeSeconds={take?.durationSec ?? 0}
            takePositionSec={studio.playPos}
            isTakePlaying={timeline.isTakePlaying}
            error={studio.error}
            micDenied={studio.micDenied}
            onStart={() => void studio.start()}
            onStop={studio.stop}
            onCancelCount={studio.cancelCountIn}
            onModeChange={studio.setListeningMode}
            onCountInChange={studio.setIsCountInOn}
            onToggleTake={timeline.toggleTake}
            onDiscard={studio.discard}
            onUse={useTake}
          />
        </div>
      </div>

      <ConfirmDialog
        open={leave.confirmProps.open}
        onOpenChange={(isOpen) => !isOpen && leave.confirmProps.onStay()}
        title="Rời trang thu?"
        description={
          rec === "preview"
            ? "Bản thu chưa dùng sẽ mất. Bạn có muốn rời đi?"
            : "Rời trang sẽ hủy bản thu đang thực hiện. Bạn có muốn rời đi?"
        }
        confirmLabel="Rời trang"
        cancelLabel="Ở lại"
        onConfirm={leave.confirmProps.onLeave}
      />
    </TeacherShell>
  );
}
