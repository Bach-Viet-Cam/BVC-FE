import { isAxiosError } from "axios";

interface ErrorBody {
  message?: string;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<ErrorBody>(error)) {
    return error.response?.data?.message || fallback;
  }
  return fallback;
}
