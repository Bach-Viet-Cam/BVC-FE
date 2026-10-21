import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useUnreadNotificationCount } from "@/shared/hooks/useUnreadNotificationCount";
import { cn } from "@/shared/utils/cn";

interface NotificationBellProps {
  className: string;
  iconClassName: string;
}

export function NotificationBell({ className, iconClassName }: NotificationBellProps) {
  const unreadCount = useUnreadNotificationCount();
  const label = unreadCount > 0 ? `Thông báo, ${unreadCount} chưa đọc` : "Thông báo";

  return (
    <Link to="/notifications" aria-label={label} className={cn("relative", className)}>
      <Bell className={iconClassName} strokeWidth={1.6} />
      {unreadCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-[5px] -top-[5px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-bvc-error px-[4px] text-[10.5px] font-bold leading-none text-white"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
