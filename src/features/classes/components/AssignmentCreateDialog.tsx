import { useRef, useState, type RefObject } from "react";
import { useNavigate } from "react-router-dom";
import { AssignmentForm } from "@/features/classes/components/AssignmentForm";
import { useLecturerClasses } from "@/features/classes/hooks/useLecturerClasses";
import { useSaveAssignment } from "@/features/classes/hooks/useSaveAssignment";
import { type ApiFieldError } from "@/features/classes/types/classTypes";
import { type AssignmentContentPayload } from "@/features/classes/types/teacherAssignmentTypes";
import { ASSIGNMENT_KIND_LABELS } from "@/features/classes/utils/teacherAssignmentFormat";
import { EMPTY_ASSIGNMENT_FORM } from "@/features/classes/utils/validateAssignment";
import { FormDialog } from "@/shared/components/bvc/FormDialog";
import { toast } from "@/shared/components/ui/toast";
import { type DraftFormHandle } from "@/shared/hooks/useLeaveGuard";

interface AssignmentCreateDialogProps {
  open: boolean;
  onClose: () => void;
  presetClassId?: string;
  presetKind?: string;
  // Lưu bản nháp lúc thoát: ở lại trang hiện tại, danh sách tải lại
  onSaved?: () => void;
}

interface AssignmentCreateContentProps {
  presetClassId: string;
  presetKind: string;
  formRef: RefObject<DraftFormHandle | null>;
  // Đang lưu nháp từ hộp hỏi lại khi thoát
  isLeavingRef: RefObject<boolean>;
  onCancel: () => void;
  onDirtyChange: (isDirty: boolean) => void;
  onSaved?: () => void;
}

// Chỉ dựng khi modal mở để không tải danh sách lớp lúc chưa cần
function AssignmentCreateContent({
  presetClassId,
  presetKind,
  formRef,
  isLeavingRef,
  onCancel,
  onDirtyChange,
  onSaved,
}: AssignmentCreateContentProps) {
  const navigate = useNavigate();
  const { classes, isLoading } = useLecturerClasses();
  const { saveAssignment, isSaving } = useSaveAssignment(undefined);
  // Bài tập mới chỉ giao cho lớp đang hoạt động
  const activeClasses = classes.filter((item) => item.status === "ACTIVE");

  const handleSubmit = async (
    payload: AssignmentContentPayload & { classId: string },
    publish: boolean
  ): Promise<ApiFieldError[] | null> => {
    const result = await saveAssignment(payload, publish);
    if ("assignment" in result) {
      toast.success(result.message);
      if (isLeavingRef.current) onSaved?.();
      else navigate(`/teacher/assignments/${result.assignment.id}`);
      return null;
    }
    if (result.error.fieldErrors.length === 0) toast.error(result.error.message);
    return result.error.fieldErrors;
  };

  if (isLoading) {
    return <p className="px-6 pt-3 pb-8 text-sm text-bvc-muted sm:px-[30px]">Đang tải danh sách lớp...</p>;
  }

  return (
    <AssignmentForm
      ref={formRef}
      mode="create"
      initialValues={{
        ...EMPTY_ASSIGNMENT_FORM,
        classId: presetClassId,
        kind: presetKind in ASSIGNMENT_KIND_LABELS ? presetKind : "",
      }}
      classes={activeClasses}
      isSaving={isSaving}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      onDirtyChange={onDirtyChange}
    />
  );
}

export function AssignmentCreateDialog({
  open,
  onClose,
  presetClassId = "",
  presetKind = "",
  onSaved,
}: AssignmentCreateDialogProps) {
  const [isDirty, setIsDirty] = useState(false);
  const formRef = useRef<DraftFormHandle>(null);
  const isLeavingRef = useRef(false);

  const close = () => {
    setIsDirty(false);
    onClose();
  };

  const saveDraftAndLeave = async () => {
    isLeavingRef.current = true;
    const isSaved = (await formRef.current?.saveDraft()) ?? false;
    isLeavingRef.current = false;
    return isSaved;
  };

  return (
    <FormDialog
      open={open}
      onClose={close}
      title="Tạo bài tập"
      description="Lưu nháp để chỉnh tiếp sau, hoặc lưu và giao bài ngay cho lớp."
      size="lg"
      isDirty={isDirty}
      onSaveDraft={saveDraftAndLeave}
    >
      {(requestClose) => (
        <AssignmentCreateContent
          key={`${presetClassId}:${presetKind}`}
          presetClassId={presetClassId}
          presetKind={presetKind}
          formRef={formRef}
          isLeavingRef={isLeavingRef}
          onCancel={requestClose}
          onDirtyChange={setIsDirty}
          onSaved={onSaved}
        />
      )}
    </FormDialog>
  );
}
