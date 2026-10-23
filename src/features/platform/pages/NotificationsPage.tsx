import { Clock, Megaphone, Settings, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FilterChips } from "@/shared/components/bvc";
import { RoleShell } from "@/shared/components/bvc/RoleShell";
import { useMyNotifications } from "@/features/platform/hooks/useMyNotifications";
import { type NotificationType } from "@/features/platform/types/notificationTypes";
import { type MyNotificationFilter, type MyNotificationItem } from "@/features/platform/types/myNotificationTypes";
import {
  MY_NOTIFICATION_FILTERS,
  formatNotificationTimestamp,
  groupByDay,
} from "@/features/platform/utils/myNotificationFormat";
import { cn } from "@/shared/utils/cn";

const TYPE_ICONS: Record<NotificationType, { icon: typeof Clock; className: string; iconClassName: string }> = {
  DEADLINE: { icon: Clock, className: "bg-bvc-accent-tint", iconClassName: "text-bvc-accent-text" },
  BONUS: { icon: Star, className: "bg-bvc-surface", iconClassName: "text-bvc-ink" },
  ANNOUNCEMENT: { icon: Megaphone, className: "bg-bvc-surface", iconClassName: "text-bvc-ink" },
  SYSTEM: { icon: Settings, className: "bg-bvc-surface", iconClassName: "text-bvc-muted" },
};

interface NotifIconProps {
  type: NotificationType;
}

function NotifIcon({ type }: NotifIconProps) {
  const { icon: Icon, className, iconClassName } = TYPE_ICONS[type];
  return (
    <div className={cn("flex size-[40px] shrink-0 items-center justify-center rounded-full", className)}>
      <Icon size={18} className={iconClassName} />
    </div>
  );
}

interface NotifRowProps {
  notif: MyNotificationItem;
  now: Date;
  onOpen: (notif: MyNotificationItem) => void;
}

function NotifRow({ notif, now, onOpen }: NotifRowProps) {
  const isUnread = !notif.isRead;
  return (
    <button
      type="button"
      onClick={() => onOpen(notif)}
      className="relative flex w-full cursor-pointer items-start gap-3 border-b border-bvc-line px-[14px] py-[13px] text-left"
    >
      {isUnread && (
        <span
          aria-label="Chưa đọc"
          className="absolute right-[14px] top-[20px] size-[7px] rounded-full bg-bvc-accent"
        />
      )}
      <NotifIcon type={notif.type} />
      <div className="min-w-0 flex-1 pr-4">
        <div className={`text-[14px] text-bvc-ink ${isUnread ? "font-bold" : "font-semibold"}`}>{notif.title}</div>
        <div className="mt-[2px] whitespace-pre-line text-[13px] text-bvc-muted">{notif.body}</div>
        <div className="mt-[3px] font-mono text-[11px] text-bvc-faint">
          {formatNotificationTimestamp(notif.sentAt, now)}
        </div>
      </div>
    </button>
  );
}

interface NotifSectionProps {
  title: string;
  items: MyNotificationItem[];
  now: Date;
  onOpen: (notif: MyNotificationItem) => void;
}

function NotifSection({ title, items, now, onOpen }: NotifSectionProps) {
  if (items.length === 0) return null;
  return (
    <>
      <div className="px-[14px] pb-2 pt-4 text-[11px] font-bold uppercase tracking-[0.1em] text-bvc-muted">{title}</div>
      {items.map((notif) => (
        <NotifRow key={notif.id} notif={notif} now={now} onOpen={onOpen} />
      ))}
    </>
  );
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const {
    filter,
    setFilter,
    items,
    unreadCount,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    markRead,
    markAllRead,
  } = useMyNotifications();
  const now = new Date();
  const { today, earlier } = groupByDay(items, now);

  const openNotification = (notif: MyNotificationItem) => {
    void markRead(notif);
    if (notif.link) navigate(notif.link);
  };

  return (
    <RoleShell
      title="Thông báo"
      actions={
        <button
          type="button"
          disabled={unreadCount === 0}
          onClick={() => void markAllRead()}
          className="min-h-[44px] cursor-pointer px-2 text-[13px] font-semibold text-bvc-accent-text disabled:cursor-not-allowed disabled:opacity-50"
        >
          Đọc tất cả
        </button>
      }
    >
      <div className="-mx-[14px]">
        <FilterChips
          chips={MY_NOTIFICATION_FILTERS}
          active={filter}
          onChange={(value) => setFilter(value as MyNotificationFilter)} // value luôn lấy từ MY_NOTIFICATION_FILTERS
        />
      </div>

      <div className="overflow-hidden rounded-[20px] border border-bvc-border bg-white">
        {isLoading || error ? (
          <p className={cn("px-[14px] pt-6 text-center text-[14px]", error ? "text-bvc-error" : "text-bvc-muted")}>
            {error ?? "Đang tải..."}
          </p>
        ) : (
          <>
            <NotifSection title="Hôm nay" items={today} now={now} onOpen={openNotification} />
            <NotifSection title="Trước đó" items={earlier} now={now} onOpen={openNotification} />
            {items.length === 0 && (
              <div className="flex h-[200px] items-center justify-center text-[14px] text-bvc-faint">
                Không có thông báo
              </div>
            )}
            {hasMore && (
              <div className="flex justify-center px-[14px] py-4">
                <button
                  type="button"
                  disabled={isLoadingMore}
                  onClick={() => void loadMore()}
                  className="min-h-[40px] rounded-[12px] border border-bvc-border-strong px-4 text-[13px] font-semibold text-bvc-ink disabled:opacity-50"
                >
                  {isLoadingMore ? "Đang tải..." : "Xem thêm"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </RoleShell>
  );
}
