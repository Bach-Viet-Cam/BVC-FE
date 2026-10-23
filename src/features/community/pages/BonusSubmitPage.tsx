import { Link, Navigate, useParams } from "react-router-dom";
import { Award } from "lucide-react";
import { useAssignmentDetail } from "@/features/classes/hooks/useAssignmentDetail";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";

// Bài bonus nộp qua cùng luồng thu âm với bài tập thường: mở bài hát kèm assignmentId (giống AssignmentPage)
export function BonusSubmitPage() {
  const { bonusId = "" } = useParams();
  const { assignment, error, isLoading } = useAssignmentDetail(bonusId);

  if (assignment?.pieceId) {
    return <Navigate to={`/library/${assignment.pieceId}?assignmentId=${assignment.id}`} replace />;
  }

  return (
    <StudentShell>
      <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col gap-5 px-[18px] pt-5 pb-10 md:pt-8">
        {isLoading && !error ? (
          <p className="text-sm text-bvc-muted">Đang mở bài bonus...</p>
        ) : (
          <EmptyState
            icon={<Award className="size-8" strokeWidth={1.5} />}
            title="Chưa thể nộp bài bonus này"
            description={error ?? "Bài bonus chưa gắn bài hát nào để thu âm. Vui lòng liên hệ giảng viên."}
            actions={
              <Link
                to={`/community/bonus/${bonusId}`}
                className={actionButtonClass("primary", "md", "hover:text-white")}
              >
                Quay lại bài bonus
              </Link>
            }
          />
        )}
      </div>
    </StudentShell>
  );
}
