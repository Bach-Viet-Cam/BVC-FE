import { useImperativeHandle, type Ref } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  NOTIFICATION_TARGET_OPTIONS,
  NOTIFICATION_TYPE_OPTIONS,
} from "@/features/platform/constants/notificationConstants";
import {
  type NotificationAction,
  type NotificationItem,
  type NotificationType,
} from "@/features/platform/types/notificationTypes";
import {
  formatNotificationTime,
  isPastSchedule,
  notificationSchema,
  toDateTimeLocal,
  toScheduledIso,
  type NotificationFormValues,
} from "@/features/platform/utils/validateNotification";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { FormField } from "@/shared/components/bvc/FormField";
import { FormBody, FormFooter } from "@/shared/components/bvc/FormLayout";
import { INPUT_CLASSES } from "@/shared/components/bvc/fieldStyles";
import { type DraftFormHandle } from "@/shared/hooks/useLeaveGuard";
import { useReportDirty } from "@/shared/hooks/useReportDirty";
import { cn } from "@/shared/utils/cn";

interface NotificationFormProps {
  item: NotificationItem | null;
  defaultType: NotificationType;
  onSave: (values: NotificationFormValues, action: NotificationAction) => Promise<NotificationItem | null>;
  onDelete: (item: NotificationItem) => void;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  // Cho hộp hỏi lại khi thoát gọi "Lưu bản nháp"
  ref?: Ref<DraftFormHandle>;
}

export function NotificationForm({
  item,
  defaultType,
  onSave,
  onDelete,
  onCancel,
  onDirtyChange,
  ref,
}: NotificationFormProps) {
  const isSent = item?.status === "SENT";
  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: item?.title ?? "",
      body: item?.body ?? "",
      type: item?.type ?? defaultType,
      target: item?.target ?? "ALL",
      scheduledAt: toDateTimeLocal(item?.scheduledAt ?? null),
    },
  });
  useReportDirty(isDirty, onDirtyChange);
  const activeType = useWatch({ control, name: "type" });
  const scheduledAt = useWatch({ control, name: "scheduledAt" });

  const save = async (values: NotificationFormValues, action: NotificationAction) => {
    const scheduledIso = toScheduledIso(values.scheduledAt);
    if (action === "send" && scheduledIso && isPastSchedule(scheduledIso)) {
      setError("scheduledAt", { message: "Thời điểm hẹn giờ phải ở tương lai." });
      return false;
    }
    return (await onSave(values, action)) !== null;
  };

  const submit = (action: NotificationAction) =>
    handleSubmit(async (values) => {
      await save(values, action);
    });

  useImperativeHandle(ref, () => ({
    saveDraft: () =>
      new Promise<boolean>((resolve) => {
        void handleSubmit(
          async (values) => resolve(await save(values, "draft")),
          () => resolve(false)
        )();
      }),
  }));

  return (
    <form className="flex flex-col" onSubmit={(event) => event.preventDefault()}>
      <FormBody>
        {isSent && item?.sentAt && (
          <p className="rounded-[13px] bg-bvc-surface px-3.5 py-3 text-[13px] text-bvc-muted">
            Đã gửi lúc {formatNotificationTime(item.sentAt)} cho {item.recipientCount} người nhận. Thông báo đã gửi
            không thể sửa hoặc xóa.
          </p>
        )}

        <FormField label="Tiêu đề" htmlFor="notification-title" required error={errors.title?.message}>
          <input
            id="notification-title"
            type="text"
            placeholder="Nhập tiêu đề thông báo..."
            disabled={isSent}
            aria-invalid={Boolean(errors.title)}
            className={INPUT_CLASSES}
            {...register("title")}
          />
        </FormField>

        <FormField label="Nội dung" htmlFor="notification-body" required error={errors.body?.message}>
          <textarea
            id="notification-body"
            placeholder="Nhập nội dung thông báo..."
            disabled={isSent}
            aria-invalid={Boolean(errors.body)}
            className={cn(INPUT_CLASSES, "h-auto min-h-[96px] resize-y py-3")}
            {...register("body")}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Đối tượng" htmlFor="notification-target">
            <select
              id="notification-target"
              disabled={isSent}
              className={cn(INPUT_CLASSES, "cursor-pointer")}
              {...register("target")}
            >
              {NOTIFICATION_TARGET_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Hẹn giờ gửi"
            htmlFor="notification-schedule"
            hint={isSent ? undefined : "Để trống để gửi ngay khi bấm “Gửi ngay”."}
            error={errors.scheduledAt?.message}
          >
            <input
              id="notification-schedule"
              type="datetime-local"
              disabled={isSent}
              aria-invalid={Boolean(errors.scheduledAt)}
              className={INPUT_CLASSES}
              {...register("scheduledAt")}
            />
          </FormField>
        </div>

        <FormField label="Loại">
          <div className="flex flex-wrap gap-2">
            {NOTIFICATION_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={isSent}
                aria-pressed={activeType === option.value}
                onClick={() => setValue("type", option.value, { shouldDirty: true })}
                className={cn(
                  "min-h-9 cursor-pointer rounded-full px-3.5 text-[13px] disabled:cursor-not-allowed",
                  activeType === option.value
                    ? "bg-bvc-ink font-medium text-white"
                    : "border border-bvc-border-strong text-bvc-muted hover:bg-bvc-surface"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </FormField>

        {item && !isSent && (
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="cursor-pointer self-start text-[13px] font-medium text-bvc-accent-text"
          >
            Xóa thông báo
          </button>
        )}
      </FormBody>

      <FormFooter>
        <ActionButton variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          {isSent ? "Đóng" : "Hủy"}
        </ActionButton>
        {!isSent && (
          <>
            <ActionButton variant="secondary" disabled={isSubmitting} onClick={submit("draft")}>
              Lưu nháp
            </ActionButton>
            <ActionButton disabled={isSubmitting} onClick={submit("send")}>
              {scheduledAt ? "Hẹn giờ gửi" : "Gửi ngay"}
            </ActionButton>
          </>
        )}
      </FormFooter>
    </form>
  );
}
