import { isAxiosError } from "axios";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { uploadMediaFile } from "@/features/music-library/api/uploadApi";
import type { UploadKind } from "@/features/music-library/types/lecturerTypes";

export interface FormFailure<F extends string> {
  // Có field thì tô đỏ đúng ô, không có thì hiện lỗi chung của form
  field?: F;
  message: string;
}

// Lỗi upload trả field "file"; gắn lại tên trường BE (coverFileId, sheetFileId…) để biết ô nào lỗi
class UploadFieldError extends Error {
  constructor(
    readonly apiField: string,
    message: string
  ) {
    super(message);
  }
}

export async function uploadForField(apiField: string, kind: UploadKind, file: File) {
  try {
    return await uploadMediaFile(kind, file);
  } catch (error) {
    throw new UploadFieldError(apiField, getErrorMessage(error, "Tải file lên thất bại. Vui lòng thử lại."));
  }
}

// fieldMap: tên trường BE → tên ô trong form
export function toFormFailure<F extends string>(
  error: unknown,
  fallback: string,
  fieldMap: Partial<Record<string, F>>
): FormFailure<F> {
  if (error instanceof UploadFieldError) return { field: fieldMap[error.apiField], message: error.message };
  const apiField = isAxiosError<{ field?: string }>(error) ? error.response?.data?.field : undefined;
  return { field: apiField ? fieldMap[apiField] : undefined, message: getErrorMessage(error, fallback) };
}
