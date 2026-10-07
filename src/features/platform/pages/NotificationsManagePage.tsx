import { useState } from "react";
import { Bell } from "lucide-react";
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

type NotifStatus = "sent" | "scheduled" | "draft";
type NotifType = "deadline" | "bonus" | "maintenance" | "system";

interface NotifCard {
  type: NotifType;
  title: string;
  target: string;
  scheduled: string;
  status: NotifStatus;
}

const NOTIFICATIONS: NotifCard[] = [
  { type: "deadline", title: "Hạn nộp bài tập tuần 4", target: "TRD301 · 28 sv", scheduled: "Đã gửi 24/09", status: "sent" },
  { type: "bonus", title: "Bonus Assignment mới: Recording tự chọn", target: "Cả trường · 312 sv", scheduled: "Đã gửi 22/09", status: "sent" },
  { type: "maintenance", title: "Bảo trì hệ thống 25/09 22:00", target: "Cả trường", scheduled: "Hẹn giờ 25/09 08:00", status: "scheduled" },
  { type: "deadline", title: "Hạn nộp ensemble tuần 5", target: "TRD301, TRD401", scheduled: "Hẹn giờ 29/09 09:00", status: "scheduled" },
  { type: "system", title: "Cập nhật điểm rèn luyện Q3", target: "Cả trường", scheduled: "Nháp", status: "draft" },
];

const FILTER_CHIPS = [
  { label: "Tất cả", value: "all" },
  { label: "Đã gửi", value: "sent" },
  { label: "Hẹn giờ", value: "scheduled" },
  { label: "Nháp", value: "draft" },
];

const NOTIF_TYPE_LABELS = ["Deadline", "Bonus", "Thông báo lớp", "Bảo trì"];

function StatusBadge({ status }: { status: NotifStatus }) {
  if (status === "sent") {
    return (
      <span className="flex items-center gap-[5px] text-[12px] text-bvc-muted">
        <span className="size-[7px] shrink-0 rounded-full bg-bvc-ok" />
        Đã gửi
      </span>
    );
  }
  if (status === "scheduled") {
    return (
      <span className="rounded-[9px] border border-bvc-border bg-bvc-surface px-2 py-0.5 text-[12px] text-bvc-muted">
        Hẹn giờ
      </span>
    );
  }
  return (
    <span className="rounded-[9px] border border-bvc-border px-2 py-0.5 text-[12px] text-bvc-faint">
      Nháp
    </span>
  );
}

export function NotificationsManagePage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [activeType, setActiveType] = useState(0);

  const filtered = activeFilter === "all"
    ? NOTIFICATIONS
    : NOTIFICATIONS.filter((n) => n.status === activeFilter);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <DesktopSidebar
        items={NAV_ITEMS}
        user={{ initials: "AD", name: "Admin BVC", role: "Quản trị viên" }}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DesktopPageHeader
          breadcrumb="M06 · Quản trị"
          title="Quản lý thông báo"
          actions={
            <button
              type="button"
              className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] bg-bvc-ink px-[18px] text-[14px] font-bold text-white"
            >
              Soạn thông báo mới
            </button>
          }
        />

        <div className="flex flex-1 gap-[20px] overflow-hidden p-[22px_32px_26px]">

          {/* Left: Danh sách thông báo */}
          <div className="flex flex-1 flex-col overflow-y-auto">
            {/* Filter chips */}
            <div className="mb-4 flex gap-2">
              {FILTER_CHIPS.map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => setActiveFilter(chip.value)}
                  className={`cursor-pointer rounded-[11px] px-3 py-1.5 text-[13px] ${
                    activeFilter === chip.value
                      ? "bg-bvc-ink font-bold text-white"
                      : "border border-bvc-border-strong text-bvc-muted"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Notification cards */}
            {filtered.map((notif, idx) => (
              <button
                key={notif.title}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`mb-3 w-full cursor-pointer rounded-[20px] border p-[14px] text-left ${
                  idx === selectedIdx
                    ? "border-bvc-ink bg-bvc-surface"
                    : "border-bvc-border"
                }`}
              >
                <div className="flex items-start gap-[10px]">
                  <Bell size={16} className="mt-[2px] shrink-0 text-bvc-muted" />
                  <div className="flex flex-1 flex-col gap-[4px]">
                    <span className="font-bold text-[14px] text-bvc-ink">{notif.title}</span>
                    <span className="text-[12px] text-bvc-muted">{notif.target}</span>
                    <div className="mt-[6px] flex items-center justify-between">
                      <span className="text-[12px] text-bvc-muted">{notif.scheduled}</span>
                      <StatusBadge status={notif.status} />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Soạn thông báo */}
          <div className="flex w-[400px] shrink-0 flex-col gap-[14px] overflow-y-auto rounded-[20px] border border-bvc-border p-[20px]">
            <span className="font-bold text-[15px] text-bvc-ink">Thông báo mới</span>

            {/* Tiêu đề */}
            <div className="flex flex-col gap-[5px]">
              <label className="text-[13px] font-semibold text-bvc-muted">Tiêu đề</label>
              <input
                type="text"
                placeholder="Nhập tiêu đề thông báo..."
                className="h-[46px] w-full rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink placeholder:text-bvc-faint focus:border-bvc-ink focus:outline-none"
              />
            </div>

            {/* Nội dung */}
            <div className="flex flex-col gap-[5px]">
              <label className="text-[13px] font-semibold text-bvc-muted">Nội dung</label>
              <textarea
                placeholder="Nhập nội dung thông báo..."
                className="min-h-[80px] w-full rounded-[14px] border border-bvc-border-strong bg-white px-4 py-3 text-[14px] text-bvc-ink placeholder:text-bvc-faint focus:border-bvc-ink focus:outline-none"
              />
            </div>

            {/* Đối tượng */}
            <div className="flex flex-col gap-[5px]">
              <label className="text-[13px] font-semibold text-bvc-muted">Đối tượng</label>
              <select className="h-[46px] w-full cursor-pointer rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink focus:border-bvc-ink focus:outline-none">
                <option>Cả trường</option>
                <option>TRD301</option>
                <option>TRD201</option>
                <option>TRD401</option>
              </select>
            </div>

            {/* Loại */}
            <div className="flex flex-col gap-[5px]">
              <label className="text-[13px] font-semibold text-bvc-muted">Loại</label>
              <div className="flex flex-wrap gap-2">
                {NOTIF_TYPE_LABELS.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setActiveType(i)}
                    className={`cursor-pointer rounded-[11px] px-3 py-1.5 text-[13px] ${
                      activeType === i
                        ? "bg-bvc-ink font-bold text-white"
                        : "border border-bvc-border-strong text-bvc-muted"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hẹn giờ gửi */}
            <div className="flex flex-col gap-[5px]">
              <label className="text-[13px] font-semibold text-bvc-muted">Hẹn giờ gửi</label>
              <input
                type="datetime-local"
                className="h-[46px] w-full rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink focus:border-bvc-ink focus:outline-none"
              />
            </div>

            {/* Buttons */}
            <div className="mt-auto flex gap-2 pt-[4px]">
              <button
                type="button"
                className="flex flex-1 min-h-[44px] cursor-pointer items-center justify-center rounded-[14px] border border-bvc-border-strong bg-white text-[14px] font-semibold text-bvc-ink"
              >
                Lưu nháp
              </button>
              <button
                type="button"
                className="flex flex-1 min-h-[44px] cursor-pointer items-center justify-center rounded-[14px] bg-bvc-ink text-[14px] font-bold text-white"
              >
                Gửi ngay
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
