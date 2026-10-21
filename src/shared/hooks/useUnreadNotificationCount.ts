import { useEffect, useState } from "react";
import { myNotificationApi } from "@/features/platform/api/myNotificationApi";

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
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  return count;
}
