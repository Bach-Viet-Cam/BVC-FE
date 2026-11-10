import { useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Dialog } from "@base-ui/react/dialog";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import logoImage from "@/assets/image/logo.png";
import { BottomTabBar } from "@/shared/components/bvc/BottomTabBar";
import { NotificationBell } from "@/shared/components/bvc/NotificationBell";
import { useAuth } from "@/shared/context/AuthContext";
import { useNewNotificationToast } from "@/shared/hooks/useNewNotificationToast";
import {
  NAV_BY_ROLE,
  TEACHER_NAV,
  TEACHER_TABS,
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

const FOCUSED_PATHS = [/\/edit$/, /\/import$/, /^\/library\/[^/]+\/sheets\//];

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
        "group relative flex min-h-[42px] shrink-0 items-center gap-3 rounded-full px-4 py-2 text-[13.5px] font-medium transition-all duration-150 short:min-h-[38px] short:py-1.5",
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
  isOpen: boolean;
  onToggle: () => void;
}

function groupHasActiveChild(group: NavGroup, allItems: NavItem[], pathname: string) {
  return group.children.some((child) => isItemActive(allItems, child, pathname));
}

function SidebarGroup({ group, allItems, pathname, isOpen, onToggle }: SidebarGroupProps) {
  const hasActiveChild = groupHasActiveChild(group, allItems, pathname);
  const Icon = group.icon;

  return (
    <div className="flex flex-col gap-1 short:gap-0.5">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className={cn(
          "group flex min-h-[42px] shrink-0 cursor-pointer items-center gap-3 rounded-full px-4 py-2 text-left text-[13.5px] font-medium transition-all duration-150 hover:bg-white/10 hover:text-white short:min-h-[38px] short:py-1.5",
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
        <div className="ml-[22px] flex flex-col gap-1 border-l border-white/15 pl-2 short:gap-0.5">
          {group.children.map((child) => (
            <SidebarLink key={child.to} item={child} isActive={isItemActive(allItems, child, pathname)} />
          ))}
        </div>
      )}
    </div>
  );
}

interface NavPanelProps {
  entries: NavEntry[];
  allItems: NavItem[];
  pathname: string;
  navLabel: string;
  displayName: string;
  roleLabel: string;
  onLogout: () => void;
}

function NavPanel({ entries, allItems, pathname, navLabel, displayName, roleLabel, onLogout }: NavPanelProps) {
  const activeGroup =
    entries.find((entry): entry is NavGroup => isNavGroup(entry) && groupHasActiveChild(entry, allItems, pathname))
      ?.label ?? null;
  const [toggle, setToggle] = useState<{ pathname: string; open: string | null } | null>(null);
  const openGroup = toggle && toggle.pathname === pathname ? toggle.open : activeGroup;

  return (
    <>
      <nav
        aria-label={navLabel}
        className="-mx-1 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-1 [scrollbar-width:thin] [scrollbar-color:rgb(255_255_255/0.2)_transparent] short:gap-0.5"
      >
        {entries.map((entry) =>
          isNavGroup(entry) ? (
            <SidebarGroup
              key={entry.label}
              group={entry}
              allItems={allItems}
              pathname={pathname}
              isOpen={openGroup === entry.label}
              onToggle={() => setToggle({ pathname, open: openGroup === entry.label ? null : entry.label })}
            />
          ) : (
            <SidebarLink key={entry.to} item={entry} isActive={isItemActive(allItems, entry, pathname)} />
          )
        )}
      </nav>
      <div className="flex shrink-0 flex-col gap-2 border-t border-white/10 pt-3 short:gap-1.5 short:pt-2">
        <Link
          to="/profile"
          className="group flex items-center gap-2.5 rounded-bvc-xl border border-white/15 bg-white/10 p-[11px] text-white transition-all duration-150 hover:bg-white/15 hover:text-white short:p-2"
        >
          <UserAvatar name={displayName} size="sm" />
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-[13.5px] font-semibold text-white transition-colors group-hover:text-bvc-accent-border">
              {displayName}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-white/60">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span className="truncate">{roleLabel}</span>
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="group flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full text-[13px] font-medium text-white/60 transition-all duration-150 hover:bg-white/10 hover:text-white active:scale-[0.99] short:min-h-9"
        >
          <LogOut className="size-4 text-white/45 transition-colors group-hover:text-white" strokeWidth={1.9} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </>
  );
}

export function TeacherShell({ children, className, navItems, roleLabel }: TeacherShellProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useNewNotificationToast(user?.role === ROLES.TEACHER);
  const effectiveRoleLabel = roleLabel ?? (user?.role === ROLES.SYSTEM_ADMIN ? "Quản trị viên" : "Giảng viên");
  const effectiveNavItems = navItems ?? (user?.role && NAV_BY_ROLE[user.role] ? NAV_BY_ROLE[user.role] : TEACHER_NAV);
  const flatItems = flattenNav(effectiveNavItems);
  const displayName = user?.username ?? effectiveRoleLabel;
  const navLabel = `Điều hướng ${effectiveRoleLabel.toLowerCase()}`;
  const showBottomNav =
    user?.role === ROLES.TEACHER && !FOCUSED_PATHS.some((pattern) => pattern.test(location.pathname));
  const panelProps = {
    entries: effectiveNavItems,
    allItems: flatItems,
    pathname: location.pathname,
    navLabel,
    displayName,
    roleLabel: effectiveRoleLabel,
    onLogout: logout,
  };

  return (
    <div className="flex min-h-dvh flex-col bg-white font-bvc-sans text-bvc-ink lg:h-dvh lg:flex-row">
      {/* Desktop: sidebar trái */}
      <aside className="hidden h-dvh w-[264px] shrink-0 flex-col gap-6 overflow-hidden bg-bvc-ink px-3.5 py-6 text-white lg:flex short:gap-4 short:py-4">
        <div className="flex shrink-0 items-center justify-between gap-2 px-1">
          <img src={logoImage} alt="Bách Việt Cầm" className="h-11 w-auto min-w-0 object-contain short:h-9" />
          <NotificationBell className={bellClass} iconClassName="size-[18px]" />
        </div>
        <NavPanel {...panelProps} />
      </aside>

      <header className="sticky top-0 z-20 shrink-0 bg-bvc-ink/95 text-white backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2.5 px-[14px] pt-[max(env(safe-area-inset-top),12px)] pb-3 sm:px-[18px]">
          <Dialog.Root open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <Dialog.Trigger
              aria-label="Mở menu"
              className={cn(
                bellClass,
                "size-11 cursor-pointer active:scale-95 data-popup-open:bg-white/20",
                showBottomNav && "hidden md:flex"
              )}
            >
              <Menu className="size-[19px]" strokeWidth={1.9} />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop className="fixed inset-0 z-50 bg-bvc-ink/50 backdrop-blur-[2px] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 lg:hidden" />
              <Dialog.Popup
                // Đóng sidebar ngay khi chọn một liên kết bên trong
                onClick={(event) => {
                  if ((event.target as HTMLElement).closest("a")) setIsMenuOpen(false);
                }}
                className="fixed inset-y-0 left-0 z-50 flex w-[min(300px,84vw)] flex-col gap-6 overflow-y-auto rounded-r-[28px] bg-bvc-ink px-3.5 pt-[max(env(safe-area-inset-top),14px)] pb-[max(env(safe-area-inset-bottom),18px)] text-white shadow-[12px_0_40px_-12px_rgb(0_0_0/0.45)] transition-transform duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)] data-ending-style:-translate-x-full data-starting-style:-translate-x-full motion-reduce:transition-none lg:hidden [scrollbar-width:thin] [scrollbar-color:rgb(255_255_255/0.2)_transparent]"
              >
                <div className="flex items-center justify-between gap-2 px-1">
                  <Dialog.Title className="sr-only">Menu</Dialog.Title>
                  <img src={logoImage} alt="Bách Việt Cầm" className="h-10 w-auto min-w-0 object-contain" />
                  <Dialog.Close
                    aria-label="Đóng menu"
                    className={cn(bellClass, "size-10 cursor-pointer active:scale-95")}
                  >
                    <X className="size-[18px]" strokeWidth={1.9} />
                  </Dialog.Close>
                </div>
                <NavPanel {...panelProps} />
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
          <Link to="/" className="mr-auto shrink-0 transition-opacity hover:opacity-85">
            <img src={logoImage} alt="Bách Việt Cầm" className="h-9 w-auto sm:h-10" />
          </Link>
          <NotificationBell className={bellClass} iconClassName="size-[18px]" />
          <Link
            to="/profile"
            aria-label={`Hồ sơ ${displayName}`}
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 transition-colors hover:bg-white/20"
          >
            <UserAvatar name={displayName} size="sm" className="size-[30px] text-[12px]" />
          </Link>
        </div>
      </header>

      {/* key theo đường dẫn: khi làm layout (Outlet), mỗi lần chuyển màn vẫn chạy hiệu ứng hiện dần */}
      <main
        key={location.pathname}
        className={cn(
          "flex min-w-0 min-h-0 flex-1 flex-col motion-safe:animate-page-enter lg:overflow-y-auto",
          showBottomNav && "pb-(--bvc-bottom-nav-h)",
          className
        )}
      >
        {children}
      </main>

      {showBottomNav && (
        <BottomTabBar
          tabs={TEACHER_TABS}
          displayName={displayName}
          onOpenMenu={() => setIsMenuOpen(true)}
          isMenuOpen={isMenuOpen}
        />
      )}
    </div>
  );
}
