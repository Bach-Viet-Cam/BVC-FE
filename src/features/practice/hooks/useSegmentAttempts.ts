import { useCallback, useEffect, useState } from "react";
import { practiceSegmentApi } from "@/features/practice/api/practiceSegmentApi";
import type { SegmentSummary } from "@/features/practice/types/practiceSegmentTypes";

const PAGE_SIZE = 5;

// Các lần luyện đoạn của một bản nộp, mới nhất trước, tải thêm theo con trỏ
export function useSegmentAttempts(submissionId: string, enabled: boolean) {
  const [items, setItems] = useState<SegmentSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const [cursorToLoad, setCursorToLoad] = useState<string | null>(null);

  // Lần gọi hiện tại (lần tải lại + con trỏ); chưa khớp với lần đã xong nghĩa là đang tải
  const requestKey = `${round}:${cursorToLoad ?? ""}`;

  useEffect(() => {
    if (!enabled || !submissionId) return;
    const controller = new AbortController();
    practiceSegmentApi
      .listBySubmission(submissionId, { limit: PAGE_SIZE, ...(cursorToLoad ? { cursor: cursorToLoad } : {}) }, controller.signal)
      .then((response) => {
        if (controller.signal.aborted) return;
        const page = response.data.data;
        setItems((current) => (cursorToLoad ? [...current, ...page.items] : page.items));
        setNextCursor(page.nextCursor);
      })
      .catch(() => undefined) // Thẻ này chỉ là phụ; lỗi tải thì để trống thay vì chặn trang kết quả
      .finally(() => {
        if (!controller.signal.aborted) setLoadedKey(requestKey);
      });
    return () => controller.abort();
  }, [submissionId, enabled, round, cursorToLoad, requestKey]);

  const loadMore = useCallback(() => {
    if (nextCursor) setCursorToLoad(nextCursor);
  }, [nextCursor]);

  const reload = useCallback(() => {
    setCursorToLoad(null);
    setRound((value) => value + 1);
  }, []);

  return { items, loading: enabled && loadedKey !== requestKey, hasMore: nextCursor !== null, loadMore, reload };
}
