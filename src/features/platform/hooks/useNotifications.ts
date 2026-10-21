import { useCallback, useState } from "react";
import { notificationApi } from "@/features/platform/api/notificationApi";
import { NOTIFICATION_LIST_PAGE_SIZE } from "@/features/platform/constants/notificationConstants";
import {
  type NotificationAction,
  type NotificationItem,
  type NotificationListParams,
  type NotificationStatusFilter,
} from "@/features/platform/types/notificationTypes";
import { toScheduledIso, type NotificationFormValues } from "@/features/platform/utils/validateNotification";
import { toast } from "@/shared/components/ui/toast";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { type PaginatedData } from "@/shared/types/commonTypes";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

const LOAD_ERROR = "Tải danh sách thông báo thất bại. Vui lòng thử lại.";

export function useNotifications() {
  const [status, setStatus] = useState<NotificationStatusFilter>("all");
  const params: NotificationListParams = {
    status: status === "all" ? undefined : status,
    page: 1,
    pageSize: NOTIFICATION_LIST_PAGE_SIZE,
  };
  const { data, error, isLoading, reload } = useAsyncData<PaginatedData<NotificationItem>>(
    () => notificationApi.list(params).then(({ data: body }) => body.data),
    JSON.stringify(params),
    LOAD_ERROR
  );

  const save = useCallback(
    async (
      id: string | null,
      values: NotificationFormValues,
      action: NotificationAction
    ): Promise<NotificationItem | null> => {
      const payload = {
        title: values.title,
        body: values.body,
        type: values.type,
        target: values.target,
        scheduledAt: toScheduledIso(values.scheduledAt),
        action,
      };
      try {
        const { data: body } = id ? await notificationApi.update(id, payload) : await notificationApi.create(payload);
        toast.success(body.message);
        reload();
        return body.data;
      } catch (saveError: unknown) {
        toast.error(getApiErrorMessage(saveError, "Không thể lưu thông báo. Vui lòng thử lại."));
        return null;
      }
    },
    [reload]
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { data: body } = await notificationApi.remove(id);
        toast.success(body.message);
        reload();
        return true;
      } catch (removeError: unknown) {
        toast.error(getApiErrorMessage(removeError, "Không thể xóa thông báo. Vui lòng thử lại."));
        return false;
      }
    },
    [reload]
  );

  return {
    status,
    setStatus,
    items: data?.items ?? [],
    total: data?.total ?? 0,
    error,
    isInitialLoading: isLoading && data === null,
    reload,
    save,
    remove,
  };
}
