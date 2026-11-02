import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AssignmentForm } from "@/features/classes/components/AssignmentForm";
import { ListState } from "@/features/classes/components/ListState";
import { useTeacherAssignmentDetail } from "@/features/classes/hooks/useTeacherAssignmentDetail";
import { useLecturerClasses } from "@/features/classes/hooks/useLecturerClasses";
import { useSaveAssignment } from "@/features/classes/hooks/useSaveAssignment";
import { type ApiFieldError } from "@/features/classes/types/classTypes";
import { type AssignmentContentPayload } from "@/features/classes/types/teacherAssignmentTypes";
import { toAssignmentFormValues } from "@/features/classes/utils/validateAssignment";
import { LeaveConfirmDialog } from "@/shared/components/bvc/LeaveConfirmDialog";
import { TeacherPageHeader } from "@/shared/components/bvc/TeacherPageHeader";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";
import { toast } from "@/shared/components/ui/toast";
import { useLeaveGuard } from "@/shared/hooks/useLeaveGuard";

// Sửa bài tập (tạo mới mở bằng modal AssignmentCreateDialog)
export function AssignmentFormPage() {
  const navigate = useNavigate();
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { assignment, isLoading, error, reload } = useTeacherAssignmentDetail(assignmentId);
  const { classes, isLoading: isClassesLoading } = useLecturerClasses();
  const { saveAssignment, isSaving } = useSaveAssignment(assignmentId);
  const [isDirty, setIsDirty] = useState(false);
  const { guard, confirmProps } = useLeaveGuard({ isDirty });
  const backPath = `/teacher/assignments/${assignmentId}`;
  const leave = () => guard(() => navigate(backPath));

  const handleSubmit = async (
    payload: AssignmentContentPayload & { classId: string },
    publish: boolean
  ): Promise<ApiFieldError[] | null> => {
    const result = await saveAssignment(payload, publish);
    if ("assignment" in result) {
      toast.success(result.message);
      setIsDirty(false);
      navigate(`/teacher/assignments/${result.assignment.id}`, { replace: true });
      return null;
    }
    if (result.error.fieldErrors.length === 0) toast.error(result.error.message);
    return result.error.fieldErrors;
  };

  const isPageLoading = isClassesLoading || isLoading;

  return (
    <TeacherScreen>
      <TeacherPageHeader title="Sửa bài tập" subtitle={assignment?.title} onBack={leave} />
      {isPageLoading || error || !assignment ? (
        <div className="px-[18px] lg:px-[32px] lg:pt-[22px]">
          <ListState isLoading={isPageLoading} error={error} isEmpty={false} emptyMessage="" onRetry={reload}>
            {null}
          </ListState>
        </div>
      ) : (
        <AssignmentForm
          key={assignment.id}
          mode="edit"
          initialValues={toAssignmentFormValues(assignment)}
          classes={classes}
          currentSheetMusic={assignment.sheetMusic}
          isSaving={isSaving}
          onCancel={leave}
          onSubmit={handleSubmit}
          onDirtyChange={setIsDirty}
        />
      )}
      <LeaveConfirmDialog {...confirmProps} />
    </TeacherScreen>
  );
}
