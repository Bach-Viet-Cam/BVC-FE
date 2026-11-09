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
  // Thu nhỏ theo điện thoại (dưới md) để hai thẻ nằm chung một dòng; từ md giữ cỡ thường
  compact?: boolean;
}

export function CollapsibleCard({
  label,
  summary,
  open,
  onToggle,
  children,
  className,
  compact,
}: CollapsibleCardProps) {
  return (
    <section
      className={cn(
        "flex shrink-0 flex-col rounded-bvc-xl border border-bvc-border bg-white md:rounded-bvc-xl",
        className
      )}
    >
      <div
        className={cn(
          "flex min-h-11 items-center gap-2 pr-1.5 pl-3.5 md:min-h-14 md:pl-6",
          compact && "max-md:min-h-9 max-md:pr-0.5 max-md:pl-2.5"
        )}
      >
        <span className="text-[11.5px] font-semibold text-bvc-muted">{label}</span>
        <span className="flex-1" />
        {summary}
        <button
          type="button"
          aria-label={`Thu gọn hoặc mở rộng phần ${label.toLowerCase()}`}
          aria-expanded={open}
          onClick={onToggle}
          className={cn(
            "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-bvc-ink",
            compact && "max-md:size-8"
          )}
        >
          <ChevronDown size={18} strokeWidth={2} className={cn("transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {/* flex-1: khi thẻ được kéo cao bằng thẻ bên cạnh, phần nội dung giãn theo */}
      {open && (
        <div
          className={cn(
            "flex flex-1 flex-col gap-[11px] px-3.5 pb-3.5 md:gap-4.5 md:px-6 md:pb-6",
            compact && "max-md:gap-3.5 max-md:px-2.5 max-md:pb-2.5"
          )}
        >
          {children}
        </div>
      )}
    </section>
  );
}
