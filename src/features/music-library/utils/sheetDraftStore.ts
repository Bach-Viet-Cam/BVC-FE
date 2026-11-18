import type { SheetFormValues } from "@/features/music-library/utils/validateSheet";

// Bản nháp chỉ sống trong bộ nhớ module: File PDF/WAV không serialize được qua history.state hay sessionStorage.
// Luồng: form → trang thu âm → form. Không dùng cho việc lưu tạm giữa các lần tải lại trang.
let draft: SheetFormValues | null = null;

export function saveSheetDraft(values: SheetFormValues): void {
  draft = values;
}

export function getSheetDraft(): SheetFormValues | null {
  return draft;
}

export function clearSheetDraft(): void {
  draft = null;
}
