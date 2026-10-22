import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AssignmentInfoPanel, type AssignmentPanelAction } from "@/features/classes/components/AssignmentInfoPanel";
import { AssignmentStudentRow } from "@/features/classes/components/AssignmentStudentRow";
import { ConfirmDialog } from "@/features/classes/components/ConfirmDialog";
import { ListState } from "@/features/classes/components/ListState";
import { useAssignmentActions } from "@/features/classes/hooks/useAssignmentActions";
import { useTeacherAssignmentDetail } from "@/features/classes/hooks/useTeacherAssignmentDetail";
import { TeacherPageHeader } from "@/shared/components/bvc/TeacherPageHeader";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";
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
    <TeacherScreen className="lg:overflow-hidden">
      <TeacherPageHeader
        title={assignment?.title ?? "Chi tiết bài tập"}
        subtitle="Chi tiết bài tập"
        onBack={() => navigate("/teacher/assignments")}
      />
      {!assignment ? (
        <div className="px-[18px] lg:px-[32px] lg:pt-[22px]">
          <ListState isLoading={isLoading} error={error} isEmpty={false} emptyMessage="" onRetry={reload}>
            {null}
          </ListState>
        </div>
      ) : (
        // Web: assignment info on the left, the student list scrolling on the right. Phone: stacked.
        <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
          <aside className="flex shrink-0 flex-col lg:w-[360px] lg:overflow-y-auto lg:border-r lg:border-bvc-border-strong lg:bg-bvc-surface lg:p-[22px_20px]">
            <AssignmentInfoPanel assignment={assignment} isWorking={isWorking} onAction={handleAction} />
          </aside>
          <div className="flex min-w-0 flex-1 flex-col lg:overflow-y-auto lg:pt-[22px]">
            <h2 className="m-0 px-[18px] pb-[8px] text-[16px] font-extrabold lg:px-[32px]">
              Sinh viên ({assignment.students.length})
            </h2>
            <div className="flex flex-col gap-[10px] px-[18px] pb-[22px] lg:px-[32px]">
              {assignment.students.length === 0 ? (
                <p className="m-0 rounded-[18px] bg-bvc-soft p-[15px] text-[13.5px] text-bvc-muted">
                  Lớp chưa có sinh viên.
                </p>
              ) : (
                <div className="grid gap-[10px] lg:grid-cols-2 2xl:grid-cols-3">
                  {assignment.students.map((student) => (
                    <AssignmentStudentRow key={student.studentId} assignmentId={assignment.id} student={student} />
                  ))}
                </div>
              )}
            </div>
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
        </div>
      )}
    </TeacherScreen>
  );
}
