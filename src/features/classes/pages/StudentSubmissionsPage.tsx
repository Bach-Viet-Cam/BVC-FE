import { useNavigate, useParams } from "react-router-dom";
import { ListState } from "@/features/classes/components/ListState";
import { SubmissionCard } from "@/features/classes/components/SubmissionCard";
import { useSaveComment } from "@/features/classes/hooks/useSaveComment";
import { useStudentSubmissions } from "@/features/classes/hooks/useStudentSubmissions";
import { type ApiFieldError } from "@/features/classes/types/classTypes";
import { MobileHeader } from "@/shared/components/bvc/MobileHeader";
import { MobileScreen } from "@/shared/components/bvc/MobileScreen";
import { toast } from "@/shared/components/ui/toast";

// A15–A18: lecturer listens to each attempt and writes one comment per submission.
export function StudentSubmissionsPage() {
  const navigate = useNavigate();
  const { assignmentId = "", studentId = "" } = useParams<{ assignmentId: string; studentId: string }>();
  const { result, isLoading, error, reload } = useStudentSubmissions(assignmentId, studentId);
  const { saveComment } = useSaveComment();

  const handleSaveComment =
    (submissionId: string) =>
    async (content: string): Promise<ApiFieldError[] | null> => {
      const outcome = await saveComment(submissionId, content);
      if ("message" in outcome) {
        toast.success(outcome.message);
        reload();
        return null;
      }
      if (outcome.error.fieldErrors.length === 0) toast.error(outcome.error.message);
      return outcome.error.fieldErrors;
    };

  const student = result?.student;
  return (
    <MobileScreen>
      <MobileHeader
        title={student?.fullName ?? "Bài nộp"}
        subtitle={student?.studentCode ? `${student.studentCode} · Bài nộp` : "Bài nộp"}
        onBack={() => navigate(`/teacher/assignments/${assignmentId}`)}
      />
      <div className="flex flex-col gap-[10px] px-[18px] pb-[22px]">
        <ListState
          // Skeleton only on the first load: a reload after saving must not unmount other cards' unsent text.
          isLoading={isLoading && !result}
          error={result ? null : error}
          isEmpty={(result?.submissions.length ?? 0) === 0}
          emptyMessage="Sinh viên chưa có bài nộp nào."
          onRetry={reload}
        >
          <div className="grid gap-[10px] lg:grid-cols-2">
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
    </MobileScreen>
  );
}
