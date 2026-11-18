import { Pause, Play } from "lucide-react";
import { formatClock } from "@/features/ensemble/utils/formatClock";

interface StudioStageHeaderProps {
  isPlaying: boolean;
  positionSec: number;
  endSec: number;
  disabled: boolean;
  onToggle: () => void;
}

// Hàng đầu của thẻ phòng thu: nút nghe thử các bè và đồng hồ.
export function StudioStageHeader({ isPlaying, positionSec, endSec, disabled, onToggle }: StudioStageHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? "Tạm dừng các bè" : "Nghe thử các bè"}
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-bvc-ink text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPlaying ? (
          <Pause size={18} fill="currentColor" strokeWidth={0} aria-hidden />
        ) : (
          <Play size={18} fill="currentColor" strokeWidth={0} className="translate-x-px" aria-hidden />
        )}
      </button>
      <span className="font-bvc-mono text-[15px] text-bvc-muted tabular-nums">
        <span className="font-semibold text-bvc-ink">{formatClock(positionSec)}</span> / {formatClock(endSec)}
      </span>
      <span className="text-[13px] text-bvc-muted">Nghe thử các bè</span>
    </div>
  );
}
