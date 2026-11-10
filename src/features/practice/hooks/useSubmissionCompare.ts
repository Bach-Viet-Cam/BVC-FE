import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { submissionCompareApi } from "@/features/practice/api/submissionCompareApi";
import type { CompareSegment } from "@/features/practice/types/submissionHistoryTypes";
import { useResultPart } from "@/features/practice/hooks/useResultPart";
import { buildSegmentRecordPath } from "@/features/practice/utils/segmentFormat";

const LOAD_ERROR = "Tải kết quả so sánh thất bại. Vui lòng thử lại.";

// SCR-02: so sánh hai bài nộp (GET /practice/submissions/compare). Thiếu bài hoặc hai bài trùng nhau thì không gọi API.
export function useSubmissionCompare() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const a = searchParams.get("a") ?? "";
  const b = searchParams.get("b") ?? "";
  const invalid = !a || !b || a === b;

  // useResultPart gọi lại khi fetcher đổi nên fetcher chỉ đổi theo cặp bài; khóa truyền vào chỉ để nhận biết yêu cầu
  const fetcher = useCallback((_key: string, signal?: AbortSignal) => submissionCompareApi.get(a, b, signal), [a, b]);
  const part = useResultPart(fetcher, `${a},${b}`, !invalid, LOAD_ERROR);

  function backToSelect() {
    navigate("/practice/submissions");
  }

  // Luyện lại đúng đoạn trên bài mới hơn (UC-03)
  function practiceSegment(segment: CompareSegment) {
    if (!part.data) return;
    navigate(
      buildSegmentRecordPath(part.data.sheetMusic.id, part.data.newer.submissionId, {
        start: segment.startSec,
        end: segment.endSec,
        countIn: false,
      })
    );
  }

  return {
    invalid,
    data: part.data,
    loading: part.loading,
    error: part.error,
    reload: part.reload,
    backToSelect,
    practiceSegment,
  };
}
