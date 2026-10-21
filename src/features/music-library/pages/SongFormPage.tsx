import { Link, useParams } from "react-router-dom";
import { TeacherShell } from "@/shared/components/bvc/TeacherShell";
import { FocusHeader } from "@/shared/components/bvc/FocusHeader";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { SongForm } from "@/features/music-library/components/SongForm";
import { useMusicCategories } from "@/features/music-library/hooks/useMusicCategories";
import { useSongEditor } from "@/features/music-library/hooks/useSongEditor";

const FORM_ID = "song-form";

export function SongFormPage() {
  const { songId } = useParams();
  const editor = useSongEditor(songId);
  const { options, isLoading: isCategoriesLoading, error: categoriesError } = useMusicCategories("lecturer");

  const title = editor.isEditing ? `Sửa bài hát${editor.song ? ` - ${editor.song.title}` : ""}` : "Thêm bài hát";
  const loadError = editor.loadError ?? categoriesError;
  const isReady = !editor.isLoading && !isCategoriesLoading && !loadError;

  return (
    <TeacherShell>
      <FocusHeader
        backTo="/songs"
        backLabel="Quay lại thư viện bài hát của tôi"
        title={title}
        actions={
          <>
            <Link to="/songs" className={actionButtonClass("secondary", "md", "hover:text-bvc-ink")}>
              Hủy
            </Link>
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
        />
      )}
    </TeacherShell>
  );
}
