import { type AccountStatus, type ClassStatus } from "@/features/classes/types/classTypes";

// Business dates are calendar dates in Asia/Ho_Chi_Minh (UTC+7), carried as yyyy-MM-dd.
const BUSINESS_TIME_ZONE = "Asia/Ho_Chi_Minh";
const DAY_MS = 24 * 60 * 60 * 1000;

export const CLASS_DURATION_DAYS = 42;

export const CLASS_STATUS_LABELS: Record<ClassStatus, string> = {
  ACTIVE: "Hoạt động",
  ENDED: "Đã kết thúc",
};

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  ACTIVE: "Hoạt động",
  PENDING: "Chờ kích hoạt",
  LOCKED: "Đã khóa",
};

export function todayInVietnam(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  return new Date(date.getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

export function calculateEndDate(startDate: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(startDate) ? addDays(startDate, CLASS_DURATION_DAYS) : "";
}

const CLASS_WEEKS = CLASS_DURATION_DAYS / 7;

// "4/6" for a running class, "6/6" once finished, "-" before the start date.
export function formatCurrentWeek(startDate: string, status: ClassStatus, today: string = todayInVietnam()): string {
  if (status === "ENDED") return `${CLASS_WEEKS}/${CLASS_WEEKS}`;
  const elapsedDays = (Date.parse(`${today}T00:00:00.000Z`) - Date.parse(`${startDate}T00:00:00.000Z`)) / DAY_MS;
  if (Number.isNaN(elapsedDays) || elapsedDays < 0) return "-";
  return `${Math.min(Math.floor(elapsedDays / 7) + 1, CLASS_WEEKS)}/${CLASS_WEEKS}`;
}

export function formatIsoDate(isoDate: string): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

// "01/09 – 13/10/2026" as on the class card
export function formatDateRange(startDate: string, endDate: string): string {
  const [, startMonth, startDay] = startDate.split("-");
  return `${startDay}/${startMonth} – ${formatIsoDate(endDate)}`;
}

// dd/MM/yyyy (as typed in the form) → yyyy-MM-dd, or null when it is not a real calendar date.
export function parseVietnameseDate(displayDate: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(displayDate.trim());
  if (!match) return null;
  const [, day, month, year] = match;
  const isoDate = `${year}-${month}-${day}`;
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === isoDate ? isoDate : null;
}

// Keeps only digits and inserts the slashes: "01092026" → "01/09/2026".
export function maskDateInput(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join("/");
}
