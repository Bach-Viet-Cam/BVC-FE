import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

interface SubmissionPageTitleProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightSlot?: ReactNode;
}

// Tiêu đề trang nằm dưới header sinh viên (StudentShell): nút quay lại tùy chọn, tên màn, phụ đề
export function SubmissionPageTitle({ title, subtitle, onBack, rightSlot }: SubmissionPageTitleProps) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      {onBack && (
        <button
          type="button"
          aria-label="Quay lại"
          onClick={onBack}
          className="-ml-2 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-bvc-md text-bvc-ink"
        >
          <ChevronLeft size={21} strokeWidth={1.8} />
        </button>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h1 className="truncate text-[27px] leading-tight font-extrabold tracking-[-0.025em] text-bvc-ink md:text-[32px]">
          {title}
        </h1>
        {subtitle && <p className="text-[13px] text-bvc-muted">{subtitle}</p>}
      </div>
      {rightSlot}
    </div>
  );
}
