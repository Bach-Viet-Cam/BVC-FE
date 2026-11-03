import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClassForm } from "@/features/classes/components/ClassForm";
import { useInstruments } from "@/features/classes/hooks/useInstruments";
import { useSaveClass } from "@/features/classes/hooks/useSaveClass";
import { useSemesters } from "@/features/classes/hooks/useSemesters";
import { type ClassPayload } from "@/features/classes/types/classTypes";
import { FormDialog } from "@/shared/components/bvc/FormDialog";
import { toast } from "@/shared/components/ui/toast";

interface ClassCreateDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ClassCreateContentProps {
  onCancel: () => void;
  onDirtyChange: (isDirty: boolean) => void;
}

// Chỉ dựng khi modal mở để không tải môn học, học kỳ lúc chưa cần
function ClassCreateContent({ onCancel, onDirtyChange }: ClassCreateContentProps) {
  const navigate = useNavigate();
  const { instruments, isLoading: isInstrumentLoading, error: instrumentError } = useInstruments();
  const { semesters, defaultSemesterName, isLoading: isSemesterLoading, error: semesterError } = useSemesters();
  const { saveClass, isSaving } = useSaveClass(undefined);
  const isLoading = isInstrumentLoading || isSemesterLoading;
  const loadError = instrumentError ?? semesterError;

  const handleSubmit = async (payload: Partial<ClassPayload>) => {
    const result = await saveClass(payload);
    if ("classDetail" in result) {
      toast.success(result.message);
      onDirtyChange(false);
      navigate(`/teacher/classes/${result.classDetail.id}`);
      return null;
    }
    if (result.error.fieldErrors.length === 0) toast.error(result.error.message);
    return result.error.fieldErrors;
  };

  if (isLoading || loadError) {
    return (
      <p role={loadError ? "alert" : undefined} className="px-6 pt-3 pb-8 text-sm text-bvc-muted sm:px-[30px]">
        {loadError ?? "Đang tải môn học và học kỳ..."}
      </p>
    );
  }

  return (
    <ClassForm
      classDetail={null}
      instruments={instruments}
      semesters={semesters}
      defaultSemesterName={defaultSemesterName}
      isSaving={isSaving}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      onDirtyChange={onDirtyChange}
    />
  );
}

export function ClassCreateDialog({ open, onClose }: ClassCreateDialogProps) {
  const [isDirty, setIsDirty] = useState(false);

  const close = () => {
    setIsDirty(false);
    onClose();
  };

  return (
    <FormDialog
      open={open}
      onClose={close}
      title="Tạo lớp học"
      description="Sau khi tạo lớp, bạn thêm sinh viên hoặc nhập danh sách từ file trong trang chi tiết lớp."
      isDirty={isDirty}
    >
      {(requestClose) => <ClassCreateContent onCancel={requestClose} onDirtyChange={setIsDirty} />}
    </FormDialog>
  );
}
