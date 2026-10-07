import { DesktopSidebar, DesktopPageHeader, StatCard } from "@/shared/components/bvc";

const NAV_ITEMS = [
  { label: "Tổng quan", to: "/admin", icon: <GridIcon /> },
  { label: "Người dùng", to: "/admin/users", icon: <UserIcon /> },
  { label: "Cấu hình hệ thống", to: "/admin/config", icon: <SettingsIcon /> },
  { label: "Nội dung & danh mục", to: "/admin/content", icon: <BookIcon /> },
  { label: "Giám sát", to: "/admin/monitor", icon: <ActivityIcon /> },
  { label: "Thông báo hệ thống", to: "/admin/notifications", icon: <BellIcon /> },
];

const BAR_HEIGHTS = [44, 58, 52, 76, 90, 61, 84, 48, 63, 57, 81, 96, 68, 88];

const RECENT_USERS = [
  { name: "Ngô Thảo My", email: "mynt@fpt.edu.vn", role: "Sinh viên", status: "ok" as const },
  { name: "Nhạc cụ Thăng Long", email: "contact@thanglong.vn", role: "Đơn vị cho thuê", status: "warn" as const },
  { name: "Bùi Đức Trung", email: "trungbd@fpt.edu.vn", role: "Mentor", status: "ok" as const },
];

const STATUS_COLORS = {
  ok: { dot: "var(--color-bvc-ok)", label: "Hoạt động" },
  warn: { dot: "var(--color-bvc-warn)", label: "Chờ duyệt" },
};

function GridIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="4" width="7" height="7" rx="2"/><rect x="13.5" y="4" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/></svg>;
}
function UserIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 20.5c0-3.6 3.1-6 7-6s7 2.4 7 6"/></svg>;
}
function SettingsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.5M12 18v2.5M3.5 12H6M18 12h2.5M6 6l1.8 1.8M16.2 16.2 18 18M18 6l-1.8 1.8M7.8 16.2 6 18"/></svg>;
}
function BookIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 5.5A2 2 0 0 1 6.5 3.5H19v17H6.5a2 2 0 0 0-2 2z"/><path d="M8.5 8h7"/></svg>;
}
function ActivityIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h3l2.5-6 3 13 2.5-9 2 5h5.5"/></svg>;
}
function BellIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5S6.5 14 6.5 10z"/><path d="M10 18.5a2.2 2.2 0 0 0 4 0"/></svg>;
}
function WarningIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4.5 21 20H3z"/><path d="M12 10v4M12 17h.01"/></svg>;
}

