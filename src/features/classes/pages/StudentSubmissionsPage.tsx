import { useNavigate, useParams } from "react-router-dom";
import { ListState } from "@/features/classes/components/ListState";
import { SubmissionCard } from "@/features/classes/components/SubmissionCard";
import { useCommentHandler } from "@/features/classes/hooks/useCommentHandler";
import { useStudentSubmissions } from "@/features/classes/hooks/useStudentSubmissions";
import { TeacherPageHeader } from "@/shared/components/bvc/TeacherPageHeader";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";

// A15–A18: lecturer listens to each attempt and writes one comment per submission.
export function StudentSubmissionsPage() {
  const navigate = useNavigate();
  const { assignmentId = "", studentId = "" } = useParams<{ assignmentId: string; studentId: string }>();
  const { result, isLoading, error, reload } = useStudentSubmissions(assignmentId, studentId);
  const handleSaveComment = useCommentHandler(reload);

  const student = result?.student;
  return (
    <TeacherScreen>
      <TeacherPageHeader
        title={student?.fullName ?? "Bài nộp"}
        subtitle={student?.studentCode ? `${student.studentCode} · Bài nộp` : "Bài nộp"}
        onBack={() => navigate(`/teacher/assignments/${assignmentId}`)}
      />
      <div className="flex flex-col gap-[10px] px-[18px] pb-[22px] lg:px-[32px] lg:pt-[22px]">
        <ListState
          // Skeleton only on the first load: a reload after saving must not unmount other cards' unsent text.
          isLoading={isLoading && !result}
          error={result ? null : error}
          isEmpty={(result?.submissions.length ?? 0) === 0}
          emptyMessage="Sinh viên chưa có bài nộp nào."
          onRetry={reload}
        >
          <div className="grid gap-[10px] lg:grid-cols-2 2xl:grid-cols-3">
            {result?.submissions.map((submission) => (
              <SubmissionCard
                key={`${submission.id}:${submission.comment?.updatedAt ?? "new"}`}
                submission={submission}
                canComment={result.canComment}
                onSaveComment={handleSaveComment(submission.id)}
              />
            ))}
          </div>
        </ListState>
      </div>
    </TeacherScreen>
  );
}
