import { useSearchParams } from "react-router-dom";

export const CREATE_PARAM = "create";

// Trạng thái mở modal tạo mới nằm trên URL (?create=<name>&...giá trị điền sẵn) để đường dẫn cũ
// ".../new" chuyển về trang danh sách vẫn mở đúng modal.
export function useCreateDialog<TPreset extends string = never>(name: string, presetKeys: readonly TPreset[] = []) {
  const [searchParams, setSearchParams] = useSearchParams();
  const isOpen = searchParams.get(CREATE_PARAM) === name;

  const presets = Object.fromEntries(
    presetKeys.map((key) => [key, isOpen ? (searchParams.get(key) ?? "") : ""])
  ) as Record<TPreset, string>;

  const open = (values: Partial<Record<TPreset, string>> = {}) =>
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.set(CREATE_PARAM, name);
        for (const key of presetKeys) {
          const value = values[key];
          if (value) next.set(key, value);
          else next.delete(key);
        }
        return next;
      },
      { replace: true }
    );

  const close = () =>
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete(CREATE_PARAM);
        for (const key of presetKeys) next.delete(key);
        return next;
      },
      { replace: true }
    );

  return { isOpen, presets, open, close };
}
