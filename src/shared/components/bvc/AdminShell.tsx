interface AdminShellProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

// Khung nội dung trang quản trị, đặt trong DesktopLayout (menu do TeacherShell render).
// Trên web tự cuộn cạnh sidebar, trên mobile chạy theo luồng trang bình thường.
export function AdminShell({ title, subtitle, actions, children }: AdminShellProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[18px] bg-white px-[18px] py-[20px] font-bvc-sans text-bvc-ink md:px-[32px] md:py-[26px] lg:min-h-0 lg:overflow-y-auto">
      <div className="flex flex-wrap items-end gap-[12px]">
        <div className="flex min-w-0 grow flex-col gap-[4px]">
          <h1 className="m-0 text-[26px] leading-tight font-extrabold tracking-[-0.03em] md:text-[32px]">{title}</h1>
          {subtitle && <span className="text-[14px] text-bvc-muted">{subtitle}</span>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}
