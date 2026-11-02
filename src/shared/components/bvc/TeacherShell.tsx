import { useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, LogOut } from "lucide-react";
import logoImage from "@/assets/image/logo.png";
import { NotificationBell } from "@/shared/components/bvc/NotificationBell";
import { useAuth } from "@/shared/context/AuthContext";
import { useNewNotificationToast } from "@/shared/hooks/useNewNotificationToast";
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

// Nút chuông dạng kính mờ trên nền sidebar / header tối
const bellClass =
  "flex size-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20 hover:text-white";

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
    <Link
      to={item.to}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative flex min-h-[42px] items-center gap-3 rounded-full px-4 py-2 text-[13.5px] font-medium transition-all duration-150",
        isActive
          ? "bg-white font-semibold text-bvc-ink shadow-xs hover:text-bvc-ink"
          : "text-white/70 hover:bg-white/10 hover:text-white active:scale-[0.99]"
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            "size-[18px] shrink-0 transition-transform duration-150 group-hover:scale-110",
            isActive ? "text-bvc-accent" : "text-white/45 group-hover:text-white"
          )}
          strokeWidth={isActive ? 2.2 : 1.9}
        />
      )}
      <span className="truncate">{item.label}</span>
    </Link>
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
          "group flex min-h-[42px] cursor-pointer items-center gap-3 rounded-full px-4 py-2 text-left text-[13.5px] font-medium transition-all duration-150 hover:bg-white/10 hover:text-white",
          hasActiveChild ? "text-white" : "text-white/70"
        )}
      >
        {Icon && (
          <Icon
            className={cn(
              "size-[18px] shrink-0 transition-transform duration-150 group-hover:scale-110",
              hasActiveChild ? "text-bvc-accent-border" : "text-white/45 group-hover:text-white"
            )}
            strokeWidth={1.9}
          />
        )}
        <span className="flex-1 truncate">{group.label}</span>
        <ChevronDown
          aria-hidden
          strokeWidth={1.9}
          className={cn("size-4 shrink-0 text-white/45 transition-transform", isOpen && "rotate-180")}
        />
      </button>
      {isOpen && (
        <div className="ml-[22px] flex flex-col gap-1 border-l border-white/15 pl-2">
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
  useNewNotificationToast(user?.role === ROLES.TEACHER);
  const effectiveRoleLabel = roleLabel ?? (user?.role === ROLES.SYSTEM_ADMIN ? "Quản trị viên" : "Giảng viên");
  const effectiveNavItems = navItems ?? (user?.role && NAV_BY_ROLE[user.role] ? NAV_BY_ROLE[user.role] : TEACHER_NAV);
  const flatItems = flattenNav(effectiveNavItems);
  const displayName = user?.username ?? effectiveRoleLabel;
  const navLabel = `Điều hướng ${effectiveRoleLabel.toLowerCase()}`;

  return (
    <div className="flex min-h-dvh flex-col bg-white font-bvc-sans text-bvc-ink lg:h-dvh lg:flex-row">
      {/* Desktop: sidebar trái */}
      <aside className="hidden w-[264px] shrink-0 flex-col gap-6 overflow-y-auto bg-bvc-ink px-3.5 py-6 text-white lg:flex [scrollbar-width:thin] [scrollbar-color:rgb(255_255_255/0.2)_transparent]">
        <div className="flex items-center justify-between gap-2 px-1">
          <img src={logoImage} alt="Bách Việt Cầm" className="h-11 w-auto min-w-0 object-contain" />
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
        <div className="mt-auto flex flex-col gap-2 border-t border-white/10 pt-3">
          <Link
            to="/profile"
            className="group flex items-center gap-2.5 rounded-bvc-xl border border-white/15 bg-white/10 p-[11px] text-white transition-all duration-150 hover:bg-white/15 hover:text-white"
          >
            <UserAvatar name={displayName} size="sm" />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-[13.5px] font-semibold text-white transition-colors group-hover:text-bvc-accent-border">
                {displayName}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-white/60">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="truncate">{effectiveRoleLabel}</span>
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={logout}
            className="group flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full text-[13px] font-medium text-white/60 transition-all duration-150 hover:bg-white/10 hover:text-white active:scale-[0.99]"
          >
            <LogOut className="size-4 text-white/45 transition-colors group-hover:text-white" strokeWidth={1.9} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Mobile / tablet: thanh trên + nav cuộn ngang (nhóm được trải phẳng) */}
      <header className="sticky top-0 z-20 shrink-0 bg-bvc-ink pb-3 text-white lg:hidden">
        <div className="flex items-center gap-2.5 px-[18px] pt-[max(env(safe-area-inset-top),22px)]">
          <img src={logoImage} alt="Bách Việt Cầm" className="mr-auto h-10 w-auto" />
          <NotificationBell className={bellClass} iconClassName="size-[18px]" />
          <Link to="/profile" aria-label={`Hồ sơ ${displayName}`}>
            <UserAvatar name={displayName} size="sm" />
          </Link>
        </div>
        <nav aria-label={navLabel} className="mt-3 flex gap-1.5 overflow-x-auto px-[18px] [scrollbar-width:none]">
          {flatItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(flatItems, item, location.pathname);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-white font-semibold text-bvc-ink hover:text-bvc-ink"
                    : "font-medium text-white/75 hover:bg-white/10 hover:text-white"
                )}
              >
                {Icon && (
                  <Icon
                    className={cn("size-4 shrink-0 transition-colors", isActive ? "text-bvc-accent" : "text-white/50")}
                    strokeWidth={isActive ? 2.2 : 1.9}
                  />
                )}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* key theo đường dẫn: khi làm layout (Outlet), mỗi lần chuyển màn vẫn chạy hiệu ứng hiện dần */}
      <main
        key={location.pathname}
        className={cn("flex min-w-0 min-h-0 flex-1 flex-col motion-safe:animate-page-enter lg:overflow-y-auto", className)}
      >
        {children}
      </main>
    </div>
  );
}
