import { useState } from "react";
import { Bell } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { DesktopPageHeader } from "@/shared/components/bvc";
import { NotificationDeleteDialog } from "@/features/platform/components/NotificationDeleteDialog";
import { NotificationForm } from "@/features/platform/components/NotificationForm";
import { PageStatus } from "@/features/platform/components/PageStatus";
import {
  NOTIFICATION_FILTER_CHIPS,
  NOTIFICATION_TARGET_LABELS,
  NOTIFICATION_TYPE_OPTIONS,
} from "@/features/platform/constants/notificationConstants";
import { useNotifications } from "@/features/platform/hooks/useNotifications";
import { type NotificationItem, type NotificationStatus, type NotificationType } from "@/features/platform/types/notificationTypes";
import { formatNotificationTime } from "@/features/platform/utils/validateNotification";

function StatusBadge({ status }: { status: NotificationStatus }) {
  if (status === "SENT") {
    return (
      <span className="flex items-center gap-[5px] text-[12px] text-bvc-muted">
        <span className="size-[7px] shrink-0 rounded-full bg-bvc-ok" />
        Đã gửi
      </span>
    );
  }
  if (status === "SCHEDULED") {
    return <span className="rounded-[9px] border border-bvc-border bg-bvc-surface px-2 py-0.5 text-[12px] text-bvc-muted">Hẹn giờ</span>;
  }
  return <span className="rounded-[9px] border border-bvc-border px-2 py-0.5 text-[12px] text-bvc-faint">Nháp</span>;
}

function describeSchedule(item: NotificationItem): string {
  if (item.status === "SENT" && item.sentAt) return `Đã gửi ${formatNotificationTime(item.sentAt)}`;
  if (item.status === "SCHEDULED" && item.scheduledAt) return `Hẹn giờ ${formatNotificationTime(item.scheduledAt)}`;
  return "Nháp";
}

function describeTarget(item: NotificationItem): string {
  const label = NOTIFICATION_TARGET_LABELS[item.target];
  return item.status === "SENT" ? `${label} · ${item.recipientCount} người nhận` : label;
}

function parseType(value: string | null): NotificationType {
  return NOTIFICATION_TYPE_OPTIONS.find((option) => option.value === value)?.value ?? "ANNOUNCEMENT";
}

export function NotificationsManagePage() {
  const { status, setStatus, items, total, error, isInitialLoading, reload, save, remove } = useNotifications();
  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState<NotificationItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NotificationItem | null>(null);
  const presetType = parseType(searchParams.get("type"));

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <DesktopPageHeader
        breadcrumb="M06 · Quản trị"
        title="Quản lý thông báo"
        actions={
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] bg-bvc-ink px-[18px] text-[14px] font-bold text-white"
          >
            Soạn thông báo mới
          </button>
        }
      />

      <div className="flex flex-1 gap-[20px] overflow-hidden p-[22px_32px_26px]">
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="mb-4 flex gap-2">
            {NOTIFICATION_FILTER_CHIPS.map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => setStatus(chip.value)}
                className={`cursor-pointer rounded-[11px] px-3 py-1.5 text-[13px] ${
                  status === chip.value ? "bg-bvc-ink font-bold text-white" : "border border-bvc-border-strong text-bvc-muted"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <PageStatus isLoading={isInitialLoading} error={error} onRetry={reload}>
            {items.length === 0 && <p className="py-[10px] text-[13px] text-bvc-muted">Chưa có thông báo nào.</p>}
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item)}
                className={`mb-3 w-full cursor-pointer rounded-[20px] border p-[14px] text-left ${
                  item.id === selected?.id ? "border-bvc-ink bg-bvc-surface" : "border-bvc-border"
                }`}
              >
                <div className="flex items-start gap-[10px]">
                  <Bell size={16} className="mt-[2px] shrink-0 text-bvc-muted" />
                  <div className="flex flex-1 flex-col gap-[4px]">
                    <span className="text-[14px] font-bold text-bvc-ink">{item.title}</span>
                    <span className="text-[12px] text-bvc-muted">{describeTarget(item)}</span>
                    <div className="mt-[6px] flex items-center justify-between">
                      <span className="text-[12px] text-bvc-muted">{describeSchedule(item)}</span>
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                </div>
              </button>
            ))}
            {total > items.length && (
              <p className="text-[12px] text-bvc-muted">Hiển thị {items.length}/{total} thông báo mới nhất.</p>
            )}
          </PageStatus>
        </div>

        <div className="flex w-[400px] shrink-0 flex-col overflow-y-auto rounded-[20px] border border-bvc-border p-[20px]">
          <NotificationForm
            key={`${selected?.id ?? "new"}-${selected?.status ?? ""}-${selected ? "" : presetType}`}
            item={selected}
            defaultType={presetType}
            onSave={async (values, action) => {
              const saved = await save(selected?.id ?? null, values, action);
              if (saved) setSelected(saved);
              return saved;
            }}
            onDelete={setDeleteTarget}
          />
        </div>
      </div>

      <NotificationDeleteDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async (item) => {
          const isRemoved = await remove(item.id);
          if (isRemoved && selected?.id === item.id) setSelected(null);
          return isRemoved;
        }}
      />
    </main>
  );
}
