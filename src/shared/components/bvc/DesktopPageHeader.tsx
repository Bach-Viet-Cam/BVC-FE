interface DesktopPageHeaderProps {
  breadcrumb?: string;
  title: string;
  actions?: React.ReactNode;
}

export function DesktopPageHeader({ breadcrumb, title, actions }: DesktopPageHeaderProps) {
  return (
    <header className="flex shrink-0 items-end justify-between gap-[24px] border-b border-bvc-border-strong px-[32px] pb-[18px] pt-[26px]">
      <div className="flex flex-col gap-[5px]">
        {breadcrumb && (
          <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-bvc-muted">
            {breadcrumb}
          </div>
        )}
        <div className="text-[29px] font-extrabold tracking-[-0.025em]">{title}</div>
      </div>
      {actions && <div className="flex gap-[10px]">{actions}</div>}
    </header>
  );
}
