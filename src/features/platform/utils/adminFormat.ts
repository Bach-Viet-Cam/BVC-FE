const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB"];
const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), BYTE_UNITS.length - 1);
  const value = bytes / 1024 ** exponent;
  const text = value >= 100 || exponent === 0 ? String(Math.round(value)) : value.toFixed(1);
  return `${text} ${BYTE_UNITS[exponent]}`;
}

export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  if (totalSeconds < 3600) return `${Math.floor(totalSeconds / 60)}m ${totalSeconds % 60}s`;
  return `${Math.floor(totalSeconds / 3600)}h ${Math.floor((totalSeconds % 3600) / 60)}m`;
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`;
}

/** "2026-10-16" → "16/10" */
export function formatDayShort(dateKey: string): string {
  return `${dateKey.slice(8, 10)}/${dateKey.slice(5, 7)}`;
}

/** "2026-10-16" → "T6" (khóa ngày đã là giờ VN nên dựng ở UTC để giữ nguyên thứ). */
export function formatWeekday(dateKey: string): string {
  return WEEKDAYS[new Date(`${dateKey}T00:00:00Z`).getUTCDay()];
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getTodayLabel(): string {
  return new Date().toLocaleDateString("vi-VN");
}

/** Chuyển danh sách số đếm thành chiều cao cột (%), tối thiểu 4% để cột rỗng vẫn thấy được. */
export function scaleBarHeights(counts: number[]): number[] {
  const max = Math.max(...counts, 0);
  if (max === 0) return counts.map(() => 4);
  return counts.map((count) => Math.max(4, Math.round((count / max) * 100)));
}
