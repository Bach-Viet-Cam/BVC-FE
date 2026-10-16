import { Bell } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/shared/utils/cn";

interface AdminShellProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

// System Admin desktop layout from UI/Giám sát hệ thống-html.
const ADMIN_NAV = [
  { label: "Tổng quan", to: "/admin" },
  { label: "Người dùng", to: "/admin/users" },
  { label: "Nội dung & danh mục", to: "/admin/categories" },
  { label: "Lộ trình học tập", to: "/admin/roadmaps" },
  { label: "Cấu hình chấm điểm", to: "/admin/grading-settings" },
  { label: "Thông báo", to: "/admin/notifications" },
  { label: "Giám sát hệ thống", to: "/admin/monitoring" },
  { label: "Cấu hình", to: "/admin/config" },
];

export function AdminShell({ title, subtitle, actions, children }: AdminShellProps) {
  return (
    <div className="flex min-h-dvh w-full bg-white font-bvc-sans text-bvc-ink">
      <aside className="flex w-[236px] shrink-0 flex-col gap-[26px] border-r border-bvc-border bg-bvc-soft px-[16px] py-[24px]">
        <div className="flex items-center justify-between pl-[6px]">
          <span className="text-[17px] font-extrabold">Bách Việt Cầm</span>
          <button
            type="button"
            disabled
            aria-label="Thông báo"
            className="flex size-[40px] shrink-0 items-center justify-center rounded-[14px] border border-bvc-border bg-white text-bvc-ink disabled:cursor-not-allowed"
          >
            <Bell size={18} strokeWidth={1.6} />
          </button>
        </div>
        <nav aria-label="Điều hướng quản trị" className="flex flex-col gap-[3px]">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                cn(
                  "flex min-h-[44px] items-center rounded-[13px] px-[12px] text-[14px]",
                  isActive ? "bg-bvc-ink font-semibold text-white" : "text-bvc-muted hover:bg-white"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-[10px] rounded-[16px] border border-bvc-border bg-white p-[13px]">
          <span className="flex size-[34px] items-center justify-center rounded-full bg-bvc-accent-tint text-[13px] font-bold text-bvc-accent-text">
            QT
          </span>
          <span className="flex flex-col">
            <span className="text-[13.5px] font-bold">Quản trị hệ thống</span>
            <span className="text-[12px] text-bvc-muted">System Admin</span>
          </span>
        </div>
      </aside>
      <main className="flex min-w-0 grow flex-col gap-[18px] px-[32px] py-[26px]">
        <div className="flex items-end gap-[12px]">
          <div className="flex grow flex-col gap-[4px]">
            <h1 className="m-0 text-[32px] font-extrabold tracking-[-0.03em]">{title}</h1>
            {subtitle && <span className="text-[14px] text-bvc-muted">{subtitle}</span>}
          </div>
          {actions}
        </div>
        {children}
      </main>
    </div>
  );
}
