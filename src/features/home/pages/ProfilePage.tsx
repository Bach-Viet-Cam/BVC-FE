import { Link } from "react-router-dom";
import {
  Bell,
  Bookmark,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  LogOut,
  Mail,
  MessageSquareText,
  type LucideIcon,
} from "lucide-react";
import { RoleShell } from "@/shared/components/bvc/RoleShell";
import { UserAvatar } from "@/shared/components/bvc/UserAvatar";
import { FEEDBACK_FORM_URL } from "@/shared/constants/contact";
import { ROLES, ROLE_LABELS } from "@/shared/constants/roles";
import { useAuth } from "@/shared/context/AuthContext";

const ROLE_LABEL_BY_NUMBER: Record<number, string> = ROLE_LABELS;
const ROW_CLASS =
  "group flex items-center gap-3 border-b border-bvc-border px-5 py-3.5 text-bvc-ink transition-colors last:border-b-0 hover:bg-bvc-soft hover:text-bvc-ink";
const ROW_ICON_CLASS =
  "flex size-10 shrink-0 items-center justify-center rounded-[13px] bg-bvc-soft text-bvc-accent transition-colors group-hover:bg-white";

interface AccountLink {
  label: string;
  to: string;
  icon: LucideIcon;
}

function accountLinksFor(role: number): AccountLink[] {
  return [
    ...(role === ROLES.STUDENT ? [{ label: "Nội dung đã lưu", to: "/saved", icon: Bookmark }] : []),
    { label: "Thông báo", to: "/notifications", icon: Bell },
    { label: "Trợ giúp", to: "/help", icon: CircleHelp },
  ];
}

// Hồ sơ hiển thị thông tin tài khoản từ phiên đăng nhập; BE chưa có API cài đặt cá nhân
export function ProfilePage() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <RoleShell title="Hồ sơ" contentClassName="max-w-[640px]">
      <div className="flex flex-col gap-4 rounded-bvc-xl border border-bvc-border bg-white p-5 sm:flex-row sm:items-center">
        <UserAvatar name={user.username} className="size-[64px] text-[22px] font-semibold" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-[20px] font-semibold tracking-[-0.02em] text-bvc-ink">{user.username}</span>
          <span className="w-fit rounded-full bg-bvc-accent-tint px-[10px] py-[3px] text-[12px] font-semibold text-bvc-accent-text">
            {ROLE_LABEL_BY_NUMBER[user.role] ?? "Người dùng"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-bvc-xl border border-bvc-border bg-white px-5 py-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[13px] bg-bvc-soft text-bvc-accent">
          <Mail className="size-[18px]" strokeWidth={1.8} />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-[12.5px] text-bvc-muted">Email</span>
          <span className="truncate text-[14.5px] font-medium text-bvc-ink">{user.email}</span>
        </div>
      </div>

      <nav aria-label="Tài khoản" className="overflow-hidden rounded-bvc-xl border border-bvc-border bg-white">
        {accountLinksFor(user.role).map((item) => (
          <Link key={item.to} to={item.to} className={ROW_CLASS}>
            <span className={ROW_ICON_CLASS}>
              <item.icon className="size-[18px]" strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1 truncate text-[14.5px] font-medium">{item.label}</span>
            <ChevronRight
              aria-hidden
              className="size-[18px] shrink-0 text-bvc-faint transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        ))}
        <a href={FEEDBACK_FORM_URL} target="_blank" rel="noopener noreferrer" className={ROW_CLASS}>
          <span className={ROW_ICON_CLASS}>
            <MessageSquareText className="size-[18px]" strokeWidth={1.8} />
          </span>
          <span className="min-w-0 flex-1 truncate text-[14.5px] font-medium">Gửi góp ý</span>
          <ExternalLink aria-hidden className="size-[17px] shrink-0 text-bvc-faint" />
        </a>
      </nav>

      <button
        type="button"
        onClick={() => void logout()}
        className="flex h-[50px] w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-bvc-accent-border bg-bvc-accent-tint text-[15px] font-semibold text-bvc-accent-text transition-transform active:scale-[0.99] sm:w-fit sm:px-8"
      >
        <LogOut className="size-[18px]" strokeWidth={1.9} />
        Đăng xuất
      </button>
    </RoleShell>
  );
}
