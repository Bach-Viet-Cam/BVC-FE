import { useNavigate, useSearchParams } from "react-router-dom";
import { SUBMISSION_HISTORY_MOCK } from "@/features/practice/constants/submissionHistoryMockData";
import { orderByDate } from "@/features/practice/utils/submissionHistory";

// Mockup: đường cao độ và đoạn lỗi là dữ liệu mẫu cố định của cặp #2 và #5, chỉ tên/ngày/điểm đổi theo hai bài được chọn.
const FALLBACK_PAIR = ["2", "5"] as const;

export function useSubmissionCompare() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const find = (id: string | null, fallback: string) =>
    SUBMISSION_HISTORY_MOCK.find((item) => item.id === id && item.status === "COMPLETED") ??
    SUBMISSION_HISTORY_MOCK.find((item) => item.id === fallback);

  const first = find(searchParams.get("a"), FALLBACK_PAIR[0]);
  const second = find(searchParams.get("b"), FALLBACK_PAIR[1]);
  const pair = first && second && first.id !== second.id ? orderByDate(first, second) : null;

  function backToSelect() {
    navigate("/practice/submissions");
  }

  function practiceSegment() {
    navigate(`/practice/${pair?.newer.pieceId ?? ""}/record`);
  }

  return { older: pair?.older, newer: pair?.newer, backToSelect, practiceSegment };
}
