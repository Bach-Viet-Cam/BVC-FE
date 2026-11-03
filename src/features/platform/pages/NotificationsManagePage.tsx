import { useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { DesktopPageHeader } from "@/shared/components/bvc";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { FormDialog } from "@/shared/components/bvc/FormDialog";
import { PillTabs } from "@/shared/components/bvc/PillTabs";
import { type DraftFormHandle } from "@/shared/hooks/useLeaveGuard";
import { NotificationDeleteDialog } from "@/features/platform/components/NotificationDeleteDialog";
import { NotificationForm } from "@/features/platform/components/NotificationForm";
import { PageStatus } from "@/features/platform/components/PageStatus";
import {
  NOTIFICATION_FILTER_CHIPS,
  NOTIFICATION_TARGET_LABELS,
  NOTIFICATION_TYPE_OPTIONS,
} from "@/features/platform/constants/notificationConstants";
import { useNotifications } from "@/features/platform/hooks/useNotifications";
import {
  type NotificationItem,
  type NotificationStatus,
  type NotificationType,
} from "@/features/platform/types/notificationTypes";
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
    return (
      <span className="rounded-[9px] border border-bvc-border bg-bvc-surface px-2 py-0.5 text-[12px] text-bvc-muted">
        Hẹn giờ
      </span>
    );
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

interface EditorState {
  // null = soạn thông báo mới
  item: NotificationItem | null;
}

export function NotificationsManagePage() {
  const { status, setStatus, items, total, error, isInitialLoading, reload, save, remove } = useNotifications();
  const [searchParams] = useSearchParams();
  const presetType = parseType(searchParams.get("type"));
  // Đi từ lối tắt có ?type=... thì mở sẵn modal soạn thông báo loại đó
  const [editor, setEditor] = useState<EditorState | null>(() => (searchParams.has("type") ? { item: null } : null));
  const [deleteTarget, setDeleteTarget] = useState<NotificationItem | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const formRef = useRef<DraftFormHandle>(null);
  const editingItem = editor?.item ?? null;
  const canSaveDraft = editingItem?.status !== "SENT";

  const closeEditor = () => {
    setIsDirty(false);
    setEditor(null);
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <DesktopPageHeader
        breadcrumb="Quản trị"
        title="Quản lý thông báo"
        actions={<ActionButton onClick={() => setEditor({ item: null })}>Soạn thông báo mới</ActionButton>}
      />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-[16px_18px_24px] md:p-[22px_32px_26px]">
        <PillTabs label="Lọc theo trạng thái" tabs={NOTIFICATION_FILTER_CHIPS} value={status} onChange={setStatus} />

        <PageStatus isLoading={isInitialLoading} error={error} onRetry={reload}>
          {items.length === 0 && <p className="py-[10px] text-[13px] text-bvc-muted">Chưa có thông báo nào.</p>}
          <div className="grid gap-3 lg:grid-cols-2">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setEditor({ item })}
                className="w-full cursor-pointer rounded-bvc-xl border border-bvc-border p-[14px] text-left transition-colors hover:bg-bvc-soft"
              >
                <div className="flex items-start gap-[10px]">
                  <Bell size={16} className="mt-[2px] shrink-0 text-bvc-muted" />
                  <div className="flex flex-1 flex-col gap-[4px]">
                    <span className="text-[14px] font-medium text-bvc-ink">{item.title}</span>
                    <span className="text-[12px] text-bvc-muted">{describeTarget(item)}</span>
                    <div className="mt-[6px] flex items-center justify-between">
                      <span className="text-[12px] text-bvc-muted">{describeSchedule(item)}</span>
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {total > items.length && (
            <p className="text-[12px] text-bvc-muted">
              Hiển thị {items.length}/{total} thông báo mới nhất.
            </p>
          )}
        </PageStatus>
      </div>

      <FormDialog
        open={editor !== null}
        onClose={closeEditor}
        title={editingItem ? "Chi tiết thông báo" : "Soạn thông báo mới"}
        size="lg"
        isDirty={isDirty}
        onSaveDraft={canSaveDraft ? async () => (await formRef.current?.saveDraft()) ?? false : undefined}
      >
        {(requestClose) => (
          <NotificationForm
            key={`${editingItem?.id ?? "new"}-${editingItem?.status ?? ""}`}
            ref={formRef}
            item={editingItem}
            defaultType={presetType}
            onSave={async (values, action) => {
              const saved = await save(editingItem?.id ?? null, values, action);
              if (saved) closeEditor();
              return saved;
            }}
            onDelete={setDeleteTarget}
            onCancel={requestClose}
            onDirtyChange={setIsDirty}
          />
        )}
      </FormDialog>

      <NotificationDeleteDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async (item) => {
          const isRemoved = await remove(item.id);
          if (isRemoved && editingItem?.id === item.id) closeEditor();
          return isRemoved;
        }}
      />
    </div>
  );
}
