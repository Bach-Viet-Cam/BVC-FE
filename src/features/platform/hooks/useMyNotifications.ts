import { useCallback, useEffect, useState } from "react";
import { myNotificationApi } from "@/features/platform/api/myNotificationApi";
import { type MyNotificationFilter, type MyNotificationItem } from "@/features/platform/types/myNotificationTypes";
import { toMyNotificationParams } from "@/features/platform/utils/myNotificationFormat";
import { toast } from "@/shared/components/ui/toast";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

const LOAD_ERROR = "Tải thông báo thất bại. Vui lòng thử lại.";

interface InboxState {
  filter: MyNotificationFilter;
  items: MyNotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
}

export function useMyNotifications() {
  const [filter, setFilter] = useState<MyNotificationFilter>("all");
  const [inbox, setInbox] = useState<InboxState | null>(null);
  const [loadError, setLoadError] = useState<{ filter: MyNotificationFilter; message: string } | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    myNotificationApi.list(toMyNotificationParams(filter, 1)).then(
      ({ data: body }) => {
        if (cancelled) return;
        setInbox({
          filter,
          items: body.data.items,
          total: body.data.total,
          unreadCount: body.data.unreadCount,
          page: 1,
        });
        setLoadError(null);
      },
      (failure: unknown) => {
        if (!cancelled) setLoadError({ filter, message: getApiErrorMessage(failure, LOAD_ERROR) });
      }
    );
    return () => {
      cancelled = true;
    };
  }, [filter]);

  const current = inbox?.filter === filter ? inbox : null;

  const loadMore = useCallback(async () => {
    if (!current) return;
    setIsLoadingMore(true);
    try {
      const { data: body } = await myNotificationApi.list(toMyNotificationParams(current.filter, current.page + 1));
      setInbox({
        ...current,
        items: [
          ...current.items,
          ...body.data.items.filter((item) => !current.items.some((seen) => seen.id === item.id)),
        ],
        total: body.data.total,
        unreadCount: body.data.unreadCount,
        page: current.page + 1,
      });
    } catch (loadError: unknown) {
      toast.error(getApiErrorMessage(loadError, LOAD_ERROR));
    } finally {
      setIsLoadingMore(false);
    }
  }, [current]);

  // Đánh dấu ngay trên giao diện; lỗi mạng chỉ báo toast, lần tải sau sẽ đồng bộ lại
  const markRead = useCallback(async (item: MyNotificationItem) => {
    if (item.isRead) return;
    setInbox(
      (state) =>
        state && {
          ...state,
          items: state.items.map((entry) => (entry.id === item.id ? { ...entry, isRead: true } : entry)),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }
    );
    try {
      await myNotificationApi.markRead(item.id);
    } catch (markError: unknown) {
      toast.error(getApiErrorMessage(markError, "Không thể đánh dấu đã đọc. Vui lòng thử lại."));
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      const { data: body } = await myNotificationApi.markAllRead();
      setInbox(
        (state) =>
          state && { ...state, items: state.items.map((entry) => ({ ...entry, isRead: true })), unreadCount: 0 }
      );
      toast.success(body.message);
    } catch (markError: unknown) {
      toast.error(getApiErrorMessage(markError, "Không thể đánh dấu đã đọc. Vui lòng thử lại."));
    }
  }, []);

  return {
    filter,
    setFilter,
    items: current?.items ?? [],
    unreadCount: current?.unreadCount ?? 0,
    hasMore: current ? current.items.length < current.total : false,
    isLoading: current === null && loadError?.filter !== filter,
    isLoadingMore,
    error: current ? null : loadError?.filter === filter ? loadError.message : null,
    loadMore,
    markRead,
    markAllRead,
  };
}
