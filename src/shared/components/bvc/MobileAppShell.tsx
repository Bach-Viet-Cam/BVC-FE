import { Bell } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/shared/context/AuthContext";
import { cn } from "@/shared/utils/cn";

interface ShellNavItem {
  label: string;
  to?: string;
}

// Lecturer navigation from UI/Danh sách lớp. Items without a screen yet stay visible but disabled.
const LECTURER_NAV: ShellNavItem[] = [
  { label: "Lớp học", to: "/teacher/classes" },
  { label: "Bài tập" },
  { label: "Đánh giá" },
  { label: "Thư viện" },
  { label: "Thông báo" },
];

// "Nguyễn Thu Hương" → "NH": first letter of the family name + first letter of the given name.
function getInitials(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0][0].toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export function MobileAppShell() {
  const { user } = useAuth();
  const displayName = user?.username ?? "";

  return (
    <>
      <header className="flex shrink-0 items-center gap-[10px] px-[18px] pt-[26px]">
        <span className="grow text-[21px] font-extrabold tracking-[-0.02em]">Bách Việt Cầm</span>
        <button
          type="button"
          disabled
          aria-label="Thông báo"
          className="flex size-[44px] shrink-0 items-center justify-center rounded-[13px] border border-bvc-border text-bvc-ink disabled:cursor-not-allowed"
        >
          <Bell size={19} strokeWidth={1.6} />
        </button>
        <span
          aria-label={`Hồ sơ ${displayName}`}
          className="flex size-[44px] shrink-0 items-center justify-center rounded-full bg-bvc-accent-tint text-[13px] font-bold text-bvc-accent-text"
        >
          {getInitials(displayName)}
        </span>
      </header>
      <nav
        aria-label="Điều hướng giảng viên"
        className="mt-[14px] flex shrink-0 justify-start gap-[16px] no-scrollbar overflow-x-auto overflow-y-hidden border-b border-bvc-border px-[18px] sm:justify-center"
      >
        {LECTURER_NAV.map((item) =>
          item.to ? (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex min-h-[44px] items-center whitespace-nowrap text-[14px]",
                  isActive ? "border-b-2 border-bvc-ink font-bold text-bvc-ink" : "text-bvc-muted"
                )
              }
            >
              {item.label}
            </NavLink>
          ) : (
            <span
              key={item.label}
              aria-disabled="true"
              title="Chức năng đang phát triển"
              className="flex min-h-[44px] cursor-not-allowed items-center whitespace-nowrap text-[14px] text-bvc-faint"
            >
              {item.label}
            </span>
          )
        )}
      </nav>
    </>
  );
}
