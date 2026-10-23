import { Clock, Gauge, Music, Sparkles } from "lucide-react";
import { formatClock } from "@/features/ensemble/utils/formatClock";

interface PieceBriefCardProps {
  pieceTitle: string;
  myInstrumentName: string;
  targetBpm: number;
  durationSec: number;
  subtitle?: string;
}

export function PieceBriefCard({
  pieceTitle,
  myInstrumentName,
  targetBpm,
  durationSec,
  subtitle,
}: PieceBriefCardProps) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 rounded-lg border border-bvc-border bg-white px-3.5 py-2.5 shadow-sm md:px-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-bvc-ink text-white shadow-sm">
          <Music size={18} strokeWidth={2.2} />
        </div>
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-2">
            <h2 className="truncate font-bvc-display text-[15px] font-black tracking-tight text-bvc-ink">
              {pieceTitle}
            </h2>
          </div>
          <p className="truncate text-[11.5px] text-bvc-muted">
            {subtitle || `Luyện hòa tấu bè ${myInstrumentName} cùng tổng phổ giảng viên`}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg bg-bvc-accent-tint px-2.5 py-1 text-[11.5px] font-bold text-bvc-accent-text">
          <Sparkles size={12} strokeWidth={2.4} />
          <span>Bè {myInstrumentName}</span>
        </div>

        <div className="hidden items-center gap-1 rounded-lg border border-bvc-border/80 bg-bvc-surface/60 px-2.5 py-1 text-[11.5px] font-semibold text-bvc-ink sm:flex">
          <Gauge size={13} className="text-bvc-accent" />
          <span className="font-bvc-mono">{targetBpm} BPM</span>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-bvc-border/80 bg-bvc-surface/60 px-2 py-1 text-[11.5px] font-semibold text-bvc-muted">
          <Clock size={13} />
          <span className="font-bvc-mono">{formatClock(durationSec)}</span>
        </div>
      </div>
    </div>
  );
}
