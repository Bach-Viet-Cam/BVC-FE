import { cn } from "@/shared/utils/cn";
import { NavLink } from "react-router-dom";

interface NavItem {
  label: string;
  to: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface UserInfo {
  initials: string;
  name: string;
  role: string;
}

interface DesktopSidebarProps {
  items: NavItem[];
  user: UserInfo;
  showLogo?: boolean;
}

export function DesktopSidebar({ items, user, showLogo = true }: DesktopSidebarProps) {
  return (
    <aside className="flex w-[232px] shrink-0 flex-col gap-[26px] border-r border-bvc-border-strong bg-bvc-surface p-[24px_16px]">
      {showLogo && (
        <div className="flex items-center gap-[10px] px-[6px]">
          <span className="flex size-[34px] items-center justify-center rounded-[12px] bg-bvc-accent text-white">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7" cy="16.5" r="3" />
              <circle cx="17.5" cy="14" r="3" />
              <path d="M10 16.5V6l10.5-2.5V14" />
            </svg>
          </span>
          <span className="text-[17px] font-extrabold tracking-[-0.02em]">Bách Việt Cầm</span>
        </div>
      )}

      <nav className="flex flex-col gap-[3px]">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex min-h-[44px] items-center justify-between gap-[11px] rounded-[13px] px-[12px] text-[14px]",
                isActive
                  ? "bg-bvc-accent-tint font-bold text-bvc-accent-text"
                  : "text-bvc-muted hover:bg-bvc-border"
              )
            }
          >
            <span className="flex items-center gap-[11px]">
              {item.icon}
              {item.label}
            </span>
            {item.badge !== undefined && (
              <span className="font-bvc-mono rounded-[8px] bg-bvc-ink px-[7px] py-[3px] text-[12px] font-semibold text-white">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-[10px] rounded-[16px] border border-bvc-border-strong bg-white p-[13px]">
        <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-bvc-surface text-[13px] font-bold text-bvc-muted">
          {user.initials}
        </span>
        <span className="flex flex-col gap-[1px]">
          <span className="text-[13.5px] font-bold">{user.name}</span>
          <span className="text-[12px] text-bvc-muted">{user.role}</span>
        </span>
      </div>
    </aside>
  );
}
