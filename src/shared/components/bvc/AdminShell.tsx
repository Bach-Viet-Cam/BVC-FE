import { PageHeader } from "@/shared/components/bvc/PageHeader";

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
      <PageHeader title={title} description={subtitle} actions={actions} />
      {children}
    </div>
  );
}
