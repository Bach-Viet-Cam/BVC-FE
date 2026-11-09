import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, Plus, Users } from "lucide-react";
import { Chip } from "@/shared/components/bvc/Chip";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { useViewerRole } from "@/shared/hooks/useViewerRole";
import { PieceBackdrop } from "@/features/music-library/components/PieceBackdrop";
import { CoverArt } from "@/features/music-library/components/CoverArt";
import { FeaturedSheetCard } from "@/features/music-library/components/FeaturedSheetCard";
import { GuestSaveDialog } from "@/features/music-library/components/GuestSaveDialog";
import { LibraryShell } from "@/features/music-library/components/LibraryShell";
import { SaveToggleButton } from "@/features/music-library/components/SaveToggleButton";
import { PracticeSheetButton } from "@/features/music-library/components/PracticeSheetButton";
import { useAssignedSheetId } from "@/features/music-library/hooks/useAssignedSheetId";
import { useSaveToggle } from "@/features/music-library/hooks/useSaveToggle";
import { useSongDetail } from "@/features/music-library/hooks/useSongDetail";
import { LIBRARY_MESSAGES } from "@/features/music-library/constants/musicLibraryConstants";
import { libraryFilterHref } from "@/features/music-library/utils/libraryLinks";
import { buildInstrumentCards, sheetViewerHref } from "@/features/music-library/utils/sheetUtils";
import { PageTitle } from "@/shared/components/bvc/PageTitle";
import { usePageMeta } from "@/shared/hooks/usePageMeta";

function DetailSkeleton() {
  return (
    <div
      aria-hidden
      className="flex animate-pulse flex-col gap-6 bg-bvc-surface px-[18px] py-8 md:flex-row md:items-end md:px-14"
    >
      <span className="aspect-square w-[140px] rounded-bvc-xl bg-bvc-border md:w-[220px]" />
      <div className="flex flex-1 flex-col gap-3">
        <span className="h-12 w-2/3 rounded-lg bg-bvc-border" />
        <span className="h-4 w-1/2 rounded bg-bvc-border" />
        <span className="h-4 w-3/4 rounded bg-bvc-border" />
      </div>
    </div>
  );
}

