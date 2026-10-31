import type { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Bookmark, LibraryBig } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { useViewerRole } from "@/shared/hooks/useViewerRole";
import { NotificationBell } from "@/shared/components/bvc/NotificationBell";
import { UserAvatar } from "@/shared/components/bvc/UserAvatar";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
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

const iconLinkClass =
  "flex size-10 items-center justify-center rounded-[13px] border border-bvc-border text-bvc-ink hover:bg-bvc-surface hover:text-bvc-ink md:size-11 md:rounded-bvc-md";

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
      <header className="flex shrink-0 flex-wrap items-center gap-2.5 border-b border-bvc-border px-[18px] pt-[26px] md:h-[68px] md:flex-nowrap md:gap-11 md:px-14 md:pt-0">
        <Link
          to={homePath}
          className="flex-1 text-[21px] font-extrabold tracking-[-0.02em] text-bvc-ink hover:text-bvc-ink md:flex-none md:text-[19px]"
        >
          Bách Việt Cầm
        </Link>

        <nav
          aria-label="Điều hướng chính"
          className="order-last -mx-[18px] mt-3.5 flex w-[calc(100%+36px)] justify-center gap-[13px] overflow-x-auto px-[18px] md:order-none md:mx-0 md:mt-0 md:h-full md:w-auto md:flex-1 md:justify-start md:gap-[30px] md:px-0"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "-mb-px flex min-h-11 shrink-0 items-center border-b-2 pt-0.5 text-sm whitespace-nowrap md:h-full md:text-[14.5px]",
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

        {role === "guest" ? (
          <Link
            to="/login"
            state={{ from: `${location.pathname}${location.search}` }}
            className={actionButtonClass("primary")}
          >
            Đăng nhập
          </Link>
        ) : (
          <div className="flex items-center gap-2.5">
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
              className="hidden h-11 items-center gap-2.5 pl-1.5 text-bvc-ink hover:text-bvc-ink md:flex"
            >
              <UserAvatar name={displayName} />
              <span className="text-sm font-semibold">{displayName}</span>
            </Link>
          </div>
        )}
      </header>

      <main key={location.pathname} className={cn("flex flex-1 flex-col motion-safe:animate-page-enter", className)}>
        {children}
      </main>
    </div>
  );
}
