import { useRef, useState, type RefObject } from "react";
import { useInstruments } from "@/features/classes/hooks/useInstruments";
import { useLecturerClasses } from "@/features/classes/hooks/useLecturerClasses";
import { ChallengeForm } from "@/features/community/components/ChallengeForm";
import { useChallengeFormData } from "@/features/community/hooks/useChallengeFormData";
import { FormDialog } from "@/shared/components/bvc/FormDialog";
import { type DraftFormHandle } from "@/shared/hooks/useLeaveGuard";

interface ChallengeCreateDialogProps {
  open: boolean;
  onClose: () => void;
  // Lưu nháp hoặc đăng xong: đóng modal, danh sách tải lại
  onSaved: () => void;
}

interface ChallengeCreateContentProps {
  formRef: RefObject<DraftFormHandle | null>;
  onCancel: () => void;
  onSaved: () => void;
  onDirtyChange: (isDirty: boolean) => void;
}

// Chỉ dựng khi modal mở để không tải dữ liệu form lúc chưa cần
function ChallengeCreateContent({ formRef, onCancel, onSaved, onDirtyChange }: ChallengeCreateContentProps) {
  const { meta, isLoading, error } = useChallengeFormData(undefined);
  const { classes, isLoading: isClassesLoading } = useLecturerClasses();
  const { instruments, isLoading: isInstrumentsLoading } = useInstruments();

  if (isLoading || isClassesLoading || isInstrumentsLoading || error || !meta) {
    return (
      <p role={error ? "alert" : undefined} className="px-6 pt-3 pb-8 text-sm text-bvc-muted sm:px-[30px]">
        {error ?? "Đang tải dữ liệu..."}
      </p>
    );
  }

  return (
    <ChallengeForm
      ref={formRef}
      classes={classes}
      instruments={instruments}
      defaultMinAccuracy={meta.defaultMinAccuracy}
      maxSubmissionsDefault={meta.maxSubmissionsDefault}
      onCancel={onCancel}
      onSaved={onSaved}
      onDirtyChange={onDirtyChange}
    />
  );
}

export function ChallengeCreateDialog({ open, onClose, onSaved }: ChallengeCreateDialogProps) {
  const [isDirty, setIsDirty] = useState(false);
  const formRef = useRef<DraftFormHandle>(null);

  const close = () => {
    setIsDirty(false);
    onClose();
  };

  return (
    <FormDialog
      open={open}
      onClose={close}
      title="Tạo thử thách"
      description="Bản nháp chỉ cần tên thử thách; đăng thử thách cần điền đủ các mục bắt buộc."
      size="lg"
      isDirty={isDirty}
      onSaveDraft={async () => (await formRef.current?.saveDraft()) ?? false}
    >
      {(requestClose) => (
        <ChallengeCreateContent
          formRef={formRef}
          onCancel={requestClose}
          onSaved={() => {
            onSaved();
            close();
          }}
          onDirtyChange={setIsDirty}
        />
      )}
    </FormDialog>
  );
}
