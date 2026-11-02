import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { PageTitle } from "@/shared/components/bvc/PageTitle";

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
          className="-ml-2 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-bvc-ink transition-colors hover:bg-bvc-surface"
        >
          <ChevronLeft size={21} strokeWidth={1.8} />
        </button>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <PageTitle className="truncate">{title}</PageTitle>
        {subtitle && <p className="text-[13px] text-bvc-muted">{subtitle}</p>}
      </div>
      {rightSlot}
    </div>
  );
}
