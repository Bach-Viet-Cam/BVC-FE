import {
  type NotificationStatusFilter,
  type NotificationTarget,
  type NotificationType,
} from "@/features/platform/types/notificationTypes";

export const NOTIFICATION_TYPE_OPTIONS: { value: NotificationType; label: string }[] = [
  { value: "DEADLINE", label: "Deadline" },
  { value: "BONUS", label: "Bonus" },
  { value: "ANNOUNCEMENT", label: "Thông báo chung" },
  { value: "SYSTEM", label: "Bảo trì" },
];

export const NOTIFICATION_TARGET_OPTIONS: { value: NotificationTarget; label: string }[] = [
  { value: "ALL", label: "Tất cả người dùng" },
  { value: "STUDENT", label: "Sinh viên" },
  { value: "TEACHER", label: "Giảng viên" },
];

export const NOTIFICATION_TARGET_LABELS: Record<NotificationTarget, string> = Object.fromEntries(
  NOTIFICATION_TARGET_OPTIONS.map((option) => [option.value, option.label])
) as Record<NotificationTarget, string>;

export const NOTIFICATION_FILTER_CHIPS: { value: NotificationStatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "SENT", label: "Đã gửi" },
  { value: "SCHEDULED", label: "Hẹn giờ" },
  { value: "DRAFT", label: "Nháp" },
];

export const NOTIFICATION_LIST_PAGE_SIZE = 100;
