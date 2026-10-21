import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface CollapsibleCardProps {
  label: string;
  summary?: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
}

export function CollapsibleCard({ label, summary, open, onToggle, children, className }: CollapsibleCardProps) {
  return (
    <section className={cn("shrink-0 rounded-[18px] border border-bvc-border bg-white md:rounded-[22px]", className)}>
      <div className="flex min-h-11 items-center gap-2 pr-1.5 pl-3.5 md:min-h-14 md:pl-6">
        <span className="text-[11.5px] font-bold tracking-[0.12em] text-bvc-muted uppercase">{label}</span>
        <span className="flex-1" />
        {summary}
        <button
          type="button"
          aria-label={`Thu gọn hoặc mở rộng phần ${label.toLowerCase()}`}
          aria-expanded={open}
          onClick={onToggle}
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-bvc-ink"
        >
          <ChevronDown size={18} strokeWidth={2} className={cn("transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {open && <div className="flex flex-col gap-[11px] px-3.5 pb-3.5 md:gap-4.5 md:px-6 md:pb-6">{children}</div>}
    </section>
  );
}
