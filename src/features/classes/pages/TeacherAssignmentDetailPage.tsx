import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AssignmentInfoPanel, type AssignmentPanelAction } from "@/features/classes/components/AssignmentInfoPanel";
import { AssignmentStudentRow } from "@/features/classes/components/AssignmentStudentRow";
import { ConfirmDialog } from "@/features/classes/components/ConfirmDialog";
import { ListState } from "@/features/classes/components/ListState";
import { useAssignmentActions } from "@/features/classes/hooks/useAssignmentActions";
import { useTeacherAssignmentDetail } from "@/features/classes/hooks/useTeacherAssignmentDetail";
import { MobileHeader } from "@/shared/components/bvc/MobileHeader";
import { MobileScreen } from "@/shared/components/bvc/MobileScreen";
import { toast } from "@/shared/components/ui/toast";

export function TeacherAssignmentDetailPage() {
  const navigate = useNavigate();
  const { assignmentId = "" } = useParams<{ assignmentId: string }>();
  const [pendingAction, setPendingAction] = useState<"close" | "delete" | null>(null);
  const { assignment, isLoading, error, reload } = useTeacherAssignmentDetail(assignmentId);
  const { changeStatus, deleteAssignment, isWorking } = useAssignmentActions(assignmentId);

  const report = (outcome: { message: string } | { error: string }): boolean => {
    if ("error" in outcome) {
      toast.error(outcome.error);
      return false;
    }
    toast.success(outcome.message);
    return true;
  };

  const handleAction = async (action: AssignmentPanelAction) => {
    if (action === "close" || action === "delete") {
      setPendingAction(action);
      return;
    }
    report(await changeStatus(action));
    reload();
  };

  const confirmPending = async () => {
    const action = pendingAction;
    if (action === "delete") {
      const isDeleted = report(await deleteAssignment());
      setPendingAction(null);
      if (isDeleted) navigate("/teacher/assignments", { replace: true });
      return;
    }
    report(await changeStatus("close"));
    setPendingAction(null);
    reload();
  };

  return (
    <MobileScreen>
      <MobileHeader
        title={assignment?.title ?? "Chi tiết bài tập"}
        subtitle="Chi tiết bài tập"
        onBack={() => navigate("/teacher/assignments")}
      />
      {!assignment ? (
        <div className="px-[18px]">
          <ListState isLoading={isLoading} error={error} isEmpty={false} emptyMessage="" onRetry={reload}>
            {null}
          </ListState>
        </div>
      ) : (
        <>
          <AssignmentInfoPanel assignment={assignment} isWorking={isWorking} onAction={handleAction} />
          <h2 className="m-0 px-[18px] pb-[8px] text-[16px] font-extrabold">
            Sinh viên ({assignment.students.length})
          </h2>
          <div className="flex flex-col gap-[10px] px-[18px] pb-[22px]">
            {assignment.students.length === 0 ? (
              <p className="m-0 rounded-[18px] bg-bvc-soft p-[15px] text-[13.5px] text-bvc-muted">
                Lớp chưa có sinh viên.
              </p>
            ) : (
              <div className="grid gap-[10px] lg:grid-cols-2">
                {assignment.students.map((student) => (
                  <AssignmentStudentRow key={student.studentId} assignmentId={assignment.id} student={student} />
                ))}
              </div>
            )}
          </div>
          <ConfirmDialog
            isOpen={pendingAction !== null}
            title={
              pendingAction === "delete" ? `Xóa bài tập ${assignment.title}?` : `Đóng bài tập ${assignment.title}?`
            }
            description={
              pendingAction === "delete" ? "Bài tập sẽ bị ẩn với cả lớp." : "Sinh viên sẽ không thể nộp bài nữa."
            }
            confirmLabel={pendingAction === "delete" ? "Xóa" : "Đóng"}
            isConfirming={isWorking}
            onConfirm={confirmPending}
            onCancel={() => setPendingAction(null)}
          />
        </>
      )}
    </MobileScreen>
  );
}
