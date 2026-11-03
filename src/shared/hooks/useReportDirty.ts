import { useEffect } from "react";

// Form báo ra ngoài khi người dùng đã nhập gì đó, để nơi chứa form hỏi lại trước khi thoát
export function useReportDirty(isDirty: boolean, onDirtyChange?: (isDirty: boolean) => void) {
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);
}
