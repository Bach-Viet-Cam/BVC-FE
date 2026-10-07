import { RefreshCw } from "lucide-react";
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

interface QueueItem {
  file: string;
  student: string;
  wait: string;
  processing: boolean;
}

const QUEUE_ITEMS: QueueItem[] = [
  { file: "rec_lyNguaO_QB_v3.wav", student: "Quốc Bảo", wait: "2m 14s", processing: false },
  { file: "rec_TrongCom_MA_v1.wav", student: "Minh Anh", wait: "1m 45s", processing: true },
  { file: "rec_BeoDAT_PL_v2.wav", student: "Phương Linh", wait: "58s", processing: false },
  { file: "rec_scale_GH_v1.wav", student: "Gia Hân", wait: "32s", processing: false },
  { file: "rec_HatRu_HT_v1.wav", student: "Hoàng Tùng", wait: "12s", processing: false },
];

type LogLevel = "ERROR" | "WARN";

interface LogEntry {
  ts: string;
  level: LogLevel;
  msg: string;
}

const LOG_ENTRIES: LogEntry[] = [
  { ts: "09:24:11", level: "ERROR", msg: "AI analysis timeout for rec_QB_scale.wav after 30s" },
  { ts: "09:18:42", level: "WARN", msg: "Storage bucket usage > 80%" },
  { ts: "08:55:03", level: "WARN", msg: "Queue depth > 5 for 10+ minutes" },
  { ts: "07:12:19", level: "ERROR", msg: "Failed to parse sheet PDF: encoding error" },
];

const LEVEL_BADGE: Record<LogLevel, string> = {
  ERROR: "bg-bvc-accent-tint text-bvc-accent-text",
  WARN: "border border-bvc-border text-bvc-muted",
};

