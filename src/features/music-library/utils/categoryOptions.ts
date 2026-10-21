import type { SelectOption } from "@/shared/types/commonTypes";
import type { CategoryRef } from "@/features/music-library/types/musicLibraryTypes";

// GBR-44: danh mục đã gắn từ trước vẫn giữ được dù đã ngừng hoạt động, nên thêm lại vào danh sách chọn
export function withCurrentOptions(options: SelectOption[], current: CategoryRef[]): SelectOption[] {
  const missing = current
    .filter((ref) => !options.some((option) => option.value === ref.id))
    .map((ref) => ({ value: ref.id, label: `${ref.name} (ngừng hoạt động)` }));
  return [...options, ...missing];
}
