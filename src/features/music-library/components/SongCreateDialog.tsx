import { useState } from "react";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { FormDialog } from "@/shared/components/bvc/FormDialog";
import { FormFooter } from "@/shared/components/bvc/FormLayout";
import { SongForm } from "@/features/music-library/components/SongForm";
import { useMusicCategories } from "@/features/music-library/hooks/useMusicCategories";
import { useSongEditor } from "@/features/music-library/hooks/useSongEditor";

const FORM_ID = "song-create-form";

interface SongCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface SongCreateContentProps {
  onCancel: () => void;
  onCreated: () => void;
  onDirtyChange: (isDirty: boolean) => void;
}

// Chỉ dựng khi modal mở để không tải thể loại lúc chưa cần
function SongCreateContent({ onCancel, onCreated, onDirtyChange }: SongCreateContentProps) {
  const editor = useSongEditor(undefined, onCreated);
  const { options, isLoading, error } = useMusicCategories("lecturer");

  if (isLoading || error) {
    return (
      <p role={error ? "alert" : undefined} className="px-6 pt-3 pb-8 text-sm text-bvc-muted sm:px-[30px]">
        {error ?? "Đang tải thể loại..."}
      </p>
    );
  }

  return (
    <>
      {editor.submitError && (
        <p
          role="alert"
          className="mx-6 mt-3 rounded-[13px] bg-bvc-accent-tint px-4 py-3 text-sm text-bvc-accent-text sm:mx-[30px]"
        >
          {editor.submitError}
        </p>
      )}
      <SongForm
        formId={FORM_ID}
        options={options}
        onSubmit={editor.submit}
        onDirtyChange={onDirtyChange}
        className="px-6 pt-4 pb-6 md:px-[30px] md:pt-4 md:pb-6 lg:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)]"
      />
      <FormFooter>
        <ActionButton variant="secondary" onClick={onCancel}>
          Hủy
        </ActionButton>
        <ActionButton type="submit" form={FORM_ID} isLoading={editor.isSubmitting}>
          Thêm bài hát
        </ActionButton>
      </FormFooter>
    </>
  );
}

export function SongCreateDialog({ open, onClose, onCreated }: SongCreateDialogProps) {
  const [isDirty, setIsDirty] = useState(false);
  const close = () => {
    setIsDirty(false);
    onClose();
  };

  return (
    <FormDialog
      open={open}
      onClose={close}
      title="Thêm bài hát"
      description="Bài mới mặc định ẩn với sinh viên."
      size="xl"
      isDirty={isDirty}
    >
      {(requestClose) => (
        <SongCreateContent
          onCancel={requestClose}
          onCreated={() => {
            onCreated();
            close();
          }}
          onDirtyChange={setIsDirty}
        />
      )}
    </FormDialog>
  );
}