export function AdminPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <DesktopSidebar
        items={NAV_ITEMS}
        user={{ initials: "AD", name: "Phòng CNTT", role: "System Admin" }}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DesktopPageHeader
          breadcrumb="Hôm nay · 20/09/2026"
          title="Tổng quan hệ thống"
          actions={
            <>
              <button type="button" className="min-h-[42px] cursor-pointer rounded-[14px] border border-bvc-border-strong bg-white px-[16px] text-[14px] font-semibold text-bvc-ink">
                Thêm nhạc cụ
              </button>
              <button type="button" className="min-h-[42px] cursor-pointer rounded-[14px] border-none bg-bvc-ink px-[16px] text-[14px] font-bold text-white">
                Thông báo bảo trì
              </button>
            </>
          }
        />

        <div className="flex flex-1 gap-[20px] overflow-hidden p-[20px_32px_24px]">
          {/* Left column */}
          <div className="flex min-w-0 flex-1 flex-col gap-[18px]">
            {/* Stats row */}
            <div className="grid grid-cols-4 gap-[12px]">
              <StatCard label="Đang hoạt động (7 ngày)" value="412" />
              <StatCard label="Bản thu tuần này" value="1.847" />
              <StatCard label="Dung lượng đã dùng" value="78%" variant="surface" />
              <StatCard label="Lỗi phân tích 24h" value="9" variant="accent" />
            </div>

            {/* Bar chart */}
            <div className="flex flex-col gap-[14px] rounded-[20px] border border-bvc-border bg-white p-[18px]">
              <div className="flex items-baseline justify-between">
                <span className="text-[15px] font-bold">Lượt phân tích bản thu · 14 ngày</span>
                <span className="text-[13px] text-bvc-muted">Đỉnh vào tối thứ 5 và Chủ nhật</span>
              </div>
              <div className="flex h-[120px] items-end gap-[6px]">
                {BAR_HEIGHTS.map((h, i) => {
                  const isHighlight = [4, 6, 11, 13].includes(i);
                  return (
                    <span
                      key={i}
                      className="flex-1 rounded-[3px]"
                      style={{
                        height: `${h}%`,
                        backgroundColor: isHighlight ? "var(--color-bvc-accent)" : "var(--color-bvc-bar)",
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Users table */}
            <div className="flex flex-1 flex-col overflow-hidden rounded-[20px] border border-bvc-border bg-white">
              <div className="shrink-0 border-b border-bvc-border px-[18px] py-[15px] text-[15px] font-bold">
                Người dùng mới nhất
              </div>
              <div className="grid shrink-0 grid-cols-[2fr_2fr_1.2fr_1fr] gap-[12px] border-b border-bvc-border px-[18px] py-[10px] text-[12px] font-bold uppercase tracking-[0.08em] text-bvc-muted">
                <span>Họ tên</span><span>Email</span><span>Vai trò</span><span>Trạng thái</span>
              </div>
              {RECENT_USERS.map((u, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[2fr_2fr_1.2fr_1fr] items-center gap-[12px] border-b border-bvc-line px-[18px] py-[12px] text-[14px] last:border-b-0"
                >
                  <span>{u.name}</span>
                  <span className="text-bvc-muted">{u.email}</span>
                  <span className="text-bvc-muted">{u.role}</span>
                  <span className="flex items-center gap-[6px] text-[13.5px]">
                    <span className="size-[8px] shrink-0 rounded-full" style={{ backgroundColor: STATUS_COLORS[u.status].dot }} />
                    {STATUS_COLORS[u.status].label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="flex w-[306px] shrink-0 flex-col gap-[14px]">
            {/* Alert card */}
            <div className="flex flex-col gap-[12px] rounded-[20px] border border-[#F9D2C2] bg-bvc-accent-tint p-[16px]">
              <div className="flex items-center gap-[8px]">
                <span className="text-bvc-accent-text"><WarningIcon /></span>
                <span className="text-[14px] font-bold text-bvc-accent-text">Cần xử lý</span>
              </div>
              <div className="flex flex-col gap-[9px]">
                <div className="flex flex-col gap-[2px] rounded-[14px] bg-white p-[11px_12px]">
                  <span className="text-[14px] font-bold">9 bản thu phân tích lỗi</span>
                  <span className="text-[12.5px] text-bvc-muted">Timeout ở hàng đợi AI, cần chạy lại thủ công</span>
                </div>
                <div className="flex flex-col gap-[2px] rounded-[14px] bg-white p-[11px_12px]">
                  <span className="text-[14px] font-bold">Dung lượng còn 22%</span>
                  <span className="text-[12.5px] text-bvc-muted">Cân nhắc nén bản thu cũ hơn 2 cohort</span>
                </div>
              </div>
            </div>

            {/* Config card */}
            <div className="flex flex-col gap-[12px] rounded-[20px] border border-bvc-border bg-white p-[16px]">
              <span className="text-[14px] font-bold">Cấu hình đang áp dụng</span>
              <div className="flex flex-col gap-[9px]">
                {[
                  ["Nhạc cụ trong danh mục", "7"],
                  ["Dung lượng file tối đa", "50 MB"],
                  ["Thời lượng thu tối đa", "10 phút"],
                  ["Ngưỡng accuracy đạt", "80%"],
                  ["Số lần submit mặc định", "3"],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-[13.5px]">
                    <span className="text-bvc-muted">{label}</span>
                    <span className="font-bvc-mono">{val}</span>
                  </div>
                ))}
              </div>
              <button type="button" className="min-h-[42px] cursor-pointer rounded-[14px] border border-bvc-border-strong bg-white text-[14px] font-semibold text-bvc-ink">
                Mở cấu hình
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
