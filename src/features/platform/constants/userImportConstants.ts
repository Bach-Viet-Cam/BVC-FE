import { type StudentImportAction } from "@/features/platform/types/userImportTypes";

export const IMPORT_MAX_ROWS = 1000;
export const IMPORT_MAX_BYTES = 5 * 1024 * 1024;
export const IMPORT_ACCEPT = ".xlsx,.xls";
/** Đọc dư vài dòng so với giới hạn để chịu được dòng trống đầu file, vẫn đủ để phát hiện file vượt quá. */
export const IMPORT_SHEET_ROWS_LIMIT = IMPORT_MAX_ROWS + 20;
export const IMPORT_TEMPLATE_FILE_NAME = "mau-import-sinh-vien.xlsx";

export const IMPORT_ACTION_LABELS: Record<StudentImportAction, string> = {
  CREATE: "Tạo mới",
  UPDATE: "Cập nhật",
  SKIP: "Bỏ qua",
  ERROR: "Lỗi",
};

export const IMPORT_ACTION_BADGE: Record<StudentImportAction, string> = {
  CREATE: "bg-[#EBF5EE] text-bvc-ok",
  UPDATE: "bg-bvc-surface text-bvc-ink",
  SKIP: "border border-bvc-border text-bvc-muted",
  ERROR: "bg-bvc-accent-tint text-bvc-accent-text",
};
