import { useEffect, useState } from "react";
import { myNotificationApi } from "@/features/platform/api/myNotificationApi";
import { NOTIFICATIONS_ARRIVED_EVENT } from "@/shared/hooks/useNewNotificationToast";

const REFRESH_INTERVAL_MS = 60_000;

// Số thông báo chưa đọc cho icon chuông; lỗi mạng thì giữ số cũ, không làm phiền người dùng
export function useUnreadNotificationCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      myNotificationApi.countUnread().then(
        ({ data: body }) => {
          if (!cancelled) setCount(body.data.count);
        },
        () => undefined
      );
    };
    refresh();
    const timer = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    window.addEventListener("focus", refresh);
    window.addEventListener(NOTIFICATIONS_ARRIVED_EVENT, refresh);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      window.removeEventListener(NOTIFICATIONS_ARRIVED_EVENT, refresh);
    };
  }, []);

  return count;
}
