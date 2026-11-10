import type { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Bookmark, LibraryBig, LogIn } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { useViewerRole } from "@/shared/hooks/useViewerRole";
import { NotificationBell } from "@/shared/components/bvc/NotificationBell";
import { BottomTabBar } from "@/shared/components/bvc/BottomTabBar";
import { STUDENT_TABS } from "@/shared/config/navConfig";
import { UserAvatar } from "@/shared/components/bvc/UserAvatar";
import logoImage from "@/assets/image/logo.png";
import { PillLink } from "@/shared/components/bvc/PillLink";
import { getRoleHome } from "@/shared/utils/roleHome";
import { cn } from "@/shared/utils/cn";

interface StudentShellProps {
  children: ReactNode;
  className?: string;
}

// Luyện tập bắt đầu từ một bản nhạc trong Thư viện (SheetPage), nên không có mục menu riêng
const NAV_ITEMS = [
  { label: "Hôm nay", to: "/home" },
  { label: "Thư viện", to: "/library" },
  { label: "Bài tập", to: "/assignments" },
  { label: "Lịch sử", to: "/practice/submissions" },
  { label: "Trợ giúp", to: "/help" },
];

// Giảng viên / quản trị viên chỉ ghé thư viện công khai, các mục sinh viên ở trên sẽ trả 403
const STAFF_NAV_ITEMS = [{ label: "Thư viện", to: "/library" }];

const GUEST_NAV_ITEMS = [
  { label: "Thư viện", to: "/library" },
  { label: "Trợ giúp", to: "/help" },
];

const ROLE_FALLBACK_NAMES = { student: "Sinh viên", teacher: "Giảng viên", admin: "Quản trị viên", guest: "Khách" };

const FOCUSED_PATHS = [
  /^\/practice\/sheets\//,
  /^\/practice\/submissions\/[^/]+/,
  /^\/assignment\//,
  /^\/community\/bonus\/[^/]+/,
  /^\/ensemble\//,
  /^\/library\/[^/]+\/sheets\//,
  /^\/library\/upload/,
];

// Nút biểu tượng dạng kính mờ trên nền header tối
const iconLinkClass =
  "flex size-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20 hover:text-white md:size-11";

export function StudentShell({ children, className }: StudentShellProps) {
  const { user } = useAuth();
  const role = useViewerRole();
  const location = useLocation();
  const displayName = user?.username ?? ROLE_FALLBACK_NAMES[role];
  const isStaff = role === "teacher" || role === "admin";
  const isStudent = role === "student";
  const isGuest = role === "guest";
  const homePath = user ? getRoleHome(user.role) : "/library";
  const navItems = isStaff
    ? [{ label: "Trang chủ", to: homePath }, ...STAFF_NAV_ITEMS]
    : isGuest
      ? GUEST_NAV_ITEMS
      : NAV_ITEMS;
  const loginState = { from: `${location.pathname}${location.search}` };
  const showBottomNav = isStudent && !FOCUSED_PATHS.some((pattern) => pattern.test(location.pathname));

  return (
    <div className="flex min-h-dvh flex-col bg-white font-bvc-sans text-bvc-ink">
      <header className="shrink-0 bg-bvc-ink text-white">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center gap-2.5 px-[18px] pt-[max(env(safe-area-inset-top),18px)] pb-3 md:h-[72px] md:flex-nowrap md:gap-8 md:px-14 md:py-0">
          <Link to={homePath} className="mr-auto shrink-0 transition-opacity hover:opacity-85 md:mr-0">
            <img src={logoImage} alt="Bách Việt Cầm" className="h-10 w-auto md:h-11" />
          </Link>

          <nav
            aria-label="Điều hướng chính"
            className={cn(
              "flex gap-1.5 overflow-x-auto [scrollbar-width:none] md:flex md:w-auto md:flex-1",
              isGuest
                ? "gap-1 md:gap-1.5"
                : "order-last -mx-[18px] mt-2 w-[calc(100%+36px)] px-[18px] md:order-none md:mx-0 md:mt-0 md:px-0",
              isStudent && "hidden"
            )}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-10 shrink-0 items-center rounded-full text-sm whitespace-nowrap transition-colors md:px-4 md:text-[14.5px]",
                    isGuest ? "px-3" : "px-4",
                    isActive
                      ? "bg-white font-semibold text-bvc-ink hover:text-bvc-ink"
                      : "font-medium text-white/75 hover:bg-white/10 hover:text-white"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {isGuest ? (
            <>
              <Link
                to="/login"
                state={loginState}
                aria-label="Đăng nhập"
                className={cn(iconLinkClass, "shrink-0 md:hidden")}
              >
                <LogIn className="size-[19px]" strokeWidth={2} aria-hidden />
              </Link>
              <PillLink
                to="/login"
                state={loginState}
                label="Đăng nhập"
                variant="light"
                size="md"
                className="hidden md:inline-flex"
              />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <NotificationBell className={iconLinkClass} iconClassName="size-[19px]" />
              {isStudent && (
                <Link to="/saved" aria-label="Nội dung đã lưu" className={iconLinkClass}>
                  <Bookmark className="size-[19px]" strokeWidth={1.6} />
                </Link>
              )}
              {role === "teacher" && (
                <Link to="/songs" aria-label="Thư viện của tôi" className={iconLinkClass}>
                  <LibraryBig className="size-[19px]" strokeWidth={1.6} />
                </Link>
              )}
              <Link
                to="/profile"
                aria-label={`Hồ sơ ${displayName}`}
                className={cn(
                  "size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 hover:text-white md:flex md:h-11 md:w-auto md:justify-start md:gap-2.5 md:pr-4 md:pl-1",
                  showBottomNav ? "hidden" : "flex"
                )}
              >
                <UserAvatar name={displayName} />
                <span className="hidden max-w-[160px] truncate text-sm font-medium md:inline">{displayName}</span>
              </Link>
            </div>
          )}
        </div>
      </header>

      <main
        key={location.pathname}
        className={cn(
          "flex flex-1 flex-col motion-safe:animate-page-enter",
          showBottomNav && "pb-(--bvc-bottom-nav-h)",
          className
        )}
      >
        {children}
      </main>

      {showBottomNav && <BottomTabBar tabs={STUDENT_TABS} displayName={displayName} />}
    </div>
  );
}
