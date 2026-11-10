import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClassForm } from "@/features/classes/components/ClassForm";
import { CopyAssignmentList } from "@/features/classes/components/CopyAssignmentList";
import { CopySourcePickerDialog } from "@/features/classes/components/CopySourcePickerDialog";
import { useClassCopy } from "@/features/classes/hooks/useClassCopy";
import { useInstruments } from "@/features/classes/hooks/useInstruments";
import { useSaveClass } from "@/features/classes/hooks/useSaveClass";
import { useSemesters } from "@/features/classes/hooks/useSemesters";
import { type ClassPayload } from "@/features/classes/types/classTypes";
import { FormDialog } from "@/shared/components/bvc/FormDialog";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
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
  const copy = useClassCopy();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [instrumentId, setInstrumentId] = useState("");
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const { source } = copy;
  const instrumentMismatch = Boolean(source && instrumentId && instrumentId !== source.instrument.id);
  const isLoading = isInstrumentLoading || isSemesterLoading;
  const loadError = instrumentError ?? semesterError;

  useEffect(() => {
    onDirtyChange(!isDone && (isFormDirty || source !== null));
  }, [isDone, isFormDirty, source, onDirtyChange]);

  const handleSelect = async (classId: string) => {
    const ok = await copy.selectSource(classId);
    if (ok) setIsPickerOpen(false);
  };

  const handleSubmit = async (payload: Partial<ClassPayload>) => {
    const result = await saveClass({ ...payload, ...copy.payload() });
    if ("classDetail" in result) {
      toast.success(result.message);
      setIsDone(true);
      navigate(`/teacher/classes/${result.classDetail.id}`);
      return null;
    }
    if (result.error.fieldErrors.length === 0) toast.error(result.error.message);
    return source ? copy.applyServerErrors(result.error.fieldErrors) : result.error.fieldErrors;
  };

  const prefill = source
    ? { key: source.id, name: source.name, description: source.description, coLecturers: source.coLecturers }
    : null;

  const copySection = source ? (
    <CopyAssignmentList
      rows={copy.rows}
      instrumentMismatch={instrumentMismatch}
      instrumentId={instrumentId}
      disabled={isSaving}
      onToggle={copy.toggle}
      onToggleAll={copy.toggleAll}
      onEdit={copy.updateRow}
    />
  ) : null;

  if (isLoading || loadError) {
    return (
      <p role={loadError ? "alert" : undefined} className="px-6 pt-3 pb-8 text-sm text-bvc-muted sm:px-[30px]">
        {loadError ?? "Đang tải môn học và học kỳ..."}
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-[10px] px-6 pb-1 sm:px-[30px]">
        {copy.isLoading ? (
          <ActionButton variant="secondary" disabled>
            Đang tải lớp nguồn…
          </ActionButton>
        ) : source ? (
          <>
            <span className="min-w-0 grow text-[13.5px] font-semibold text-bvc-ink wrap-break-word">
              {`Đang sao chép từ ${source.name} (${source.cohort})`}
            </span>
            <ActionButton variant="secondary" onClick={() => setIsPickerOpen(true)} disabled={isSaving}>
              Đổi lớp
            </ActionButton>
            <ActionButton variant="secondary" onClick={copy.clear} disabled={isSaving}>
              Bỏ sao chép
            </ActionButton>
          </>
        ) : (
          <ActionButton variant="secondary" onClick={() => setIsPickerOpen(true)} disabled={isSaving}>
            Sao chép từ lớp khác
          </ActionButton>
        )}
      </div>
      <ClassForm
        classDetail={null}
        instruments={instruments}
        semesters={semesters}
        defaultSemesterName={defaultSemesterName}
        isSaving={isSaving}
        submitDisabled={copy.isLoading}
        onCancel={onCancel}
        onSubmit={handleSubmit}
        onDirtyChange={setIsFormDirty}
        prefill={prefill}
        copySection={copySection}
        onInstrumentChange={setInstrumentId}
        beforeSubmit={copy.validate}
      />
      <CopySourcePickerDialog
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelect}
        isLoading={copy.isLoading}
      />
    </>
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
      description="Sau khi tạo lớp, bạn thêm sinh viên hoặc nhập danh sách từ file và quản lý giảng viên cùng dạy trong trang chi tiết lớp."
      isDirty={isDirty}
    >
      {(requestClose) => <ClassCreateContent onCancel={requestClose} onDirtyChange={setIsDirty} />}
    </FormDialog>
  );
}
