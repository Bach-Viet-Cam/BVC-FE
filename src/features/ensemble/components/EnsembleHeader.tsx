import { Activity, Music2, X } from "lucide-react";

interface EnsembleHeaderProps {
  title: string;
  subtitle?: string;
  deadline: string | null;
  onClose: () => void;
}

export function EnsembleHeader({ title, subtitle, deadline, onClose }: EnsembleHeaderProps) {
  return (
    <header className="flex h-13 shrink-0 items-center justify-between border-b border-bvc-border bg-white/95 px-4 backdrop-blur-sm md:h-14 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Đóng"
          onClick={onClose}
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-bvc-border text-bvc-ink transition-colors hover:bg-bvc-surface"
        >
          <X size={18} strokeWidth={2} />
        </button>
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="hidden items-center gap-1 rounded-md bg-bvc-accent-tint px-2 py-0.5 text-[11px] font-bold tracking-wider text-bvc-accent-text uppercase sm:inline-flex">
            <Music2 size={12} strokeWidth={2.4} />
            Hòa tấu
          </span>
          <div className="flex min-w-0 flex-col">
            <h1 className="truncate font-bvc-display text-[16px] leading-tight font-extrabold tracking-tight text-bvc-ink md:text-[18px]">
              {title}
            </h1>
            {subtitle && (
              <p className="hidden truncate text-[11.5px] text-bvc-muted sm:block">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      <div className="hidden items-center gap-2 rounded-full border border-bvc-border/80 bg-bvc-surface/60 px-3 py-1 text-[12px] text-bvc-ink lg:flex">
        <span className="size-2 rounded-full bg-bvc-ok animate-pulse" />
        <span className="font-semibold text-bvc-ink">Phòng thu ảo</span>
        <span className="text-bvc-faint">·</span>
        <span className="text-bvc-muted">Đồng bộ các bè mẫu</span>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <div className="hidden items-center gap-1.5 rounded-lg border border-bvc-border/80 bg-bvc-surface/40 px-2.5 py-1 text-[11.5px] text-bvc-muted xl:flex">
          <Activity size={13} className="text-bvc-accent" />
          <span className="font-bvc-mono">48 kHz · DSP Low Latency</span>
        </div>
        {deadline && (
          <div className="flex items-center gap-1.5 rounded-lg border border-bvc-border bg-bvc-surface px-2.5 py-1 text-[12px]">
            <span className="text-bvc-muted">Hạn:</span>
            <span className="font-bvc-mono font-bold text-bvc-ink">{deadline}</span>
          </div>
        )}
      </div>
    </header>
  );
}

