import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Plus, Users } from "lucide-react";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { Chip } from "@/shared/components/bvc/Chip";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { PillTabs } from "@/shared/components/bvc/PillTabs";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { useViewerRole } from "@/shared/hooks/useViewerRole";
import { CoverArt } from "@/features/music-library/components/CoverArt";
import { FeaturedSheetCard } from "@/features/music-library/components/FeaturedSheetCard";
import { GuestSaveDialog } from "@/features/music-library/components/GuestSaveDialog";
import { SaveToggleButton } from "@/features/music-library/components/SaveToggleButton";
import { SheetVersionList } from "@/features/music-library/components/SheetVersionList";
import { useSaveToggle } from "@/features/music-library/hooks/useSaveToggle";
import { useSongDetail } from "@/features/music-library/hooks/useSongDetail";
import { libraryFilterHref } from "@/features/music-library/utils/libraryLinks";
import { groupSheetsByInstrument, sheetViewerHref } from "@/features/music-library/utils/sheetUtils";

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
  const role = useViewerRole();
  const { song, error, isLoading, setSongSaved } = useSongDetail(songId);
  const save = useSaveToggle();
  const [selectedInstrumentId, setSelectedInstrumentId] = useState("");

  if (isLoading) {
    return (
      <StudentShell>
        <DetailSkeleton />
      </StudentShell>
    );
  }

  if (error || !song) {
    return (
      <StudentShell>
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
      </StudentShell>
    );
  }

  const groups = groupSheetsByInstrument(song.sheets).filter((group) => group.sheets.length > 0);
  const activeGroup = groups.find((group) => group.instrument.id === selectedInstrumentId) ?? groups[0];
  const featured = activeGroup?.sheets[0];
  const others = activeGroup?.sheets.slice(1) ?? [];

  return (
    <StudentShell>
      <section className="flex shrink-0 flex-col gap-[18px] bg-bvc-surface px-[18px] pt-5 pb-7 md:px-14 md:pt-[22px] md:pb-[30px]">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13.5px] text-bvc-muted">
          <Link to="/library" className="flex items-center gap-1 text-bvc-muted hover:text-bvc-ink">
            <ChevronLeft className="size-4" aria-hidden />
            Thư viện bài hát
          </Link>
          <span aria-hidden>/</span>
          <span className="truncate font-semibold text-bvc-ink">{song.title}</span>
        </nav>

        <div className="flex flex-col gap-5 md:flex-row md:items-end md:gap-9">
          <CoverArt
            title={song.title}
            tone={song.coverTone}
            url={song.coverUrl}
            size="hero"
            className="w-[140px] md:w-[220px]"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <span className="text-xs font-bold tracking-[0.08em] text-bvc-muted uppercase">Bài hát</span>
            <h1 className="text-[34px] leading-none font-extrabold tracking-[-0.035em] text-bvc-ink md:text-[56px]">
              {song.title}
            </h1>
            <span className="text-[15px] text-bvc-muted">
              Tác giả: {song.composer || "Chưa rõ"} · {song.genre.name} · {song.instruments.length} nhạc cụ
            </span>
            {song.description && (
              <p className="max-w-[620px] text-[15px] leading-relaxed text-bvc-ink">{song.description}</p>
            )}
            <div className="flex flex-wrap gap-1.5">
              <Chip
                variant="surface"
                to={libraryFilterHref({ genreId: song.genre.id })}
                title={`Lọc theo ${song.genre.name}`}
                className="bg-white"
              >
                {song.genre.name}
              </Chip>
              {song.instruments.map((instrument) => (
                <Chip
                  key={instrument.id}
                  variant="surface"
                  to={libraryFilterHref({ instrumentId: instrument.id })}
                  title={`Lọc theo ${instrument.name}`}
                  className="bg-white"
                >
                  {instrument.name}
                </Chip>
              ))}
              <Chip to={libraryFilterHref({ levelId: song.level.id })} title={`Lọc theo ${song.level.name}`}>
                {song.level.name}
              </Chip>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2.5">
              {save.canSave && (
                <SaveToggleButton
                  itemName={song.title}
                  isSaved={save.isSavedForViewer(song.isSaved)}
                  disabled={save.isPending(song.id)}
                  onToggle={() =>
                    save.toggle({ target: "song", id: song.id, isSaved: song.isSaved, onChange: setSongSaved })
                  }
                />
              )}
              <Link
                to={`/ensemble/new?pieceId=${song.id}`}
                className={actionButtonClass("primary", "lg", "bg-bvc-accent hover:bg-bvc-accent/90 hover:text-white")}
              >
                <Users className="size-[18px]" strokeWidth={1.8} aria-hidden />
                Luyện hòa tấu
              </Link>
              <span className="hidden max-w-[260px] text-[13px] leading-snug text-bvc-muted md:inline">
                Chơi cùng các bản mẫu của giảng viên, không cần ghép cặp.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="sheet-heading"
        className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-4 px-[18px] py-6 md:px-14"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-5">
          <h2 id="sheet-heading" className="text-2xl font-extrabold tracking-[-0.02em] text-bvc-ink">
            Bản nhạc
          </h2>
          {groups.length > 0 && activeGroup && (
            <PillTabs
              label="Chọn nhạc cụ"
              value={activeGroup.instrument.id}
              onChange={setSelectedInstrumentId}
              tabs={groups.map((group) => ({
                value: group.instrument.id,
                label: group.instrument.name,
                count: group.sheets.length,
              }))}
            />
          )}
        </div>

        {featured ? (
          <>
            <FeaturedSheetCard sheet={featured} viewerHref={sheetViewerHref(song.id, featured.id)} />
            <SheetVersionList
              title="Bản khác theo độ khó"
              sheets={others}
              hrefOf={(sheet) => sheetViewerHref(song.id, sheet.id)}
            />
          </>
        ) : (
          <EmptyState
            title="Chưa có bản nhạc công khai"
            description="Giảng viên chưa công khai bản nhạc nào cho bài hát này."
          />
        )}

        {role === "teacher" && (
          <div className="mt-auto flex flex-col gap-2 border-t border-bvc-border pt-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-bvc-muted">
              <Chip className="min-h-0 py-[3px] text-[11.5px] font-bold">Giảng viên</Chip>
              Thêm bản nhạc mới cho bài hát này, theo nhạc cụ và độ khó
            </span>
            <Link
              to={`/songs/${song.id}/sheets?new=1${activeGroup ? `&instrument=${activeGroup.instrument.id}` : ""}`}
              className={actionButtonClass("dashed", "lg", "w-full font-bold hover:text-bvc-ink")}
            >
              <Plus className="size-[18px]" aria-hidden />
              Tạo bản nhạc
            </Link>
          </div>
        )}
      </section>

      <GuestSaveDialog open={save.isGuestPromptOpen} onOpenChange={save.setGuestPromptOpen} />
    </StudentShell>
  );
}
