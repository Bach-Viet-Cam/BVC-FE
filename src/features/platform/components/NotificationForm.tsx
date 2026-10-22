import { useForm } from "react-hook-form";
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
  notificationSchema,
  toDateTimeLocal,
  toScheduledIso,
  type NotificationFormValues,
} from "@/features/platform/utils/validateNotification";

const FIELD_CLASS =
  "w-full rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink placeholder:text-bvc-faint focus:border-bvc-ink focus:outline-none disabled:bg-bvc-surface disabled:text-bvc-muted";
const LABEL_CLASS = "text-[13px] font-semibold text-bvc-muted";
const ERROR_CLASS = "text-[12px] text-bvc-accent-text";

interface NotificationFormProps {
  item: NotificationItem | null;
  defaultType: NotificationType;
  onSave: (values: NotificationFormValues, action: NotificationAction) => Promise<NotificationItem | null>;
  onDelete: (item: NotificationItem) => void;
}

export function NotificationForm({ item, defaultType, onSave, onDelete }: NotificationFormProps) {
  const isSent = item?.status === "SENT";
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
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
  const activeType = watch("type");
  const scheduledAt = watch("scheduledAt");

  const submit = (action: NotificationAction) =>
    handleSubmit(async (values) => {
      const scheduledIso = toScheduledIso(values.scheduledAt);
      if (action === "send" && scheduledIso && new Date(scheduledIso).getTime() <= Date.now()) {
        setError("scheduledAt", { message: "Thời điểm hẹn giờ phải ở tương lai." });
        return;
      }
      await onSave(values, action);
    });

  return (
    <form className="flex flex-1 flex-col gap-[14px]" onSubmit={(event) => event.preventDefault()}>
      <span className="text-[15px] font-bold text-bvc-ink">{item ? "Chi tiết thông báo" : "Thông báo mới"}</span>

      {isSent && item?.sentAt && (
        <div className="rounded-[14px] bg-bvc-surface p-[12px_14px] text-[13px] text-bvc-muted">
          Đã gửi lúc {formatNotificationTime(item.sentAt)} cho {item.recipientCount} người nhận. Thông báo đã gửi không
          thể sửa hoặc xóa.
        </div>
      )}

      <div className="flex flex-col gap-[5px]">
        <label className={LABEL_CLASS} htmlFor="notification-title">
          Tiêu đề
        </label>
        <input
          id="notification-title"
          type="text"
          placeholder="Nhập tiêu đề thông báo..."
          disabled={isSent}
          className={`h-[46px] ${FIELD_CLASS}`}
          {...register("title")}
        />
        {errors.title && <p className={ERROR_CLASS}>{errors.title.message}</p>}
      </div>

      <div className="flex flex-col gap-[5px]">
        <label className={LABEL_CLASS} htmlFor="notification-body">
          Nội dung
        </label>
        <textarea
          id="notification-body"
          placeholder="Nhập nội dung thông báo..."
          disabled={isSent}
          className={`min-h-[80px] py-3 ${FIELD_CLASS}`}
          {...register("body")}
        />
        {errors.body && <p className={ERROR_CLASS}>{errors.body.message}</p>}
      </div>

      <div className="flex flex-col gap-[5px]">
        <label className={LABEL_CLASS} htmlFor="notification-target">
          Đối tượng
        </label>
        <select
          id="notification-target"
          disabled={isSent}
          className={`h-[46px] cursor-pointer ${FIELD_CLASS}`}
          {...register("target")}
        >
          {NOTIFICATION_TARGET_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-[5px]">
        <span className={LABEL_CLASS}>Loại</span>
        <div className="flex flex-wrap gap-2">
          {NOTIFICATION_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={isSent}
              onClick={() => setValue("type", option.value, { shouldDirty: true })}
              className={`cursor-pointer rounded-[11px] px-3 py-1.5 text-[13px] disabled:cursor-not-allowed ${
                activeType === option.value
                  ? "bg-bvc-ink font-bold text-white"
                  : "border border-bvc-border-strong text-bvc-muted"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-[5px]">
        <label className={LABEL_CLASS} htmlFor="notification-schedule">
          Hẹn giờ gửi
        </label>
        <input
          id="notification-schedule"
          type="datetime-local"
          disabled={isSent}
          className={`h-[46px] ${FIELD_CLASS}`}
          {...register("scheduledAt")}
        />
        {errors.scheduledAt && <p className={ERROR_CLASS}>{errors.scheduledAt.message}</p>}
        {!isSent && <p className="text-[12px] text-bvc-faint">Để trống để gửi ngay khi bấm “Gửi ngay”.</p>}
      </div>

      {!isSent && (
        <div className="mt-auto flex flex-col gap-2 pt-[4px]">
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={submit("draft")}
              className="flex min-h-[44px] flex-1 cursor-pointer items-center justify-center rounded-[14px] border border-bvc-border-strong bg-white text-[14px] font-semibold text-bvc-ink disabled:opacity-60"
            >
              Lưu nháp
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={submit("send")}
              className="flex min-h-[44px] flex-1 cursor-pointer items-center justify-center rounded-[14px] bg-bvc-ink text-[14px] font-bold text-white disabled:opacity-60"
            >
              {scheduledAt ? "Hẹn giờ gửi" : "Gửi ngay"}
            </button>
          </div>
          {item && (
            <button
              type="button"
              onClick={() => onDelete(item)}
              className="cursor-pointer text-[13px] font-semibold text-bvc-accent-text"
            >
              Xóa thông báo
            </button>
          )}
        </div>
      )}
    </form>
  );
}
