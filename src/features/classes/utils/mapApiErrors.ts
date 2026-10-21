import { isAxiosError } from "axios";
import { type FieldValues, type Path, type UseFormSetError } from "react-hook-form";
import { type ApiErrorBody, type ApiFieldError } from "@/features/classes/types/classTypes";

export interface ParsedApiError {
  status: number | null;
  message: string;
  code?: string;
  fieldErrors: ApiFieldError[];
}

export function parseApiError(error: unknown, fallbackMessage: string): ParsedApiError {
  if (!isAxiosError<ApiErrorBody>(error) || !error.response) {
    return { status: null, message: fallbackMessage, fieldErrors: [] };
  }
  const body = error.response.data;
  const hasServerMessage = error.response.status < 500 && Boolean(body?.message);
  return {
    status: error.response.status,
    message: hasServerMessage ? body.message : fallbackMessage,
    code: body?.code,
    fieldErrors: body?.errors ?? [],
  };
}

// Shows server field errors (MSG-05 duplicate, MSG-08 locked field, …) under the matching inputs.
// Returns the field errors that did not match a form field so the caller can toast them.
export function applyFieldErrors<TValues extends FieldValues>(
  fieldErrors: ApiFieldError[],
  fieldNames: ReadonlyArray<Path<TValues>>,
  setError: UseFormSetError<TValues>
): ApiFieldError[] {
  const unmatched: ApiFieldError[] = [];
  for (const fieldError of fieldErrors) {
    const fieldName = fieldNames.find((name) => name === fieldError.field);
    if (fieldName) {
      setError(fieldName, { type: "server", message: fieldError.message });
      continue;
    }
    unmatched.push(fieldError);
  }
  return unmatched;
}
