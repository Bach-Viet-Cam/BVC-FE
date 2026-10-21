import { z } from "zod";

export const notificationSchema = z.object({
  title: z.string().trim().min(1, "Vui lòng nhập tiêu đề").max(150, "Tiêu đề tối đa 150 ký tự"),
  body: z.string().trim().min(1, "Vui lòng nhập nội dung").max(2000, "Nội dung tối đa 2000 ký tự"),
  type: z.enum(["DEADLINE", "ANNOUNCEMENT", "SYSTEM", "BONUS"]),
  target: z.enum(["ALL", "STUDENT", "TEACHER"]),
  scheduledAt: z.string(),
});

export type NotificationFormValues = z.infer<typeof notificationSchema>;

/** Giá trị `datetime-local` (giờ máy người dùng) → ISO UTC; rỗng hoặc sai → null. */
export function toScheduledIso(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** ISO → chuỗi cho `<input type="datetime-local">` (giờ máy người dùng). */
export function toDateTimeLocal(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatNotificationTime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
