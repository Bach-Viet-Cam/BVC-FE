import { MoreHorizontal } from "lucide-react";
import { DesktopSidebar, DesktopPageHeader, StatCard } from "@/shared/components/bvc";

const NAV_ITEMS = [
  { label: "Tổng quan", to: "/admin" },
  { label: "Người dùng", to: "/admin/users" },
  { label: "Cấu hình hệ thống", to: "/admin/config" },
  { label: "Phân loại nội dung", to: "/admin/categories" },
  { label: "Giám sát hệ thống", to: "/admin/monitoring" },
  { label: "Quản lý thông báo", to: "/admin/notifications" },
  { label: "Nội dung đã xác minh", to: "/community/verified" },
];

type Role = "Sinh viên" | "Giảng viên" | "Admin" | "Provider";
type Status = "active" | "inactive";

interface UserRow {
  initials: string;
  name: string;
  email: string;
  role: Role;
  class: string;
  status: Status;
  lastActive: string;
}

const USERS: UserRow[] = [
  { initials: "MA", name: "Trần Minh Anh", email: "anhtm@fpt.edu.vn", role: "Sinh viên", class: "TRD301", status: "active", lastActive: "Hôm nay" },
  { initials: "PL", name: "Nguyễn Phương Linh", email: "linhnp@fpt.edu.vn", role: "Sinh viên", class: "TRD301", status: "active", lastActive: "Hôm nay" },
  { initials: "QB", name: "Lê Quốc Bảo", email: "baolq@fpt.edu.vn", role: "Sinh viên", class: "TRD201", status: "inactive", lastActive: "10/09" },
  { initials: "NH", name: "Nguyễn Thu Hương", email: "huongnt@fpt.edu.vn", role: "Giảng viên", class: "—", status: "active", lastActive: "Hôm nay" },
  { initials: "GH", name: "Phạm Gia Hân", email: "hangp@fpt.edu.vn", role: "Sinh viên", class: "TRD301", status: "active", lastActive: "Hôm qua" },
  { initials: "AD", name: "Lê Văn Admin", email: "admin@bvc.edu.vn", role: "Admin", class: "—", status: "active", lastActive: "Hôm nay" },
  { initials: "HT", name: "Hoàng Văn Tùng", email: "tunghv@fpt.edu.vn", role: "Sinh viên", class: "TRD401", status: "active", lastActive: "23/09" },
  { initials: "RP", name: "Nhạc cụ Minh Long", email: "minhlong@rental.vn", role: "Provider", class: "—", status: "active", lastActive: "22/09" },
];

const ROLE_BADGE: Record<Role, string> = {
  "Sinh viên": "bg-bvc-surface text-bvc-muted",
  "Giảng viên": "border border-bvc-border text-bvc-ink",
  "Admin": "bg-bvc-ink text-white",
  "Provider": "bg-bvc-accent-tint text-bvc-accent-text",
};

export function UserManagePage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <DesktopSidebar
        items={NAV_ITEMS}
        user={{ initials: "AD", name: "Admin BVC", role: "Quản trị viên" }}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DesktopPageHeader
          breadcrumb="M06 · Quản trị"
          title="Quản lý người dùng"
          actions={
            <>
              <input
                type="search"
                placeholder="Tìm theo tên, email..."
                className="h-[44px] w-[220px] rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink placeholder:text-bvc-faint focus:outline-none"
              />
              <select className="h-[44px] cursor-pointer rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink focus:outline-none">
                <option>Tất cả vai trò</option>
                <option>Sinh viên</option>
                <option>Giảng viên</option>
                <option>Admin</option>
                <option>Provider</option>
              </select>
              <button
                type="button"
                className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] bg-bvc-ink px-[18px] text-[14px] font-bold text-white"
              >
                Tạo tài khoản
              </button>
            </>
          }
        />

        <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto p-[22px_32px_26px]">
          <div className="grid grid-cols-4 gap-[12px]">
            <StatCard label="Tổng" value="312" />
            <StatCard label="Sinh viên" value="278" />
            <StatCard label="Giảng viên" value="28" />
            <StatCard label="Admin + Provider" value="6" />
          </div>

          <div className="flex flex-col overflow-hidden rounded-[20px] border border-bvc-border bg-white">
            {/* Table header */}
            <div className="grid shrink-0 grid-cols-[2fr_2fr_1.1fr_0.9fr_0.9fr_1.1fr_0.7fr] gap-[14px] border-b border-bvc-border px-[20px] py-[11px] text-[12px] font-bold uppercase tracking-[0.08em] text-bvc-muted">
              <span>Họ tên</span>
              <span>Email</span>
              <span>Vai trò</span>
              <span>Lớp</span>
              <span>Trạng thái</span>
              <span>Hoạt động cuối</span>
              <span>Hành động</span>
            </div>

            {USERS.map((u) => (
              <div
                key={u.email}
                className="grid h-[52px] grid-cols-[2fr_2fr_1.1fr_0.9fr_0.9fr_1.1fr_0.7fr] items-center gap-[14px] border-b border-bvc-line px-[20px] text-[13px] last:border-0"
              >
                {/* Name + avatar */}
                <span className="flex items-center gap-[10px]">
                  <span className="flex size-[32px] shrink-0 items-center justify-center rounded-full bg-bvc-surface text-[12px] font-bold text-bvc-ink">
                    {u.initials}
                  </span>
                  <span className="font-semibold text-bvc-ink">{u.name}</span>
                </span>
                {/* Email */}
                <span className="text-bvc-muted">{u.email}</span>
                {/* Role badge */}
                <span>
                  <span className={`rounded-[9px] px-2 py-0.5 text-[12px] font-semibold ${ROLE_BADGE[u.role]}`}>
                    {u.role}
                  </span>
                </span>
                {/* Class */}
                <span className="text-bvc-muted">{u.class}</span>
                {/* Status dot */}
                <span className="flex items-center gap-[6px]">
                  <span
                    className={`size-[7px] shrink-0 rounded-full ${u.status === "active" ? "bg-bvc-ok" : "bg-bvc-bar-strong"}`}
                  />
                  <span className="text-bvc-muted">{u.status === "active" ? "Hoạt động" : "Không hoạt động"}</span>
                </span>
                {/* Last active */}
                <span className="font-mono text-bvc-muted">{u.lastActive}</span>
                {/* Action */}
                <span className="flex items-center">
                  <button
                    type="button"
                    className="flex size-[34px] cursor-pointer items-center justify-center rounded-[10px] border border-bvc-border text-bvc-muted"
                    aria-label="Thêm hành động"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
