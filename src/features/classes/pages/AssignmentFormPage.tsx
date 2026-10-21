import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AssignmentForm } from "@/features/classes/components/AssignmentForm";
import { ListState } from "@/features/classes/components/ListState";
import { useTeacherAssignmentDetail } from "@/features/classes/hooks/useTeacherAssignmentDetail";
import { useLecturerClasses } from "@/features/classes/hooks/useLecturerClasses";
import { useSaveAssignment } from "@/features/classes/hooks/useSaveAssignment";
import { type ApiFieldError } from "@/features/classes/types/classTypes";
import { type AssignmentContentPayload } from "@/features/classes/types/teacherAssignmentTypes";
import { EMPTY_ASSIGNMENT_FORM, toAssignmentFormValues } from "@/features/classes/utils/validateAssignment";
import { MobileHeader } from "@/shared/components/bvc/MobileHeader";
import { MobileScreen } from "@/shared/components/bvc/MobileScreen";
import { toast } from "@/shared/components/ui/toast";

export function AssignmentFormPage() {
  const navigate = useNavigate();
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(assignmentId);
  const { assignment, isLoading, error, reload } = useTeacherAssignmentDetail(assignmentId);
  const { classes, isLoading: isClassesLoading } = useLecturerClasses();
  const { saveAssignment, isSaving } = useSaveAssignment(assignmentId);
  const presetClassId = searchParams.get("classId") ?? "";
  const backPath = assignmentId ? `/teacher/assignments/${assignmentId}` : "/teacher/assignments";
  // New assignments only go to active classes; when editing, the class is fixed.
  const formClasses = isEdit ? classes : classes.filter((item) => item.status === "ACTIVE");

  const handleSubmit = async (
    payload: AssignmentContentPayload & { classId: string },
    publish: boolean
  ): Promise<ApiFieldError[] | null> => {
    const result = await saveAssignment(payload, publish);
    if ("assignment" in result) {
      toast.success(result.message);
      navigate(`/teacher/assignments/${result.assignment.id}`, { replace: true });
      return null;
    }
    if (result.error.fieldErrors.length === 0) toast.error(result.error.message);
    return result.error.fieldErrors;
  };

  const isPageLoading = isClassesLoading || (isEdit && isLoading);
  const initialValues = assignment
    ? toAssignmentFormValues(assignment)
    : { ...EMPTY_ASSIGNMENT_FORM, classId: presetClassId };

  return (
    <MobileScreen>
      <MobileHeader
        title={isEdit ? "Sửa bài tập" : "Tạo bài tập"}
        subtitle={assignment?.title}
        onBack={() => navigate(backPath)}
      />
      {isPageLoading || (isEdit && (error || !assignment)) ? (
        <div className="px-[18px]">
          <ListState isLoading={isPageLoading} error={error} isEmpty={false} emptyMessage="" onRetry={reload}>
            {null}
          </ListState>
        </div>
      ) : (
        <AssignmentForm
          key={assignment?.id ?? `new:${presetClassId}`}
          mode={isEdit ? "edit" : "create"}
          initialValues={initialValues}
          classes={formClasses}
          currentPiece={assignment?.piece ?? null}
          isSaving={isSaving}
          onCancel={() => navigate(backPath)}
          onSubmit={handleSubmit}
        />
      )}
    </MobileScreen>
  );
}
