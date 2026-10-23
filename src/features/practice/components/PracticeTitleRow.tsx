import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PracticeTitleRowProps {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
}

// Hàng tiêu đề của màn ghi âm, nằm dưới header chung của sinh viên (StudentShell)
export function PracticeTitleRow({ title, subtitle, rightSlot }: PracticeTitleRowProps) {
  const navigate = useNavigate();

  return (
    <div className="flex shrink-0 items-center gap-3.5 px-3.5 pt-4 md:px-0 md:pt-0">
      <button
        type="button"
        aria-label="Quay lại"
        onClick={() => navigate(-1)}
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-bvc-md border border-bvc-border text-bvc-ink hover:bg-bvc-surface"
      >
        <ChevronLeft className="size-5" strokeWidth={1.8} />
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h1 className="truncate font-bvc-display text-lg leading-tight font-extrabold tracking-[-0.02em] text-bvc-ink md:text-[22px]">
          {title}
        </h1>
        {subtitle && <span className="truncate text-[13px] text-bvc-muted">{subtitle}</span>}
      </div>
      {rightSlot}
    </div>
  );
}