const BAR_HEIGHTS = [52, 61, 48, 72, 65, 80, 42];
const BAR_DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function MonitoringPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <DesktopSidebar
        items={NAV_ITEMS}
        user={{ initials: "AD", name: "Admin BVC", role: "Quản trị viên" }}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DesktopPageHeader
          breadcrumb="M06 · Quản trị"
          title="Giám sát hệ thống"
          actions={
            <button
              type="button"
              className="flex min-h-[44px] cursor-pointer items-center gap-[8px] rounded-[14px] border border-bvc-border-strong bg-white px-[16px] text-[14px] font-semibold text-bvc-ink"
            >
              <RefreshCw size={16} />
              Làm mới
            </button>
          }
        />

        <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto p-[22px_32px_26px]">
          {/* Top stat cards */}
          <div className="grid grid-cols-4 gap-[12px]">
            <StatCard label="Hàng đợi AI" value="7" />
            <StatCard label="Tỷ lệ lỗi" value="2.1%" />
            <StatCard label="Thời gian TB" value="4.2s" />
            <StatCard label="Lưu trữ" value="84 / 200 GB" />
          </div>

          <div className="grid grid-cols-2 gap-[20px]">

            {/* Card: Hàng đợi phân tích AI */}
            <div className="rounded-[20px] border border-bvc-border p-[18px]">
              <div className="mb-[12px]">
                <span className="text-[15px] font-extrabold tracking-[-0.025em]">Hàng đợi phân tích AI</span>
                <span className="ml-2 font-mono text-[13px] text-bvc-muted">7 bản thu đang chờ</span>
              </div>
              <div className="flex flex-col">
                {QUEUE_ITEMS.map((item) => (
                  <div
                    key={item.file}
                    className="flex h-[48px] items-center justify-between border-b border-bvc-line text-[13px] last:border-0"
                  >
                    <div className="flex flex-col gap-[2px]">
                      <span className="font-mono text-[12px] text-bvc-ink">{item.file}</span>
                      <span className="text-[12px] text-bvc-muted">{item.student}</span>
                    </div>
                    <div className="flex items-center gap-[8px]">
                      <span className="font-mono text-bvc-muted">{item.wait}</span>
                      <span className="flex items-center gap-[5px]">
                        <span
                          className={`size-[7px] shrink-0 rounded-full ${item.processing ? "bg-bvc-accent" : "bg-bvc-bar-strong"}`}
                        />
                        <span className="text-[12px] text-bvc-muted">
                          {item.processing ? "Đang xử lý" : "Chờ"}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card: Lỗi gần nhất */}
            <div className="rounded-[20px] border border-bvc-border p-[18px]">
              <div className="mb-[12px]">
                <span className="text-[15px] font-extrabold tracking-[-0.025em]">Lỗi gần nhất</span>
              </div>
              <div className="flex flex-col">
                {LOG_ENTRIES.map((entry) => (
                  <div
                    key={entry.ts + entry.msg}
                    className="border-b border-bvc-line py-[10px] last:border-0"
                  >
                    <div className="flex items-center gap-[8px]">
                      <span className="font-mono text-[11px] text-bvc-muted">{entry.ts}</span>
                      <span className={`rounded-[8px] px-2 py-0.5 text-[11px] font-semibold ${LEVEL_BADGE[entry.level]}`}>
                        {entry.level}
                      </span>
                    </div>
                    <p className="mt-[3px] text-[13px] text-bvc-ink">{entry.msg}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Card: Dung lượng lưu trữ */}
            <div className="rounded-[20px] border border-bvc-border p-[18px]">
              <div className="mb-[12px]">
                <span className="text-[15px] font-extrabold tracking-[-0.025em]">Dung lượng lưu trữ</span>
              </div>
              {/* Progress bar */}
              <div className="h-[12px] overflow-hidden rounded-full bg-bvc-surface">
                <div className="flex h-full">
                  <div className="bg-bvc-bar-strong" style={{ width: "42%" }} />
                  <div className="bg-bvc-bar" style={{ width: "16%" }} />
                </div>
              </div>
              {/* Legend */}
              <div className="mt-[12px] flex flex-col gap-[6px]">
                <div className="flex items-center gap-[8px] text-[13px]">
                  <span className="size-[7px] shrink-0 rounded-full bg-bvc-bar-strong" />
                  <span className="text-bvc-ink">Bản thu âm</span>
                  <span className="ml-auto font-mono text-bvc-muted">84 GB</span>
                </div>
                <div className="flex items-center gap-[8px] text-[13px]">
                  <span className="size-[7px] shrink-0 rounded-full bg-bvc-bar" />
                  <span className="text-bvc-ink">Bản nhạc</span>
                  <span className="ml-auto font-mono text-bvc-muted">32 GB</span>
                </div>
                <div className="flex items-center gap-[8px] text-[13px]">
                  <span className="size-[7px] shrink-0 rounded-full bg-bvc-surface border border-bvc-border-strong" />
                  <span className="text-bvc-ink">Trống</span>
                  <span className="ml-auto font-mono text-bvc-muted">84 GB / 200 GB</span>
                </div>
              </div>
              <p className="mt-[12px] text-[12px] text-bvc-muted">
                Ước tính còn dùng được ~6 tháng với mức tăng trưởng hiện tại
              </p>
            </div>

            {/* Card: Thời gian xử lý AI (7 ngày) */}
            <div className="rounded-[20px] border border-bvc-border p-[18px]">
              <div className="mb-[14px]">
                <span className="text-[15px] font-extrabold tracking-[-0.025em]">Thời gian xử lý AI (7 ngày)</span>
              </div>
              <div className="flex items-end gap-2" style={{ height: "60px" }}>
                {BAR_HEIGHTS.map((h, i) => {
                  const isToday = i === BAR_HEIGHTS.length - 1;
                  return (
                    <div key={BAR_DAYS[i]} className="flex flex-1 flex-col items-center gap-[4px]">
                      <div
                        className={`w-full rounded-t-[4px] ${isToday ? "bg-bvc-accent" : "bg-bvc-bar"}`}
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-[6px] flex gap-2">
                {BAR_DAYS.map((day, i) => {
                  const isToday = i === BAR_DAYS.length - 1;
                  return (
                    <div key={day} className="flex flex-1 justify-center">
                      <span className={`text-[11px] font-mono ${isToday ? "text-bvc-accent-text font-bold" : "text-bvc-muted"}`}>
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
