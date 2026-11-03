import { ListState } from "@/features/classes/components/ListState";
import { SubmissionCard } from "@/features/classes/components/SubmissionCard";
import { useCommentHandler } from "@/features/classes/hooks/useCommentHandler";
import { type StudentSubmissions } from "@/features/classes/types/teacherAssignmentTypes";

interface StudentSubmissionGridProps {
  result: StudentSubmissions | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

// A15–A18: lecturer listens to each attempt and writes one comment per submission.
export function StudentSubmissionGrid({ result, isLoading, error, reload }: StudentSubmissionGridProps) {
  const handleSaveComment = useCommentHandler(reload);

  return (
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
  );
}
