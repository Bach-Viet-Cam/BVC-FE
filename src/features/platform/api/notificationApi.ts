import { axiosClient } from "@/shared/api/axiosClient";
import { type ApiResponse, type PaginatedData } from "@/shared/types/commonTypes";
import {
  type NotificationItem,
  type NotificationListParams,
  type NotificationSavePayload,
} from "@/features/platform/types/notificationTypes";

export const notificationApi = {
  list: (params: NotificationListParams) =>
    axiosClient.get<ApiResponse<PaginatedData<NotificationItem>>>("/admin/notifications", { params }),
  create: (body: NotificationSavePayload) =>
    axiosClient.post<ApiResponse<NotificationItem>>("/admin/notifications", body),
  update: (id: string, body: NotificationSavePayload) =>
    axiosClient.patch<ApiResponse<NotificationItem>>(`/admin/notifications/${id}`, body),
  send: (id: string) => axiosClient.post<ApiResponse<NotificationItem>>(`/admin/notifications/${id}/send`),
  remove: (id: string) => axiosClient.delete<ApiResponse<{ id: string }>>(`/admin/notifications/${id}`),
};
