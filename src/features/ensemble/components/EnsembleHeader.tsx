import { Music2, X } from "lucide-react";
import { PageTitle } from "@/shared/components/bvc/PageTitle";

interface EnsembleHeaderProps {
  title: string;
  subtitle?: string;
  deadline: string | null;
  onClose: () => void;
}

export function EnsembleHeader({ title, subtitle, deadline, onClose }: EnsembleHeaderProps) {
  return (
    <header className="flex min-h-14 flex-wrap gap-2 py-2 shrink-0 items-center justify-between bg-bvc-ink px-4 text-white md:h-14 md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          aria-label="Đóng"
          onClick={onClose}
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <X size={18} strokeWidth={2} />
        </button>
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="hidden items-center gap-1 rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 text-[11.5px] font-medium text-bvc-accent-border sm:inline-flex">
            <Music2 size={12} strokeWidth={2.4} />
            Hòa tấu
          </span>
          <div className="flex min-w-0 flex-col">
            <PageTitle size="compact" tone="dark" className="whitespace-normal break-words">
              {title}
            </PageTitle>
            {subtitle && <p className="hidden truncate text-[11.5px] text-white/70 sm:block">{subtitle}</p>}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        {deadline && (
          <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[12px]">
            <span className="text-bvc-muted">Hạn:</span>
            <span className="font-bvc-mono font-semibold text-bvc-ink">{deadline}</span>
          </div>
        )}
      </div>
    </header>
  );
}
