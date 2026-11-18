import { Mic } from "lucide-react";
import { LANE_HEIGHT, LaneFrame, LaneHead, VolumeSlider } from "@/features/music-library/components/StudioLane";
import { StudioWave } from "@/features/music-library/components/StudioWave";
import { type StudioTakeLaneModel } from "@/features/music-library/hooks/useStudioTimeline";
import { TAKE_THEME } from "@/features/ensemble/utils/trackTheme";
import { cn } from "@/shared/utils/cn";

interface StudioTakeLaneProps {
  take: StudioTakeLaneModel;
  pxPerSec: number;
  playheadSec: number;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

// Làn cuối của timeline: chỗ bản thu của giảng viên xuất hiện, từ ô trống chờ thu đến sóng mọc dần lúc ghi.
export function StudioTakeLane({ take, pxPerSec, playheadSec, onVolumeChange, onToggleMute }: StudioTakeLaneProps) {
  const isRecording = take.state === "recording";
  const isReady = take.state === "ready";
  return (
    <LaneFrame
      waveBackground={TAKE_THEME.bg}
      labelClassName="bg-bvc-ink text-white"
      className={cn(
        "transition-colors",
        isRecording && "border-bvc-error",
        take.state === "empty" && "border-dashed border-bvc-border-strong"
      )}
      label={
        <>
          <LaneHead
            name={isRecording ? "Đang thu" : "Của bạn"}
            isMuted={take.isMuted}
            isOnDark
            disabled={!isReady}
            muteLabel={`${take.isMuted ? "Bật" : "Tắt"} tiếng bản thu`}
            onToggleMute={onToggleMute}
          />
          <VolumeSlider
            label="Âm lượng bản thu"
            value={take.volume}
            color={TAKE_THEME.light}
            disabled={!isReady}
            onChange={onVolumeChange}
          />
        </>
      }
      wave={
        take.state === "empty" ? (
          <p className="absolute inset-0 flex items-center justify-center gap-2 px-4 text-center text-[13px] text-bvc-muted">
            <Mic size={15} className="shrink-0" aria-hidden />
            Bản thu của bạn sẽ hiện ở đây
          </p>
        ) : (
          <div className={cn("absolute inset-y-0 left-0", isReady && take.isMuted && "opacity-40")}>
            <StudioWave
              peaks={take.peaks}
              widthPx={take.durationSec * pxPerSec}
              heightPx={LANE_HEIGHT - 2}
              color={TAKE_THEME.light}
              playedColor={TAKE_THEME.dark}
              playedPx={isRecording ? take.durationSec * pxPerSec : playheadSec * pxPerSec}
            />
          </div>
        )
      }
    />
  );
}
