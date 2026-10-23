import { cn } from "@/shared/utils/cn";

interface LaneWaveProps {
  peaks: number[];
  startPercent: number;
  widthPercent: number;
  isSilenced: boolean;
  showPlayhead: boolean;
}

function Bars({ peaks, className }: { peaks: number[]; className: string }) {
  if (peaks.length === 0) return <span className={cn("absolute inset-x-0 top-1/2 h-px -translate-y-1/2", className)} />;
  return (
    <span className="absolute inset-0 flex items-center gap-px">
      {peaks.map((peak, index) => (
        <span
          key={index}
          className={cn("flex-1 rounded-full", className)}
          style={{ height: `${Math.max(6, peak * 100)}%` }}
        />
      ))}
    </span>
  );
}

export function LaneWave({ peaks, startPercent, widthPercent, isSilenced, showPlayhead }: LaneWaveProps) {
  const segment = { left: `${startPercent}%`, width: `${widthPercent}%` };
  return (
    <div className="relative h-11 overflow-hidden rounded-bvc-sm bg-bvc-surface md:h-12">
      <span className="absolute inset-y-1.5" style={segment}>
        <Bars peaks={peaks} className={isSilenced ? "bg-bvc-border-strong" : "bg-bvc-bar"} />
      </span>
      <span className="absolute inset-0 [clip-path:inset(0_calc(100%-var(--progress,0%))_0_0)]" aria-hidden>
        <span className="absolute inset-y-1.5" style={segment}>
          <Bars peaks={peaks} className={isSilenced ? "bg-bvc-bar" : "bg-bvc-ink"} />
        </span>
      </span>
      {showPlayhead && (
        <span
          aria-hidden
          className="absolute inset-y-0 left-[var(--progress,0%)] w-0.5 -translate-x-1/2 bg-bvc-accent"
        />
      )}
    </div>
  );
}
