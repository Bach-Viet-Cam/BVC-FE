import { PageTitle } from "@/shared/components/bvc/PageTitle";
import { Eyebrow } from "@/shared/components/bvc/SectionIntro";

interface DesktopPageHeaderProps {
  breadcrumb?: string;
  title: string;
  actions?: React.ReactNode;
}

// Header trang giảng viên / quản trị: trên mobile thu padding và cho nút hành động xuống dòng
export function DesktopPageHeader({ breadcrumb, title, actions }: DesktopPageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex shrink-0 flex-wrap items-end justify-between gap-x-[24px] gap-y-[12px] border-b border-bvc-border bg-white px-[18px] pt-[20px] pb-[16px] md:px-[32px] md:pt-[28px] md:pb-[20px]">
      <div className="flex min-w-0 flex-col gap-2">
        {breadcrumb && <Eyebrow>{breadcrumb}</Eyebrow>}
        <PageTitle>{title}</PageTitle>
      </div>
      {actions && <div className="flex flex-wrap gap-[10px]">{actions}</div>}
    </header>
  );
}
