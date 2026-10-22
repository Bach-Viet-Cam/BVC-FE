import { type NotificationType } from "@/features/platform/types/notificationTypes";
import { type PaginatedData } from "@/shared/types/commonTypes";

export type MyNotificationFilter = "all" | "unread" | "DEADLINE" | "BONUS" | "SYSTEM";

export interface MyNotificationItem {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  link: string | null;
  isRead: boolean;
  sentAt: string;
}

export interface MyNotificationPage extends PaginatedData<MyNotificationItem> {
  unreadCount: number;
}

export interface MyNotificationListParams {
  unreadOnly?: boolean;
  type?: NotificationType;
  page: number;
  pageSize: number;
}
