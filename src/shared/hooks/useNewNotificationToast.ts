import { useEffect } from "react";
import { myNotificationApi } from "@/features/platform/api/myNotificationApi";
import { toast } from "@/shared/components/ui/toast";

const POLL_INTERVAL_MS = 15_000;
const TOAST_TIMEOUT_MS = 5_000;
const LATEST_PAGE_SIZE = 5;

// Phát khi có thông báo mới để chuông cập nhật số chưa đọc ngay, không chờ chu kỳ làm mới
export const NOTIFICATIONS_ARRIVED_EVENT = "bvc:notifications-arrived";

// Hiện thông báo tạm 5 giây khi có thông báo mới; lần tải đầu chỉ ghi nhận, không bật lại thông báo cũ
export function useNewNotificationToast(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let seenIds: Set<string> | null = null;

    const poll = () => {
      myNotificationApi.list({ unreadOnly: true, page: 1, pageSize: LATEST_PAGE_SIZE }).then(
        ({ data: body }) => {
          if (cancelled) return;
          const items = body.data.items;
          if (seenIds) {
            const fresh = items.filter((item) => !seenIds?.has(item.id));
            // API trả mới nhất trước; đảo lại để thông báo mới nhất nằm trên cùng
            [...fresh].reverse().forEach((item) => {
              toast.custom({ title: item.title, description: item.body, type: "info", timeout: TOAST_TIMEOUT_MS });
            });
            if (fresh.length > 0) window.dispatchEvent(new Event(NOTIFICATIONS_ARRIVED_EVENT));
          } else {
            seenIds = new Set();
          }
          items.forEach((item) => seenIds?.add(item.id));
        },
        () => undefined
      );
    };

    poll();
    const timer = window.setInterval(poll, POLL_INTERVAL_MS);
    window.addEventListener("focus", poll);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", poll);
    };
  }, [enabled]);
}
