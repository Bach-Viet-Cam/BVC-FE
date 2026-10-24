import { useNavigate, useSearchParams } from "react-router-dom";
import { SUBMISSION_COMPARE_MOCK } from "@/features/practice/constants/submissionHistoryMockData";
import { orderByDate } from "@/features/practice/utils/submissionHistory";

// Mockup: đường cao độ và đoạn lỗi là dữ liệu mẫu cố định của cặp #2 và #5, chỉ tên/ngày/điểm đổi theo hai bài được chọn.
const FALLBACK_PAIR = ["2", "5"] as const;

export function useSubmissionCompare() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const find = (id: string | null, fallback: string) =>
    SUBMISSION_COMPARE_MOCK.find((item) => item.id === id && item.status === "COMPLETED") ??
    SUBMISSION_COMPARE_MOCK.find((item) => item.id === fallback);

  const first = find(searchParams.get("a"), FALLBACK_PAIR[0]);
  const second = find(searchParams.get("b"), FALLBACK_PAIR[1]);
  const pair = first && second && first.id !== second.id ? orderByDate(first, second) : null;

  function backToSelect() {
    navigate("/practice/submissions");
  }

  function practiceSegment() {
    navigate(`/practice/sheets/${pair?.newer.sheetMusicId ?? ""}/record`);
  }

  return { older: pair?.older, newer: pair?.newer, backToSelect, practiceSegment };
}
