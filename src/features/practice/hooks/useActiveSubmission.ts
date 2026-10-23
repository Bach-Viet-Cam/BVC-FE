import { useCallback, useEffect, useState } from "react";
import { practiceSubmissionApi } from "@/features/practice/api/practiceSubmissionApi";
import type { PracticeSubmission } from "@/features/practice/types/practiceSubmissionTypes";

// GBR-49: bản nộp của bài này đang xử lý thì khóa ghi âm và tải lên (bài khác vẫn nộp được)
export function useActiveSubmission(sheetMusicId: string) {
  const [active, setActive] = useState<PracticeSubmission | null>(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (!sheetMusicId) return;
    const controller = new AbortController();
    practiceSubmissionApi
      .getActive(sheetMusicId, controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) setActive(response.data.data);
      })
      .catch(() => {
        // Không kiểm tra được thì vẫn cho gửi: BE chặn lại bằng 409 nếu đang có bản xử lý
        if (!controller.signal.aborted) setActive(null);
      });
    return () => controller.abort();
  }, [sheetMusicId, round]);

  const refresh = useCallback(() => setRound((value) => value + 1), []);

  return { active, refresh };
}
