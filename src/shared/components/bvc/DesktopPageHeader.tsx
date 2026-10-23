interface DesktopPageHeaderProps {
  breadcrumb?: string;
  title: string;
  actions?: React.ReactNode;
}

// Header trang giảng viên / quản trị: trên mobile thu padding và cho nút hành động xuống dòng
export function DesktopPageHeader({ breadcrumb, title, actions }: DesktopPageHeaderProps) {
  return (
    <header className="flex shrink-0 flex-wrap items-end justify-between gap-x-[24px] gap-y-[12px] border-b border-bvc-border-strong px-[18px] pt-[20px] pb-[16px] md:px-[32px] md:pt-[26px] md:pb-[18px]">
      <div className="flex min-w-0 flex-col gap-[5px]">
        {breadcrumb && (
          <div className="text-[12px] font-bold tracking-[0.14em] text-bvc-muted uppercase">{breadcrumb}</div>
        )}
        <h1 className="m-0 font-bvc-display text-[24px] leading-tight font-extrabold tracking-[-0.025em] md:text-[29px]">
          {title}
        </h1>
      </div>
      {actions && <div className="flex flex-wrap gap-[10px]">{actions}</div>}
    </header>
  );
}
