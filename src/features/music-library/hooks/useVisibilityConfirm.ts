import { useCallback, useState } from "react";
import type { EditableVisibility } from "@/features/music-library/types/musicLibraryTypes";

interface PendingChange<T> {
  item: T;
  visibility: EditableVisibility;
  reason: "hide" | "warning";
}

/**
 * Ẩn nội dung luôn hỏi lại; công khai chỉ hỏi khi có cảnh báo (ví dụ chưa có bản nhạc công khai).
 */
export function useVisibilityConfirm<T>(apply: (item: T, visibility: EditableVisibility) => Promise<void>) {
  const [pending, setPending] = useState<PendingChange<T> | null>(null);
  const [isApplying, setApplying] = useState(false);

  const request = useCallback(
    (item: T, visibility: EditableVisibility, needsWarning = false) => {
      if (visibility === "HIDDEN") setPending({ item, visibility, reason: "hide" });
      else if (needsWarning) setPending({ item, visibility, reason: "warning" });
      else void apply(item, visibility);
    },
    [apply]
  );

  const confirm = useCallback(async () => {
    if (!pending) return;
    setApplying(true);
    try {
      await apply(pending.item, pending.visibility);
    } finally {
      setApplying(false);
      setPending(null);
    }
  }, [apply, pending]);

  const cancel = useCallback(() => setPending(null), []);

  return { pending, request, confirm, cancel, isApplying };
}
