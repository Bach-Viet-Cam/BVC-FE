import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { DesktopSidebar, DesktopPageHeader } from "@/shared/components/bvc";

const NAV_ITEMS = [
  { label: "Tổng quan", to: "/admin" },
  { label: "Người dùng", to: "/admin/users" },
  { label: "Cấu hình hệ thống", to: "/admin/config" },
  { label: "Phân loại nội dung", to: "/admin/categories" },
  { label: "Giám sát hệ thống", to: "/admin/monitoring" },
  { label: "Quản lý thông báo", to: "/admin/notifications" },
  { label: "Nội dung đã xác minh", to: "/community/verified" },
];

const INSTRUMENTS = ["Đàn bầu", "Đàn nhị", "Đàn nguyệt", "Đàn tranh", "Tỳ bà", "Sáo trúc"];

interface LimitRow {
  label: string;
  defaultValue: number;
  suffix?: string;
}

const LIMIT_ROWS: LimitRow[] = [
  { label: "Dung lượng tối đa (MB)", defaultValue: 50 },
  { label: "Thời lượng tối đa (phút)", defaultValue: 10 },
  { label: "Số lần submit mặc định", defaultValue: 3 },
  { label: "BPM tối đa", defaultValue: 200 },
];

interface ThresholdRow {
  label: string;
  defaultValue: number;
  suffix: string;
}

const THRESHOLD_ROWS: ThresholdRow[] = [
  { label: "Ngưỡng đạt (Accuracy ≥)", defaultValue: 75, suffix: "%" },
  { label: "Ngưỡng Verified (≥)", defaultValue: 85, suffix: "%" },
  { label: "Ngưỡng Warning (<)", defaultValue: 60, suffix: "%" },
];

interface ToggleRow {
  label: string;
  key: string;
  defaultOn: boolean;
}

const TOGGLE_ROWS: ToggleRow[] = [
  { label: "Phân tích tự động khi upload", key: "autoAnalyze", defaultOn: true },
  { label: "AI pre-check cho bonus submission", key: "aiPreCheck", defaultOn: true },
  { label: "Gợi ý luyện tập từ AI", key: "aiSuggest", defaultOn: false },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`relative h-[26px] w-[44px] cursor-pointer rounded-full transition-colors ${on ? "bg-bvc-ink" : "bg-bvc-bar"}`}
    >
      <span
        className={`absolute top-[3px] size-[20px] rounded-full bg-white transition-all ${on ? "left-[21px]" : "left-[3px]"}`}
      />
    </button>
  );
}

export function SystemConfigPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(TOGGLE_ROWS.map((r) => [r.key, r.defaultOn]))
  );

  function flipToggle(key: string) {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <DesktopSidebar
        items={NAV_ITEMS}
        user={{ initials: "AD", name: "Admin BVC", role: "Quản trị viên" }}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DesktopPageHeader
          breadcrumb="M06 · Quản trị"
          title="Cấu hình hệ thống"
          actions={
            <>
              <button
                type="button"
                className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] border border-bvc-border-strong bg-white px-[16px] text-[14px] font-semibold text-bvc-ink"
              >
                Đặt lại mặc định
              </button>
              <button
                type="button"
                className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] bg-bvc-ink px-[18px] text-[14px] font-bold text-white"
              >
                Lưu thay đổi
              </button>
            </>
          }
        />

        <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto p-[22px_32px_26px]">
          <div className="grid grid-cols-2 gap-[20px]">

            {/* Card 1: Nhạc cụ */}
            <div className="rounded-[20px] border border-bvc-border p-[18px]">
              <div className="mb-[10px] flex items-center justify-between">
                <span className="text-[15px] font-extrabold tracking-[-0.025em]">Nhạc cụ</span>
                <button type="button" className="cursor-pointer text-[13px] font-semibold text-bvc-ink underline-offset-2 hover:underline">
                  Thêm nhạc cụ
                </button>
              </div>
              <div className="flex flex-col">
                {INSTRUMENTS.map((name) => (
                  <div
                    key={name}
                    className="flex h-[44px] items-center border-b border-bvc-line text-[14px] text-bvc-ink last:border-0"
                  >
                    <span className="flex-1">{name}</span>
                    <Pencil size={15} className="ml-auto cursor-pointer text-bvc-muted" />
                    <Trash2 size={15} className="ml-2 cursor-pointer text-bvc-muted" />
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Giới hạn file */}
            <div className="rounded-[20px] border border-bvc-border p-[18px]">
              <div className="mb-[10px]">
                <span className="text-[15px] font-extrabold tracking-[-0.025em]">Giới hạn file</span>
              </div>
              <div className="flex flex-col">
                {LIMIT_ROWS.map((row) => (
                  <div
                    key={row.label}
                    className="flex h-[52px] items-center justify-between border-b border-bvc-line text-[14px] last:border-0"
                  >
                    <span className="text-bvc-ink">{row.label}</span>
                    <input
                      type="number"
                      defaultValue={row.defaultValue}
                      className="h-[38px] w-[100px] rounded-[11px] border border-bvc-border-strong bg-white text-center font-mono text-[14px] text-bvc-ink focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Ngưỡng đánh giá */}
            <div className="rounded-[20px] border border-bvc-border p-[18px]">
              <div className="mb-[10px]">
                <span className="text-[15px] font-extrabold tracking-[-0.025em]">Ngưỡng đánh giá</span>
              </div>
              <div className="flex flex-col">
                {THRESHOLD_ROWS.map((row) => (
                  <div
                    key={row.label}
                    className="flex h-[52px] items-center justify-between border-b border-bvc-line text-[14px] last:border-0"
                  >
                    <span className="font-mono text-bvc-ink">{row.label}</span>
                    <div className="flex items-center gap-[6px]">
                      <input
                        type="number"
                        defaultValue={row.defaultValue}
                        className="h-[38px] w-[100px] rounded-[11px] border border-bvc-border-strong bg-white text-center font-mono text-[14px] text-bvc-ink focus:outline-none"
                      />
                      <span className="text-[14px] text-bvc-muted">{row.suffix}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 4: Phân tích AI */}
            <div className="rounded-[20px] border border-bvc-border p-[18px]">
              <div className="mb-[10px]">
                <span className="text-[15px] font-extrabold tracking-[-0.025em]">Phân tích AI</span>
              </div>
              <div className="flex flex-col">
                {TOGGLE_ROWS.map((row) => (
                  <div
                    key={row.key}
                    className="flex h-[52px] items-center justify-between border-b border-bvc-line text-[14px] last:border-0"
                  >
                    <span className="text-bvc-ink">{row.label}</span>
                    <Toggle on={toggles[row.key]} onToggle={() => flipToggle(row.key)} />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
