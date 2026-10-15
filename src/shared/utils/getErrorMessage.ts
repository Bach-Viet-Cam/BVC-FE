import { isAxiosError } from "axios";

export function getErrorMessage(error: unknown, fallback = "Đã có lỗi xảy ra. Vui lòng thử lại.") {
  if (isAxiosError<{ message?: string }>(error)) return error.response?.data?.message ?? fallback;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
