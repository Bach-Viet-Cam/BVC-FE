import type { AssignmentKind } from "@/features/classes/types/teacherAssignmentTypes";
import type { ChartView } from "@/features/practice/utils/chartView";
import type { StudentStatsAssignment } from "@/features/practice/types/studentStatsTypes";

// Bảng màu phân loại (đã kiểm tra tách biệt cho người mù màu). Màu theo vị trí của bài trong danh sách,
// không theo các đường còn lại sau khi lọc, nên một bài luôn giữ một màu.
export const SERIES_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948"];

export interface AccuracyPoint {
  submissionId: string;
  attemptNo: number;
  accuracy: number;
  submittedAt: string;
}

export interface AccuracySeries {
  assignmentId: string;
  title: string;
  kind: AssignmentKind;
  color: string;
  points: AccuracyPoint[];
}

// Trục X = số lần nộp, trục Y = % độ chính xác. Lần nộp chưa có điểm (lỗi, đang xử lý) không vẽ.
export function buildAccuracySeries(assignments: StudentStatsAssignment[]): AccuracySeries[] {
  return assignments
    .map((assignment, index) => ({
      assignmentId: assignment.id,
      title: assignment.title,
      kind: assignment.kind,
      color: SERIES_COLORS[index % SERIES_COLORS.length],
      points: assignment.attempts.flatMap((attempt) =>
        attempt.accuracy === null
          ? []
          : [
              {
                submissionId: attempt.submissionId,
                attemptNo: attempt.attemptNo,
                accuracy: attempt.accuracy,
                submittedAt: attempt.submittedAt,
              },
            ]
      ),
    }))
    .filter((series) => series.points.length > 0);
}

// Trục tung bắt đầu dưới điểm thấp nhất (làm tròn xuống bội 10), tối đa từ 50 để đường không bị dẹt
const floorScore = (lowest: number) => Math.max(0, Math.min(50, Math.floor((lowest - 10) / 10) * 10));

// Khung nhìn đầy đủ: t = số lần nộp (lề nửa lần hai bên), m = % độ chính xác
export function baseAccuracyView(series: AccuracySeries[]): ChartView {
  const points = series.flatMap((item) => item.points);
  const maxAttempt = Math.max(1, ...points.map((point) => point.attemptNo));
  const lowest = points.length > 0 ? Math.min(...points.map((point) => point.accuracy)) : 100;
  return { t0: 0.5, t1: maxAttempt + 0.5, m0: floorScore(lowest), m1: 100 };
}
