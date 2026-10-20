import { RefreshCw } from "lucide-react";
import { DesktopPageHeader, StatCard } from "@/shared/components/bvc";
import { PageStatus } from "@/features/platform/components/PageStatus";
import { useAdminMonitoring } from "@/features/platform/hooks/useAdminMonitoring";
import { type AdminMonitoring } from "@/features/platform/types/adminTypes";
import {
  formatBytes,
  formatDateTime,
  formatDayShort,
  formatDuration,
  formatPercent,
  formatWeekday,
  scaleBarHeights,
} from "@/features/platform/utils/adminFormat";

const LEVEL_BADGE = {
  ERROR: "bg-bvc-accent-tint text-bvc-accent-text",
  WARN: "border border-bvc-border text-bvc-muted",
} as const;

const CARD_TITLE = "text-[15px] font-extrabold tracking-[-0.025em]";

function MonitoringContent({ monitoring }: { monitoring: AdminMonitoring }) {
  const { storage } = monitoring;
  const counts = monitoring.submissionsByDay.map((day) => day.count);
  const heights = scaleBarHeights(counts);
  const lastIndex = heights.length - 1;
  const freeBytes = Math.max(0, storage.capacityBytes - storage.usedBytes);

  return (
    <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto p-[22px_32px_26px]">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Hàng đợi phân tích" value={monitoring.queueCount} />
        <StatCard label="Tỷ lệ lỗi (7 ngày)" value={formatPercent(monitoring.errorRate7d)} />
        <StatCard label="Bản thu 24 giờ" value={monitoring.submissions24h} />
        <StatCard label="Lưu trữ" value={`${formatBytes(storage.usedBytes)} / ${formatBytes(storage.capacityBytes)}`} />
      </div>

      <div className="grid grid-cols-2 gap-[20px]">
        <div className="rounded-[20px] border border-bvc-border p-[18px]">
          <div className="mb-3">
            <span className={CARD_TITLE}>Hàng đợi phân tích</span>
            <span className="ml-2 font-mono text-[13px] text-bvc-muted">{monitoring.queueCount} bản thu đang chờ</span>
          </div>
          <div className="flex flex-col">
            {monitoring.queue.length === 0 && (
              <p className="py-[10px] text-[13px] text-bvc-muted">Không có bản thu nào đang chờ.</p>
            )}
            {monitoring.queue.map((item) => (
              <div
                key={item.id}
                className="flex h-[48px] items-center justify-between border-b border-bvc-line text-[13px] last:border-0"
              >
                <div className="flex min-w-0 flex-col gap-[2px]">
                  <span className="truncate font-mono text-3 text-bvc-ink">{item.fileName}</span>
                  <span className="text-3 text-bvc-muted">{item.studentName}</span>
                </div>
                <div className="flex shrink-0 items-center gap-[8px]">
                  <span className="font-mono text-bvc-muted">{formatDuration(item.waitSeconds)}</span>
                  <span className="flex items-center gap-[5px]">
                    <span className="size-[7px] shrink-0 rounded-full bg-bvc-accent" />
                    <span className="text-3 text-bvc-muted">Đang xử lý</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[20px] border border-bvc-border p-[18px]">
          <div className="mb-3">
            <span className={CARD_TITLE}>Cảnh báo &amp; lỗi gần nhất</span>
          </div>
          <div className="flex flex-col">
            {monitoring.alerts.length === 0 && monitoring.failures.length === 0 && (
              <p className="py-[10px] text-[13px] text-bvc-muted">Chưa ghi nhận lỗi nào.</p>
            )}
            {monitoring.alerts.map((alert) => (
              <div key={alert.code} className="border-b border-bvc-line py-[10px] last:border-0">
                <div className="flex items-center gap-[8px]">
                  <span className="font-mono text-[11px] text-bvc-muted">Hiện tại</span>
                  <span className={`rounded-[8px] px-2 py-0.5 text-[11px] font-semibold ${LEVEL_BADGE[alert.level]}`}>
                    {alert.level}
                  </span>
                </div>
                <p className="mt-[3px] text-[13px] text-bvc-ink">{alert.message}</p>
              </div>
            ))}
            {monitoring.failures.map((failure) => (
              <div key={failure.id} className="border-b border-bvc-line py-[10px] last:border-0">
                <div className="flex items-center gap-[8px]">
                  <span className="font-mono text-[11px] text-bvc-muted">{formatDateTime(failure.occurredAt)}</span>
                  <span className={`rounded-[8px] px-2 py-0.5 text-[11px] font-semibold ${LEVEL_BADGE.ERROR}`}>
                    ERROR
                  </span>
                </div>
                <p className="mt-[3px] text-[13px] text-bvc-ink">{failure.message}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[20px] border border-bvc-border p-[18px]">
          <div className="mb-3">
            <span className={CARD_TITLE}>Dung lượng lưu trữ</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-bvc-surface">
            <div className="h-full bg-bvc-bar-strong" style={{ width: `${Math.min(100, storage.usedPercent)}%` }} />
          </div>
          <div className="mt-3 flex flex-col gap-[6px]">
            <div className="flex items-center gap-[8px] text-[13px]">
              <span className="size-[7px] shrink-0 rounded-full bg-bvc-bar-strong" />
              <span className="text-bvc-ink">Bản thu âm ({storage.fileCount} tệp)</span>
              <span className="ml-auto font-mono text-bvc-muted">{formatBytes(storage.usedBytes)}</span>
            </div>
            <div className="flex items-center gap-[8px] text-[13px]">
              <span className="size-[7px] shrink-0 rounded-full border border-bvc-border-strong bg-bvc-surface" />
              <span className="text-bvc-ink">Còn trống</span>
              <span className="ml-auto font-mono text-bvc-muted">
                {formatBytes(freeBytes)} / {formatBytes(storage.capacityBytes)}
              </span>
            </div>
          </div>
          <p className="mt-3 text-3 text-bvc-muted">
            Đã dùng {formatPercent(storage.usedPercent)}. Dung lượng tối đa chỉnh ở Cấu hình hệ thống (tham số “Dung
            lượng lưu trữ tối đa”).
          </p>
        </div>

        <div className="rounded-[20px] border border-bvc-border p-[18px]">
          <div className="mb-[14px]">
            <span className={CARD_TITLE}>Lượt nộp bài ({monitoring.submissionsByDay.length} ngày)</span>
          </div>
          <div className="flex items-end gap-2" style={{ height: "60px" }}>
            {monitoring.submissionsByDay.map((day, index) => (
              <div key={day.date} className="flex h-full flex-1 flex-col justify-end">
                <div
                  title={`${formatDayShort(day.date)}: ${day.count} lượt`}
                  className={`w-full rounded-t-[4px] ${index === lastIndex ? "bg-bvc-accent" : "bg-bvc-bar"}`}
                  style={{ height: `${heights[index]}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-[6px] flex gap-2">
            {monitoring.submissionsByDay.map((day, index) => (
              <div key={day.date} className="flex flex-1 justify-center">
                <span
                  className={`font-mono text-[11px] ${index === lastIndex ? "font-bold text-bvc-accent-text" : "text-bvc-muted"}`}
                >
                  {formatWeekday(day.date)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MonitoringPage() {
  const { monitoring, error, isLoading, reload } = useAdminMonitoring();

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <DesktopPageHeader
        breadcrumb="M06 · Quản trị"
        title="Giám sát hệ thống"
        actions={
          <button
            type="button"
            onClick={reload}
            className="flex min-h-[44px] cursor-pointer items-center gap-[8px] rounded-[14px] border border-bvc-border-strong bg-white px-[16px] text-[14px] font-semibold text-bvc-ink"
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
        }
      />
      <PageStatus isLoading={isLoading} error={error} onRetry={reload}>
        {monitoring && <MonitoringContent monitoring={monitoring} />}
      </PageStatus>
    </main>
  );
}
