import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TeacherShell } from "@/shared/components/bvc/TeacherShell";
import { TeacherPageHeader } from "@/shared/components/bvc/TeacherPageHeader";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { LeaveConfirmDialog } from "@/shared/components/bvc/LeaveConfirmDialog";
import { useLeaveGuard } from "@/shared/hooks/useLeaveGuard";
import { SongForm } from "@/features/music-library/components/SongForm";
import { useMusicCategories } from "@/features/music-library/hooks/useMusicCategories";
import { useSongEditor } from "@/features/music-library/hooks/useSongEditor";

const FORM_ID = "song-form";
const LIST_PATH = "/songs";

// Sửa bài hát (thêm bài hát mở bằng modal SongCreateDialog)
export function SongFormPage() {
  const navigate = useNavigate();
  const { songId } = useParams();
  const [isDirty, setIsDirty] = useState(false);
  const editor = useSongEditor(songId, () => {
    setIsDirty(false);
    navigate(LIST_PATH);
  });
  const { options, isLoading: isCategoriesLoading, error: categoriesError } = useMusicCategories("lecturer");
  const { guard, confirmProps } = useLeaveGuard({ isDirty });
  const leave = () => guard(() => navigate(LIST_PATH));

  const loadError = editor.loadError ?? categoriesError;
  const isReady = !editor.isLoading && !isCategoriesLoading && !loadError;

  return (
    <TeacherShell>
      <TeacherPageHeader
        title="Sửa bài hát"
        subtitle={editor.song?.title}
        onBack={leave}
        actions={
          <>
            <ActionButton variant="secondary" onClick={leave} className="max-sm:hidden">
              Hủy
            </ActionButton>
            <ActionButton type="submit" form={FORM_ID} disabled={!isReady} isLoading={editor.isSubmitting}>
              Lưu
            </ActionButton>
          </>
        }
      />

      {editor.submitError && (
        <p
          role="alert"
          className="mx-[18px] mt-4 rounded-[13px] bg-bvc-accent-tint px-4 py-3 text-sm text-bvc-accent-text md:mx-8"
        >
          {editor.submitError}
        </p>
      )}

      {loadError ? (
        <div className="px-[18px] py-8 md:px-8">
          <EmptyState title="Không mở được bài hát" description={loadError} />
        </div>
      ) : !isReady ? (
        <div aria-hidden className="grid animate-pulse gap-6 px-[18px] py-7 md:px-8 lg:grid-cols-[280px_1fr_1fr]">
          <span className="aspect-square w-40 rounded-bvc-xl bg-bvc-surface lg:w-full" />
          <span className="h-72 rounded-bvc-xl bg-bvc-surface" />
          <span className="h-72 rounded-bvc-xl bg-bvc-surface" />
        </div>
      ) : (
        <SongForm
          key={editor.song?.id ?? "new"}
          formId={FORM_ID}
          song={editor.song}
          options={options}
          onSubmit={editor.submit}
          onDirtyChange={setIsDirty}
        />
      )}
      <LeaveConfirmDialog {...confirmProps} />
    </TeacherShell>
  );
}
