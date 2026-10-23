import { useNavigate } from "react-router-dom";
import { DesktopPageHeader, StatCard } from "@/shared/components/bvc";
import { PageStatus } from "@/features/platform/components/PageStatus";
import { USER_ROLE_LABELS, USER_STATUS_DOT, USER_STATUS_OPTIONS } from "@/features/platform/constants/userConstants";
import { useAdminOverview } from "@/features/platform/hooks/useAdminOverview";
import { type AdminOverview } from "@/features/platform/types/adminTypes";
import { formatDayShort, formatPercent, getTodayLabel, scaleBarHeights } from "@/features/platform/utils/adminFormat";

function WarningIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 4.5 21 20H3z" />
      <path d="M12 10v4M12 17h.01" />
    </svg>
  );
}

function getStatusLabel(status: string): string {
  return USER_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

function OverviewContent({ overview, onOpenConfig }: { overview: AdminOverview; onOpenConfig: () => void }) {
  const counts = overview.submissionsByDay.map((day) => day.count);
  const heights = scaleBarHeights(counts);
  const totalSubmissions = counts.reduce((sum, count) => sum + count, 0);

  return (
    <div className="flex flex-1 flex-col gap-[20px] p-[16px_18px_24px] md:p-[20px_32px_24px] xl:flex-row xl:overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col gap-[18px]">
        <div className="grid grid-cols-2 gap-[12px] lg:grid-cols-4">
          <StatCard label="Đang hoạt động (7 ngày)" value={overview.activeUsers7d} />
          <StatCard label="Bản thu 7 ngày qua" value={overview.submissions7d} />
          <StatCard label="Dung lượng đã dùng" value={formatPercent(overview.storage.usedPercent)} variant="surface" />
          <StatCard label="Lỗi phân tích 24h" value={overview.failed24h} variant="accent" />
        </div>

        <div className="flex flex-col gap-[14px] rounded-[20px] border border-bvc-border bg-white p-[18px]">
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] font-bold">Lượt nộp bài · {overview.submissionsByDay.length} ngày</span>
            <span className="text-[13px] text-bvc-muted">Tổng {totalSubmissions} lượt</span>
          </div>
          <div className="flex h-[120px] items-end gap-[6px]">
            {overview.submissionsByDay.map((day, index) => (
              <span
                key={day.date}
                title={`${formatDayShort(day.date)}: ${day.count} lượt`}
                className="flex-1 rounded-[3px]"
                style={{
                  height: `${heights[index]}%`,
                  backgroundColor: index === heights.length - 1 ? "var(--color-bvc-accent)" : "var(--color-bvc-bar)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden rounded-[20px] border border-bvc-border bg-white">
          <div className="shrink-0 border-b border-bvc-border px-[18px] py-[15px] text-[15px] font-bold">
            Người dùng mới nhất
          </div>
          {/* Bảng 4 cột: trên điện thoại cuộn ngang trong thẻ thay vì bóp chữ */}
          <div className="flex min-h-0 flex-1 flex-col overflow-x-auto">
            <div className="grid min-w-[560px] shrink-0 grid-cols-[2fr_2fr_1.2fr_1fr] gap-[12px] border-b border-bvc-border px-[18px] py-[10px] text-[12px] font-bold uppercase tracking-[0.08em] text-bvc-muted">
              <span>Họ tên</span>
              <span>Email</span>
              <span>Vai trò</span>
              <span>Trạng thái</span>
            </div>
            <div className="min-w-[560px] overflow-y-auto">
              {overview.recentUsers.length === 0 && (
                <div className="px-[18px] py-[16px] text-[13.5px] text-bvc-muted">Chưa có người dùng nào.</div>
              )}
              {overview.recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-[2fr_2fr_1.2fr_1fr] items-center gap-[12px] border-b border-bvc-line px-[18px] py-[12px] text-[14px] last:border-b-0"
                >
                  <span>{user.username}</span>
                  <span className="truncate text-bvc-muted">{user.email}</span>
                  <span className="text-bvc-muted">{USER_ROLE_LABELS[user.role] ?? "-"}</span>
                  <span className="flex items-center gap-[6px] text-[13.5px]">
                    <span className={`size-[8px] shrink-0 rounded-full ${USER_STATUS_DOT[user.status]}`} />
                    {getStatusLabel(user.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-col gap-[14px] xl:w-[306px]">
        <div className="flex flex-col gap-[12px] rounded-[20px] border border-[#F9D2C2] bg-bvc-accent-tint p-[16px]">
          <div className="flex items-center gap-[8px]">
            <span className="text-bvc-accent-text">
              <WarningIcon />
            </span>
            <span className="text-[14px] font-bold text-bvc-accent-text">Cần xử lý</span>
          </div>
          <div className="flex flex-col gap-[9px]">
            {overview.alerts.length === 0 && (
              <div className="rounded-[14px] bg-white p-[11px_12px] text-[13px] text-bvc-muted">
                Hệ thống ổn định, không có cảnh báo.
              </div>
            )}
            {overview.alerts.map((alert) => (
              <div key={alert.code} className="flex flex-col gap-[2px] rounded-[14px] bg-white p-[11px_12px]">
                <span className="text-[14px] font-bold">{alert.level === "ERROR" ? "Lỗi" : "Cảnh báo"}</span>
                <span className="text-[12.5px] text-bvc-muted">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-[12px] rounded-[20px] border border-bvc-border bg-white p-[16px]">
          <span className="text-[14px] font-bold">Cấu hình đang áp dụng</span>
          <div className="flex flex-col gap-[9px]">
            {overview.config.map((item) => (
              <div key={item.label} className="flex justify-between gap-[12px] text-[13.5px]">
                <span className="text-bvc-muted">{item.label}</span>
                <span className="font-bvc-mono">{item.value}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onOpenConfig}
            className="min-h-[42px] cursor-pointer rounded-[14px] border border-bvc-border-strong bg-white text-[14px] font-semibold text-bvc-ink"
          >
            Mở cấu hình
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminPage() {
  const navigate = useNavigate();
  const { overview, error, isLoading, reload } = useAdminOverview();

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <DesktopPageHeader
        breadcrumb={`Hôm nay · ${getTodayLabel()}`}
        title="Tổng quan hệ thống"
        actions={
          <>
            <button
              type="button"
              onClick={() => navigate("/admin/config")}
              className="min-h-[42px] cursor-pointer rounded-[14px] border border-bvc-border-strong bg-white px-[16px] text-[14px] font-semibold text-bvc-ink"
            >
              Thêm nhạc cụ
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/notifications?type=SYSTEM")}
              className="min-h-[42px] cursor-pointer rounded-[14px] border-none bg-bvc-ink px-[16px] text-[14px] font-bold text-white"
            >
              Thông báo bảo trì
            </button>
          </>
        }
      />
      <PageStatus isLoading={isLoading} error={error} onRetry={reload}>
        {overview && <OverviewContent overview={overview} onOpenConfig={() => navigate("/admin/config")} />}
      </PageStatus>
    </main>
  );
}
