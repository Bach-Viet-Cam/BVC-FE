import { axiosClient } from "@/shared/api/axiosClient";
import { type ApiResponse } from "@/shared/types/commonTypes";
import {
  type MyNotificationItem,
  type MyNotificationListParams,
  type MyNotificationPage,
} from "@/features/platform/types/myNotificationTypes";

export const myNotificationApi = {
  list: (params: MyNotificationListParams) =>
    axiosClient.get<ApiResponse<MyNotificationPage>>("/me/notifications", { params }),
  countUnread: () => axiosClient.get<ApiResponse<{ count: number }>>("/me/notifications/unread-count"),
  markRead: (id: string) => axiosClient.patch<ApiResponse<MyNotificationItem>>(`/me/notifications/${id}/read`),
  markAllRead: () => axiosClient.patch<ApiResponse<{ updated: number }>>("/me/notifications/read-all"),
};
