import { LogOut, Mail } from "lucide-react";
import { RoleShell } from "@/shared/components/bvc/RoleShell";
import { UserAvatar } from "@/shared/components/bvc/UserAvatar";
import { ROLE_LABELS } from "@/shared/constants/roles";
import { useAuth } from "@/shared/context/AuthContext";

const ROLE_LABEL_BY_NUMBER: Record<number, string> = ROLE_LABELS;

// Hồ sơ hiển thị thông tin tài khoản từ phiên đăng nhập; BE chưa có API cài đặt cá nhân
export function ProfilePage() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <RoleShell title="Hồ sơ" subtitle="Thông tin tài khoản đăng nhập bằng Google." contentClassName="max-w-[640px]">
      <div className="flex flex-col gap-4 rounded-[20px] border border-bvc-border bg-white p-5 sm:flex-row sm:items-center">
        <UserAvatar name={user.username} className="size-[64px] text-[22px] font-extrabold" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-[20px] font-extrabold tracking-[-0.02em] text-bvc-ink">{user.username}</span>
          <span className="w-fit rounded-full bg-bvc-accent-tint px-[10px] py-[3px] text-[12px] font-bold text-bvc-accent-text">
            {ROLE_LABEL_BY_NUMBER[user.role] ?? "Người dùng"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-[20px] border border-bvc-border bg-white px-5 py-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[13px] bg-bvc-soft text-bvc-accent">
          <Mail className="size-[18px]" strokeWidth={1.8} />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-[12.5px] text-bvc-muted">Email</span>
          <span className="truncate text-[14.5px] font-semibold text-bvc-ink">{user.email}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void logout()}
        className="flex h-[50px] w-full cursor-pointer items-center justify-center gap-2 rounded-[16px] border border-bvc-accent-border bg-bvc-accent-tint text-[15px] font-bold text-bvc-accent-text sm:w-fit sm:px-8"
      >
        <LogOut className="size-[18px]" strokeWidth={1.9} />
        Đăng xuất
      </button>
    </RoleShell>
  );
}
