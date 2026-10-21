export type NotificationType = "DEADLINE" | "ANNOUNCEMENT" | "SYSTEM" | "BONUS";
export type NotificationTarget = "ALL" | "STUDENT" | "TEACHER";
export type NotificationStatus = "DRAFT" | "SCHEDULED" | "SENT";
export type NotificationStatusFilter = NotificationStatus | "all";
export type NotificationAction = "draft" | "send";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  target: NotificationTarget;
  status: NotificationStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  recipientCount: number;
  createdAt: string;
}

export interface NotificationSavePayload {
  title: string;
  body: string;
  type: NotificationType;
  target: NotificationTarget;
  scheduledAt: string | null;
  action: NotificationAction;
}

export interface NotificationListParams {
  status?: NotificationStatus;
  page: number;
  pageSize: number;
}
