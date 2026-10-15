import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface FocusHeaderProps {
  backTo: string;
  backLabel: string;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

// Header cho màn tác vụ tập trung (form, quản lý chi tiết): không sidebar, chỉ nút quay lại + hành động
export function FocusHeader({ backTo, backLabel, title, subtitle, actions }: FocusHeaderProps) {
  return (
    <header className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-3 border-b border-bvc-border px-[18px] pt-5 pb-4 md:px-8 md:pb-[18px]">
      <Link
        to={backTo}
        aria-label={backLabel}
        className="flex size-11 shrink-0 items-center justify-center rounded-bvc-md border border-bvc-border-strong text-bvc-ink hover:bg-bvc-surface hover:text-bvc-ink"
      >
        <ChevronLeft className="size-5" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h1 className="truncate text-xl leading-tight font-extrabold tracking-[-0.025em] text-bvc-ink md:text-[26px]">
          {title}
        </h1>
        {subtitle && <span className="truncate text-[13.5px] text-bvc-muted">{subtitle}</span>}
      </div>
      {actions && <div className="flex w-full gap-2 sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">{actions}</div>}
    </header>
  );
}
