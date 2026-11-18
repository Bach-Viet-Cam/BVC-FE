import { type ReactNode } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { StudioWave } from "@/features/music-library/components/StudioWave";
import { type StudioLaneModel } from "@/features/music-library/hooks/useStudioTimeline";
import { cn } from "@/shared/utils/cn";

export const LANE_HEIGHT = 56;

interface LaneFrameProps {
  label: ReactNode;
  wave: ReactNode;
  waveBackground: string;
  /** Ô nhãn riêng (vd. làn của người đang thu nền xanh đậm). */
  labelClassName?: string;
  className?: string;
}

// Khung một làn: ô nhãn bên trái (độ rộng theo biến --label-w của timeline) + dải sóng bên phải.
export function LaneFrame({ label, wave, waveBackground, labelClassName, className }: LaneFrameProps) {
  return (
    <div
      className={cn("flex overflow-hidden rounded-2xl border border-bvc-border bg-white", className)}
      style={{ height: LANE_HEIGHT }}
    >
      <div className={cn("flex w-(--label-w) shrink-0 flex-col justify-center gap-1 px-3", labelClassName)}>
        {label}
      </div>
      <div className="relative min-w-0 flex-1" style={{ background: waveBackground }}>
        {wave}
      </div>
    </div>
  );
}

interface LaneHeadProps {
  name: string;
  isMuted: boolean;
  isOnDark?: boolean;
  onToggleMute: () => void;
  muteLabel: string;
  disabled?: boolean;
}

// Hàng trên của ô nhãn: tên bè và nút tắt tiếng.
export function LaneHead({ name, isMuted, isOnDark, onToggleMute, muteLabel, disabled }: LaneHeadProps) {
  return (
    <div className="flex items-center gap-1">
      <span className={cn("min-w-0 flex-1 truncate text-[13px] font-semibold", isMuted && "line-through opacity-60")}>
        {name}
      </span>
      <button
        type="button"
        aria-label={muteLabel}
        title={muteLabel}
        aria-pressed={isMuted}
        disabled={disabled}
        onClick={onToggleMute}
        className={cn(
          "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-bvc-accent disabled:cursor-not-allowed disabled:opacity-40",
          isOnDark
            ? "text-white/80 hover:bg-white/15 hover:text-white"
            : "text-bvc-muted hover:bg-bvc-surface hover:text-bvc-ink",
          isMuted && (isOnDark ? "text-bvc-accent-border" : "text-bvc-error")
        )}
      >
        {isMuted ? <VolumeX size={16} aria-hidden /> : <Volume2 size={16} aria-hidden />}
      </button>
    </div>
  );
}

interface VolumeSliderProps {
  label: string;
  value: number;
  color: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function VolumeSlider({ label, value, color, disabled, onChange }: VolumeSliderProps) {
  return (
    <input
      type="range"
      aria-label={label}
      aria-valuetext={`${value}%`}
      min={0}
      max={100}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-1.5 w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
      style={{ accentColor: color }}
    />
  );
}

interface StudioLaneProps {
  lane: StudioLaneModel;
  pxPerSec: number;
  playheadSec: number;
  onVolumeChange: (laneId: string, volume: number) => void;
  onToggleMute: (laneId: string) => void;
}

export function StudioLane({ lane, pxPerSec, playheadSec, onVolumeChange, onToggleMute }: StudioLaneProps) {
  const { theme } = lane;
  return (
    <LaneFrame
      waveBackground={theme.bg}
      label={
        <>
          <LaneHead
            name={lane.name}
            isMuted={lane.isMuted}
            muteLabel={`${lane.isMuted ? "Bật" : "Tắt"} tiếng bè ${lane.name}`}
            onToggleMute={() => onToggleMute(lane.id)}
          />
          <VolumeSlider
            label={`Âm lượng bè ${lane.name}`}
            value={lane.volume}
            color={theme.dark}
            onChange={(volume) => onVolumeChange(lane.id, volume)}
          />
        </>
      }
      wave={
        <div className={cn("absolute inset-0 transition-opacity duration-200", lane.isSilenced && "opacity-35")}>
          <div
            className="absolute inset-y-0"
            style={{ left: lane.offsetSec * pxPerSec, width: lane.durationSec * pxPerSec }}
          >
            <StudioWave
              peaks={lane.peaks}
              widthPx={lane.durationSec * pxPerSec}
              heightPx={LANE_HEIGHT - 2}
              color={theme.light}
              playedColor={theme.dark}
              playedPx={(playheadSec - lane.offsetSec) * pxPerSec}
            />
          </div>
        </div>
      }
    />
  );
}
