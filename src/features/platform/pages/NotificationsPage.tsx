import { useState } from "react";
import { Clock, Star, BarChart2, Settings } from "lucide-react";
import { MobileHeader, FilterChips } from "@/shared/components/bvc";

type NotifType = "deadline" | "bonus" | "result" | "system";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

const TODAY_NOTIFS: Notification[] = [
  {
    id: "n1",
    type: "deadline",
    title: "Hạn nộp bài tập tuần 4 — TRD301",
    body: "Còn 2 ngày trước hạn 26/09",
    time: "09:14",
    unread: true,
  },
  {
    id: "n2",
    type: "bonus",
    title: "Bonus Assignment mới",
    body: "Recording tự chọn — điểm thưởng đến +2",
    time: "08:30",
    unread: true,
  },
  {
    id: "n3",
    type: "result",
    title: "Kết quả phân tích đã có",
    body: "Recording Lý ngựa ô — 82%",
    time: "07:55",
    unread: false,
  },
];

const WEEK_NOTIFS: Notification[] = [
  {
    id: "n4",
    type: "system",
    title: "Bảo trì hệ thống hoàn tất",
    body: "Hệ thống đã ổn định sau bảo trì lúc 22:00",
    time: "22/09",
    unread: false,
  },
  {
    id: "n5",
    type: "deadline",
    title: "Hạn nộp scale tuần 4",
    body: "Đã nộp đúng hạn",
    time: "21/09",
    unread: false,
  },
];

const FILTER_CHIPS = [
  { value: "all", label: "Tất cả" },
  { value: "unread", label: "Chưa đọc" },
  { value: "deadline", label: "Deadline" },
  { value: "system", label: "Hệ thống" },
];

function NotifIcon({ type }: { type: NotifType }) {
  if (type === "deadline") {
    return (
      <div className="size-[40px] rounded-full bg-bvc-accent-tint flex items-center justify-center shrink-0">
        <Clock size={18} className="text-bvc-accent-text" />
      </div>
    );
  }
  if (type === "bonus") {
    return (
      <div className="size-[40px] rounded-full bg-bvc-surface flex items-center justify-center shrink-0">
        <Star size={18} className="text-bvc-ink" />
      </div>
    );
  }
  if (type === "result") {
    return (
      <div className="size-[40px] rounded-full bg-bvc-surface flex items-center justify-center shrink-0">
        <BarChart2 size={18} className="text-bvc-ink" />
      </div>
    );
  }
  return (
    <div className="size-[40px] rounded-full bg-bvc-surface flex items-center justify-center shrink-0">
      <Settings size={18} className="text-bvc-muted" />
    </div>
  );
}

function NotifRow({ notif }: { notif: Notification }) {
  return (
    <div className="flex items-start gap-3 px-[14px] py-[13px] border-b border-bvc-line cursor-pointer relative">
      {notif.unread && (
        <span className="size-[7px] rounded-full bg-bvc-accent absolute right-[14px] top-[20px]" />
      )}
      <NotifIcon type={notif.type} />
      <div className="flex-1 min-w-0 pr-4">
        <div className={`text-[14px] text-bvc-ink ${notif.unread ? "font-bold" : "font-semibold"}`}>
          {notif.title}
        </div>
        <div className="text-[13px] text-bvc-muted mt-[2px]">{notif.body}</div>
        <div className="text-[11px] font-mono text-bvc-faint mt-[3px]">{notif.time}</div>
      </div>
    </div>
  );
}

export function NotificationsPage() {
  const [filter, setFilter] = useState("all");

  const filterNotif = (notif: Notification): boolean => {
    if (filter === "all") return true;
    if (filter === "unread") return notif.unread;
    if (filter === "deadline") return notif.type === "deadline";
    if (filter === "system") return notif.type === "system";
    return true;
  };

  const filteredToday = TODAY_NOTIFS.filter(filterNotif);
  const filteredWeek = WEEK_NOTIFS.filter(filterNotif);

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">
        <MobileHeader
          title="Thông báo"
          rightSlot={
            <button type="button" className="text-[13px] font-semibold text-bvc-accent-text px-2 min-h-[44px]">
              Đọc tất cả
            </button>
          }
        />

        <FilterChips chips={FILTER_CHIPS} active={filter} onChange={setFilter} />

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {filteredToday.length > 0 && (
            <>
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-bvc-muted px-[14px] pt-4 pb-2">
                Hôm nay
              </div>
              {filteredToday.map((n) => (
                <NotifRow key={n.id} notif={n} />
              ))}
            </>
          )}

          {filteredWeek.length > 0 && (
            <>
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-bvc-muted px-[14px] pt-4 pb-2">
                Tuần này
              </div>
              {filteredWeek.map((n) => (
                <NotifRow key={n.id} notif={n} />
              ))}
            </>
          )}

          {filteredToday.length === 0 && filteredWeek.length === 0 && (
            <div className="flex items-center justify-center h-[200px] text-[14px] text-bvc-faint">
              Không có thông báo
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
