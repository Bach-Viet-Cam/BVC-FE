import { useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, LogOut, Music2 } from "lucide-react";
import { NotificationBell } from "@/shared/components/bvc/NotificationBell";
import { useAuth } from "@/shared/context/AuthContext";
import {
  NAV_BY_ROLE,
  TEACHER_NAV,
  flattenNav,
  isNavGroup,
  type NavEntry,
  type NavGroup,
  type NavItem,
} from "@/shared/config/navConfig";
import { ROLES } from "@/shared/constants/roles";
import { UserAvatar } from "@/shared/components/bvc/UserAvatar";
import { cn } from "@/shared/utils/cn";

interface TeacherShellProps {
  children: ReactNode;
  className?: string;
  // Quản trị viên dùng lại khung này với menu và nhãn vai trò riêng
  navItems?: NavEntry[];
  roleLabel?: string;
}

const bellClass =
  "flex size-10 shrink-0 items-center justify-center rounded-bvc-md border border-bvc-border bg-white text-bvc-ink hover:text-bvc-ink hover:border-bvc-border-strong transition-colors";

function matchesPath(pathname: string, to: string, end: boolean) {
  return pathname === to || (!end && pathname.startsWith(`${to}/`));
}

// Mục cha (vd. /admin) chỉ sáng khi đúng đường dẫn, để không sáng cùng lúc với mục con /admin/users
function isItemActive(items: NavItem[], item: NavItem, pathname: string) {
  const isParent = items.some((other) => other.to.startsWith(`${item.to}/`));
  return (
    matchesPath(pathname, item.to, isParent) ||
    (item.activePrefixes ?? []).some((prefix) => matchesPath(pathname, prefix, false))
  );
}

interface SidebarLinkProps {
  item: NavItem;
  isActive: boolean;
}

function SidebarLink({ item, isActive }: SidebarLinkProps) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      className={cn(
        "group relative flex min-h-[42px] items-center gap-3 rounded-[13px] px-3.5 py-2 text-[13.5px] font-semibold transition-all duration-150",
        isActive
          ? "bg-bvc-ink font-bold text-white shadow-xs"
          : "text-bvc-muted hover:bg-white hover:text-bvc-ink hover:shadow-2xs active:scale-[0.99]"
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            "size-[18px] shrink-0 transition-transform duration-150 group-hover:scale-110",
            isActive ? "text-emerald-300" : "text-bvc-faint group-hover:text-bvc-ink"
          )}
          strokeWidth={isActive ? 2.2 : 1.9}
        />
      )}
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
}

interface SidebarGroupProps {
  group: NavGroup;
  allItems: NavItem[];
  pathname: string;
}

