import { ChevronRight } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface IssueCardProps {
  rangeLabel: string;
  title: string;
  description: string;
  highlighted?: boolean;
  onClick: () => void;
}

export function IssueCard({ rangeLabel, title, description, highlighted, onClick }: IssueCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center gap-2.75 rounded-bvc-lg border px-3.25 py-3 text-left md:gap-3.5 md:rounded-[18px] md:px-4.5 md:py-4",
        highlighted ? "border-bvc-warn/50 bg-bvc-accent-tint md:border-bvc-notice-border" : "border-bvc-border bg-white"
      )}
    >
      <span
        className={cn(
          "shrink-0 rounded-lg px-2 py-[5px] text-xs font-semibold",
          highlighted ? "bg-white/60 text-bvc-accent-text" : "bg-bvc-surface text-bvc-muted"
        )}
      >
        {rangeLabel}
      </span>
      <span className="flex flex-1 flex-col gap-px">
        <span className="text-sm font-semibold text-bvc-ink md:text-[15px]">{title}</span>
        <span className="text-[12.5px] text-bvc-muted">{description}</span>
      </span>
      <ChevronRight size={18} strokeWidth={1.8} className="shrink-0 text-bvc-faint" />
    </button>
  );
}
