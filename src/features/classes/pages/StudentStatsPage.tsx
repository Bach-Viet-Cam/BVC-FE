import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { BestScoreStrip } from "@/features/classes/components/BestScoreStrip";
import { ListState } from "@/features/classes/components/ListState";
import { StudentAttemptList } from "@/features/classes/components/StudentAttemptList";
import { StudentEvaluationForm } from "@/features/classes/components/StudentEvaluationForm";
import { useSaveEvaluation } from "@/features/classes/hooks/useSaveEvaluation";
import { useStudentStats } from "@/features/classes/hooks/useStudentStats";
import {
  buildStudentStatsPath,
  buildTeacherSubmissionPath,
  formatStudentStatsSubtitle,
} from "@/features/classes/utils/studentStatsFormat";
import { AccuracyLinesChart } from "@/features/practice/components/AccuracyLinesChart";
import { TeacherPageHeader } from "@/shared/components/bvc/TeacherPageHeader";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";

// Thống kê một sinh viên trong lớp (mở từ danh sách thành viên hoặc "Sinh viên cần chú ý"):
// điểm cao nhất từng bài, đồ thị độ chính xác, đánh giá chung, lịch sử nộp bài.
export function StudentStatsPage() {
  const navigate = useNavigate();
  const backPath = (useLocation().state as { from?: string } | null)?.from ?? "/teacher/home";
  const { classId = "", studentId = "" } = useParams<{ classId: string; studentId: string }>();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const { stats, isLoading, error, reload } = useStudentStats(classId, studentId);
  const saveEvaluation = useSaveEvaluation(classId, studentId, reload);
  const statsPath = buildStudentStatsPath(classId, studentId);

  const openSubmission = (submissionId: string) =>
    navigate(buildTeacherSubmissionPath(classId, studentId, submissionId), { state: { from: statsPath } });

  return (
    <TeacherScreen>
      <TeacherPageHeader
        title={stats?.student.fullName ?? "Thống kê sinh viên"}
        subtitle={stats ? formatStudentStatsSubtitle(stats) : undefined}
        onBack={() => navigate(backPath)}
      />
      <div className="flex flex-col gap-[14px] px-[18px] pb-[22px] lg:px-[32px] lg:pt-[22px]">
        <ListState
          // Chỉ hiện khung chờ ở lần tải đầu: tải lại sau khi lưu đánh giá không được xoá chữ đang gõ
          isLoading={isLoading && !stats}
          error={stats ? null : error}
          isEmpty={false}
          emptyMessage=""
          onRetry={reload}
        >
          {stats && (
            <>
              {stats.assignments.length === 0 ? (
                <p className="text-[13px] text-bvc-muted">Lớp chưa có bài tập nào đã đăng.</p>
              ) : (
                <>
                  <BestScoreStrip
                    assignments={stats.assignments}
                    selectedAssignmentId={selectedAssignmentId}
                    onSelect={setSelectedAssignmentId}
                  />
                  <AccuracyLinesChart
                    assignments={stats.assignments}
                    selectedAssignmentId={selectedAssignmentId}
                    onSelectAssignment={setSelectedAssignmentId}
                    onPointClick={openSubmission}
                  />
                </>
              )}
              <div className="grid items-start gap-[14px] lg:grid-cols-2">
                <StudentEvaluationForm
                  // Lưu xong vẫn giữ form; chỉ dựng lại khi đổi sinh viên
                  key={`${classId}:${studentId}`}
                  evaluation={stats.evaluation}
                  canEvaluate={stats.canEvaluate}
                  onSave={saveEvaluation}
                />
                <StudentAttemptList
                  assignments={stats.assignments}
                  selectedAssignmentId={selectedAssignmentId}
                  onOpen={openSubmission}
                />
              </div>
            </>
          )}
        </ListState>
      </div>
    </TeacherScreen>
  );
}