// Nhóm menu thu gọn được, tự mở khi đang ở một trang con của nhóm
function SidebarGroup({ group, allItems, pathname }: SidebarGroupProps) {
  const hasActiveChild = group.children.some((child) => isItemActive(allItems, child, pathname));
  const [toggled, setToggled] = useState<boolean | null>(null);
  const isOpen = toggled ?? hasActiveChild;
  const Icon = group.icon;

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setToggled(!isOpen)}
        className={cn(
          "group flex min-h-[42px] cursor-pointer items-center gap-3 rounded-[13px] px-3.5 py-2 text-left text-[13.5px] font-semibold transition-all duration-150 hover:bg-white hover:text-bvc-ink hover:shadow-2xs",
          hasActiveChild ? "text-bvc-ink" : "text-bvc-muted"
        )}
      >
        {Icon && (
          <Icon
            className={cn(
              "size-[18px] shrink-0 transition-transform duration-150 group-hover:scale-110",
              hasActiveChild ? "text-bvc-ink" : "text-bvc-faint group-hover:text-bvc-ink"
            )}
            strokeWidth={1.9}
          />
        )}
        <span className="flex-1 truncate">{group.label}</span>
        <ChevronDown
          aria-hidden
          strokeWidth={1.9}
          className={cn("size-4 shrink-0 text-bvc-faint transition-transform", isOpen && "rotate-180")}
        />
      </button>
      {isOpen && (
        <div className="ml-[22px] flex flex-col gap-1 border-l border-bvc-border pl-2">
          {group.children.map((child) => (
            <SidebarLink key={child.to} item={child} isActive={isItemActive(allItems, child, pathname)} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TeacherShell({ children, className, navItems, roleLabel }: TeacherShellProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const effectiveRoleLabel = roleLabel ?? (user?.role === ROLES.SYSTEM_ADMIN ? "Quản trị viên" : "Giảng viên");
  const effectiveNavItems = navItems ?? (user?.role && NAV_BY_ROLE[user.role] ? NAV_BY_ROLE[user.role] : TEACHER_NAV);
  const flatItems = flattenNav(effectiveNavItems);
  const displayName = user?.username ?? effectiveRoleLabel;
  const navLabel = `Điều hướng ${effectiveRoleLabel.toLowerCase()}`;

  return (
    <div className="flex min-h-dvh flex-col bg-white font-bvc-sans text-bvc-ink lg:h-dvh lg:flex-row">
      {/* Desktop: sidebar trái */}
      <aside className="hidden w-[260px] shrink-0 flex-col gap-6 overflow-y-auto border-r border-bvc-border bg-bvc-surface/90 px-3.5 py-6 lg:flex [scrollbar-width:thin] [scrollbar-color:var(--color-bvc-bar)_transparent]">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-bvc-ink text-emerald-300 shadow-xs">
              <Music2 className="size-[17px]" strokeWidth={2.4} />
            </div>
            <span className="truncate text-[17px] font-extrabold tracking-[-0.02em] text-bvc-ink font-bvc-display">
              Bách Việt Cầm
            </span>
          </div>
          <NotificationBell className={bellClass} iconClassName="size-[18px]" />
        </div>
        <nav aria-label={navLabel} className="flex flex-col gap-1">
          {effectiveNavItems.map((entry) =>
            isNavGroup(entry) ? (
              <SidebarGroup key={entry.label} group={entry} allItems={flatItems} pathname={location.pathname} />
            ) : (
              <SidebarLink key={entry.to} item={entry} isActive={isItemActive(flatItems, entry, location.pathname)} />
            )
          )}
        </nav>
        <div className="mt-auto flex flex-col gap-2 pt-3 border-t border-bvc-border/70">
          <Link
            to="/profile"
            className="group flex items-center gap-2.5 rounded-2xl border border-bvc-border bg-white p-[11px] text-bvc-ink shadow-2xs transition-all duration-150 hover:border-bvc-border-strong hover:shadow-xs"
          >
            <UserAvatar name={displayName} size="sm" />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-[13.5px] font-bold text-bvc-ink group-hover:text-bvc-accent transition-colors">
                {displayName}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-bvc-muted">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="truncate">{effectiveRoleLabel}</span>
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={logout}
            className="group flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-[13px] text-[13px] font-semibold text-bvc-muted transition-all duration-150 hover:bg-red-50 hover:text-red-700 active:scale-[0.99]"
          >
            <LogOut className="size-4 text-bvc-faint transition-colors group-hover:text-red-600" strokeWidth={1.9} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Mobile / tablet: thanh trên + nav cuộn ngang (nhóm được trải phẳng) */}
      <header className="sticky top-0 z-20 shrink-0 border-b border-bvc-border bg-white lg:hidden">
        <div className="flex items-center gap-2.5 px-[18px] pt-[max(env(safe-area-inset-top),22px)]">
          <span className="flex-1 text-[19px] font-extrabold tracking-[-0.02em]">Bách Việt Cầm</span>
          <NotificationBell className={bellClass} iconClassName="size-[18px]" />
          <Link to="/profile" aria-label={`Hồ sơ ${displayName}`}>
            <UserAvatar name={displayName} size="sm" />
          </Link>
        </div>
        <nav aria-label={navLabel} className="mt-3 flex gap-4 overflow-x-auto px-[18px] [scrollbar-width:none]">
          {flatItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(flatItems, item, location.pathname);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "-mb-px flex min-h-11 shrink-0 items-center gap-2 border-b-2 text-sm whitespace-nowrap transition-colors",
                  isActive
                    ? "border-bvc-ink font-bold text-bvc-ink hover:text-bvc-ink"
                    : "border-transparent text-bvc-muted hover:text-bvc-ink"
                )}
              >
                {Icon && (
                  <Icon
                    className={cn("size-4 shrink-0 transition-colors", isActive ? "text-bvc-ink" : "text-bvc-faint")}
                    strokeWidth={isActive ? 2.2 : 1.9}
                  />
                )}
                <span>{item.label}</span>
              </NavLink>
            );
          })}
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
