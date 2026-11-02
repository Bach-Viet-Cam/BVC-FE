import { ChevronLeft } from "lucide-react";
import { PageTitle } from "@/shared/components/bvc/PageTitle";

interface TeacherPageHeaderProps {
  title: string;
  // Context line: under the title on phones, as the breadcrumb above it on web.
  subtitle?: string;
  onBack: () => void;
  actions?: React.ReactNode;
}

// Web-first header of lecturer sub-pages (same look as DesktopPageHeader + a back button),
// collapsing to the PWA header below lg.
export function TeacherPageHeader({ title, subtitle, onBack, actions }: TeacherPageHeaderProps) {
  return (
    <header className="flex shrink-0 items-center gap-[8px] px-[14px] pt-[26px] pb-[10px] lg:gap-4 lg:border-b lg:border-bvc-border lg:px-[32px] lg:py-5">
      <button
        type="button"
        aria-label="Quay lại"
        onClick={onBack}
        className="flex size-[44px] shrink-0 cursor-pointer items-center justify-center rounded-full text-bvc-ink transition-colors hover:bg-bvc-surface lg:size-[42px] lg:border lg:border-bvc-border-strong lg:bg-white"
      >
        <ChevronLeft size={20} strokeWidth={1.9} />
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-[1px] lg:gap-[3px]">
        <PageTitle size="bar">{title}</PageTitle>
        {subtitle && (
          <span className="truncate text-[12px] text-bvc-muted lg:order-first lg:text-[13px] lg:font-medium lg:text-bvc-accent">
            {subtitle}
          </span>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-[10px]">{actions}</div>}
    </header>
  );
}