export function SongDetailPage() {
  const { songId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get("assignmentId") ?? undefined;
  const role = useViewerRole();
  const { song, error, isLoading, setSongSaved } = useSongDetail(songId);
  usePageMeta({ title: song?.title, description: song?.description || undefined });
  const save = useSaveToggle();
  const assignedSheetId = useAssignedSheetId(assignmentId);
  const [isEnsemblePromptOpen, setEnsemblePromptOpen] = useState(false);
  const ensembleHref = `/ensemble/new?pieceId=${songId}`;
  const ensembleClass = actionButtonClass("primary", "lg", "hover:text-white lg:w-full");
  const ensembleLabel = (
    <>
      <Users className="size-[18px]" strokeWidth={1.8} aria-hidden />
      Luyện hòa tấu
    </>
  );

  if (isLoading) {
    return (
      <LibraryShell>
        <DetailSkeleton />
      </LibraryShell>
    );
  }

  if (error || !song) {
    return (
      <LibraryShell>
        <div className="px-[18px] py-10 md:px-14">
          <EmptyState
            title="Không mở được bài hát"
            description={error}
            actions={
              <Link to="/library" className={actionButtonClass("primary", "md", "hover:text-white")}>
                Về thư viện
              </Link>
            }
          />
        </div>
      </LibraryShell>
    );
  }

  const cards = buildInstrumentCards(song.sheets, { assignedSheetId, classInstrumentId: song.defaultInstrumentId });

  return (
    <LibraryShell>
      <div className="relative isolate flex flex-1 flex-col bg-bvc-ok-tint">
        <PieceBackdrop />
        <div className="flex w-full flex-1 flex-col gap-5 px-[18px] pt-5 pb-8 md:px-14 md:pt-[22px]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13.5px] text-bvc-muted">
            <Link to="/library" className="flex items-center gap-1 font-semibold text-bvc-ink hover:text-bvc-accent">
              <ChevronLeft className="size-4" aria-hidden />
              Thư viện bài hát
            </Link>
            <span aria-hidden>/</span>
            <span className="truncate font-medium text-bvc-ink">{song.title}</span>
          </nav>

          <div className="grid flex-1 items-start gap-8 lg:grid-cols-[minmax(240px,1fr)_minmax(0,3fr)] lg:gap-10">
            <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
              <CoverArt
                title={song.title}
                tone={song.coverTone}
                url={song.coverUrl}
                size="hero"
                className="w-[140px] md:w-[200px] lg:w-full lg:max-w-[300px]"
              />
              <div className="flex min-w-0 flex-col gap-2.5">
                <span className="text-xs font-semibold text-bvc-muted">Bài hát</span>
                <PageTitle className="lg:text-[26px]">{song.title}</PageTitle>
                <span className="text-[14px] text-bvc-muted">
                  Tác giả: {song.composer || "Chưa rõ"} · {cards.length} nhạc cụ · {song.sheets.length} bản nhạc
                </span>
                {song.description && <p className="text-[14px] leading-relaxed text-bvc-ink">{song.description}</p>}
                <div className="flex flex-wrap gap-1.5">
                  <Chip
                    variant="surface"
                    to={libraryFilterHref({ genreId: song.genre.id })}
                    title={`Lọc theo ${song.genre.name}`}
                    className="bg-white"
                  >
                    {song.genre.name}
                  </Chip>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5 lg:flex-col">
                {save.canSave && (
                  <SaveToggleButton
                    itemName={song.title}
                    isSaved={save.isSavedForViewer(song.isSaved)}
                    disabled={save.isPending(song.id)}
                    onToggle={() =>
                      save.toggle({ target: "song", id: song.id, isSaved: song.isSaved, onChange: setSongSaved })
                    }
                    className="lg:w-full"
                  />
                )}
                {song.canPracticeEnsemble && role === "student" && (
                  <Link to={ensembleHref} className={ensembleClass}>
                    {ensembleLabel}
                  </Link>
                )}
                {song.canPracticeEnsemble && role === "guest" && (
                  <button type="button" onClick={() => setEnsemblePromptOpen(true)} className={ensembleClass}>
                    {ensembleLabel}
                  </button>
                )}
              </div>
            </aside>

            <section aria-labelledby="sheet-heading" className="flex min-w-0 flex-col gap-4">
              <h2 id="sheet-heading" className="text-2xl font-semibold tracking-[-0.02em] text-bvc-ink">
                Bản nhạc
              </h2>

              {cards.length > 0 ? (
                <div className="flex flex-col gap-5">
                  {cards.map(({ instrument, featured, isFeaturedAssigned, secondary }) => (
                    <FeaturedSheetCard
                      key={instrument.id}
                      instrument={instrument}
                      sheet={featured}
                      isAssigned={isFeaturedAssigned}
                      secondary={secondary}
                      hrefOf={(item) => sheetViewerHref(song.id, item.id, assignmentId)}
                      practiceOf={(item) => (
                        <PracticeSheetButton
                          sheetId={item.id}
                          sheetName={item.name}
                          assignmentId={assignmentId}
                          size="sm"
                        />
                      )}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState title="Chưa có bản nhạc công khai" />
              )}

              {role === "teacher" && (
                <div className="mt-auto flex flex-col gap-2 border-t border-bvc-border pt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs text-bvc-muted">
                    <Chip className="min-h-0 py-[3px] text-[11.5px] font-semibold">Giảng viên</Chip>
                    Thêm bản nhạc mới cho bài hát này, theo nhạc cụ và độ khó
                  </span>
                  <Link
                    to={`/songs/${song.id}/sheets?new=1`}
                    className={actionButtonClass("dashed", "lg", "w-full font-semibold hover:text-bvc-ink")}
                  >
                    <Plus className="size-[18px]" aria-hidden />
                    Tạo bản nhạc
                  </Link>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <GuestSaveDialog open={save.isGuestPromptOpen} onOpenChange={save.setGuestPromptOpen} />
      <GuestSaveDialog
        open={isEnsemblePromptOpen}
        onOpenChange={setEnsemblePromptOpen}
        title={LIBRARY_MESSAGES.guestEnsembleTitle}
        description={null}
        redirectTo={ensembleHref}
      />
    </LibraryShell>
  );
}
