import type { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { NotificationBell } from "@/shared/components/bvc/NotificationBell";
import { useAuth } from "@/shared/context/AuthContext";
import { TEACHER_NAV, type NavItem } from "@/shared/config/navConfig";
import { UserAvatar } from "@/shared/components/bvc/UserAvatar";
import { cn } from "@/shared/utils/cn";

interface TeacherShellProps {
  children: ReactNode;
  className?: string;
  // Quản trị viên dùng lại khung này với menu và nhãn vai trò riêng
  navItems?: NavItem[];
  roleLabel?: string;
}

const bellClass =
  "flex size-10 shrink-0 items-center justify-center rounded-bvc-md border border-bvc-border bg-white text-bvc-ink hover:text-bvc-ink";

// Mục cha (vd. /admin) chỉ sáng khi đúng đường dẫn, để không sáng cùng lúc với mục con /admin/users
function isParentItem(items: NavItem[], item: NavItem) {
  return items.some((other) => other.to.startsWith(`${item.to}/`));
}

export function TeacherShell({
  children,
  className,
  navItems = TEACHER_NAV,
  roleLabel = "Giảng viên",
}: TeacherShellProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const displayName = user?.username ?? roleLabel;
  const navLabel = `Điều hướng ${roleLabel.toLowerCase()}`;

  return (
    <div className="flex min-h-dvh flex-col bg-white font-bvc-sans text-bvc-ink lg:h-dvh lg:flex-row">
      {/* Desktop: sidebar trái */}
      <aside className="hidden w-[236px] shrink-0 flex-col gap-[26px] overflow-y-auto border-r border-bvc-border bg-bvc-surface px-4 py-6 lg:flex">
        <div className="flex items-center justify-between gap-2 pl-1.5">
          <span className="text-[17px] font-extrabold tracking-[-0.02em]">Bách Việt Cầm</span>
          <NotificationBell className={bellClass} iconClassName="size-[18px]" />
        </div>
        <nav aria-label={navLabel} className="flex flex-col gap-[3px]">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={isParentItem(navItems, item)}
              className={({ isActive }) =>
                cn(
                  "flex min-h-11 items-center rounded-[13px] px-3 text-sm",
                  isActive
                    ? "bg-bvc-ink font-semibold text-white hover:text-white"
                    : "text-bvc-muted hover:bg-bvc-border hover:text-bvc-ink"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          <Link
            to="/profile"
            className="flex items-center gap-2.5 rounded-2xl border border-bvc-border bg-white p-[13px] text-bvc-ink hover:text-bvc-ink"
          >
            <UserAvatar name={displayName} size="sm" />
            <span className="flex min-w-0 flex-col gap-px">
              <span className="truncate text-[13.5px] font-bold">{displayName}</span>
              <span className="text-xs text-bvc-muted">{roleLabel}</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={logout}
            className="min-h-10 cursor-pointer rounded-[13px] text-[13.5px] font-semibold text-bvc-muted hover:bg-bvc-border"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Mobile / tablet: thanh trên + nav cuộn ngang */}
      <header className="sticky top-0 z-20 shrink-0 border-b border-bvc-border bg-white lg:hidden">
        <div className="flex items-center gap-2.5 px-[18px] pt-[max(env(safe-area-inset-top),22px)]">
          <span className="flex-1 text-[19px] font-extrabold tracking-[-0.02em]">Bách Việt Cầm</span>
          <NotificationBell className={bellClass} iconClassName="size-[18px]" />
          <Link to="/profile" aria-label={`Hồ sơ ${displayName}`}>
            <UserAvatar name={displayName} size="sm" />
          </Link>
        </div>
        <nav aria-label={navLabel} className="mt-3 flex gap-4 overflow-x-auto px-[18px] [scrollbar-width:none]">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={isParentItem(navItems, item)}
              className={({ isActive }) =>
                cn(
                  "-mb-px flex min-h-11 shrink-0 items-center border-b-2 text-sm whitespace-nowrap",
                  isActive
                    ? "border-bvc-ink font-bold text-bvc-ink hover:text-bvc-ink"
                    : "border-transparent text-bvc-muted hover:text-bvc-ink"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* key theo đường dẫn: khi làm layout (Outlet), mỗi lần chuyển màn vẫn chạy hiệu ứng hiện dần */}
      <main
        key={location.pathname}
        className={cn("flex min-w-0 flex-1 flex-col motion-safe:animate-page-enter lg:overflow-y-auto", className)}
      >
        {children}
      </main>
    </div>
  );
}
