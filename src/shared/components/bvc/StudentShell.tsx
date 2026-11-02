import type { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Bookmark, LibraryBig } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { useViewerRole } from "@/shared/hooks/useViewerRole";
import { NotificationBell } from "@/shared/components/bvc/NotificationBell";
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
];

// Giảng viên / quản trị viên chỉ ghé thư viện công khai, các mục sinh viên ở trên sẽ trả 403
const STAFF_NAV_ITEMS = [{ label: "Thư viện", to: "/library" }];

const ROLE_FALLBACK_NAMES = { student: "Sinh viên", teacher: "Giảng viên", admin: "Quản trị viên", guest: "Khách" };

// Nút biểu tượng dạng kính mờ trên nền header tối
const iconLinkClass =
  "flex size-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20 hover:text-white md:size-11";

export function StudentShell({ children, className }: StudentShellProps) {
  const { user } = useAuth();
  const role = useViewerRole();
  const location = useLocation();
  const displayName = user?.username ?? ROLE_FALLBACK_NAMES[role];
  const isStaff = role === "teacher" || role === "admin";
  const homePath = user ? getRoleHome(user.role) : "/library";
  const navItems = isStaff ? [{ label: "Trang chủ", to: homePath }, ...STAFF_NAV_ITEMS] : NAV_ITEMS;

  return (
    <div className="flex min-h-dvh flex-col bg-white font-bvc-sans text-bvc-ink">
      <header className="shrink-0 bg-bvc-ink text-white">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center gap-2.5 px-[18px] pt-[max(env(safe-area-inset-top),18px)] pb-3 md:h-[72px] md:flex-nowrap md:gap-8 md:px-14 md:py-0">
          <Link to={homePath} className="mr-auto shrink-0 transition-opacity hover:opacity-85 md:mr-0">
            <img src={logoImage} alt="Bách Việt Cầm" className="h-10 w-auto md:h-11" />
          </Link>

          <nav
            aria-label="Điều hướng chính"
            className="order-last -mx-[18px] mt-2 flex w-[calc(100%+36px)] gap-1.5 overflow-x-auto px-[18px] [scrollbar-width:none] md:order-none md:mx-0 md:mt-0 md:w-auto md:flex-1 md:px-0"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm whitespace-nowrap transition-colors md:text-[14.5px]",
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

          {role === "guest" ? (
            <PillLink
              to="/login"
              state={{ from: `${location.pathname}${location.search}` }}
              label="Đăng nhập"
              variant="light"
              size="md"
            />
          ) : (
            <div className="flex items-center gap-2">
              <NotificationBell className={iconLinkClass} iconClassName="size-[19px]" />
              {role === "student" && (
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
                className="hidden h-11 items-center gap-2.5 rounded-full border border-white/20 bg-white/10 pr-4 pl-1 text-white transition-colors hover:bg-white/20 hover:text-white md:flex"
              >
                <UserAvatar name={displayName} />
                <span className="max-w-[160px] truncate text-sm font-medium">{displayName}</span>
              </Link>
            </div>
          )}
        </div>
      </header>

      <main key={location.pathname} className={cn("flex flex-1 flex-col motion-safe:animate-page-enter", className)}>
        {children}
      </main>
    </div>
  );
}
