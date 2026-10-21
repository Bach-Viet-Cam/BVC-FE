import {
  type MyNotificationFilter,
  type MyNotificationItem,
  type MyNotificationListParams,
} from "@/features/platform/types/myNotificationTypes";

export const MY_NOTIFICATION_PAGE_SIZE = 20;

export const MY_NOTIFICATION_FILTERS: { value: MyNotificationFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "unread", label: "Chưa đọc" },
  { value: "DEADLINE", label: "Deadline" },
  { value: "BONUS", label: "Bonus" },
  { value: "SYSTEM", label: "Hệ thống" },
];

export function toMyNotificationParams(filter: MyNotificationFilter, page: number): MyNotificationListParams {
  const base = { page, pageSize: MY_NOTIFICATION_PAGE_SIZE };
  if (filter === "all") return base;
  if (filter === "unread") return { ...base, unreadOnly: true };
  return { ...base, type: filter };
}

// Ngày theo giờ Việt Nam, dạng YYYY-MM-DD để so sánh
function toVietnamDay(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(date);
}

export function isSentToday(isoTimestamp: string, now: Date): boolean {
  return toVietnamDay(new Date(isoTimestamp)) === toVietnamDay(now);
}

// Hôm nay hiện giờ (14:30), ngày khác hiện ngày (21/10)
export function formatNotificationTimestamp(isoTimestamp: string, now: Date): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(isoTimestamp))
      .map((part) => [part.type, part.value])
  );
  return isSentToday(isoTimestamp, now) ? `${parts.hour}:${parts.minute}` : `${parts.day}/${parts.month}`;
}

export function groupByDay(items: MyNotificationItem[], now: Date) {
  return {
    today: items.filter((item) => isSentToday(item.sentAt, now)),
    earlier: items.filter((item) => !isSentToday(item.sentAt, now)),
  };
}
