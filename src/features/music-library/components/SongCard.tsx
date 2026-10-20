import { Link } from "react-router-dom";
import { Guitar } from "lucide-react";
import { Chip } from "@/shared/components/bvc/Chip";
import { CoverArt } from "@/features/music-library/components/CoverArt";
import { SaveToggleButton } from "@/features/music-library/components/SaveToggleButton";
import type { LibrarySong } from "@/features/music-library/types/musicLibraryTypes";

interface SongCardProps {
  song: LibrarySong;
  levelFilterHref: string;
  showSave: boolean;
  isSaving?: boolean;
  onToggleSave: (song: LibrarySong) => void;
}

export function SongCard({ song, levelFilterHref, showSave, isSaving, onToggleSave }: SongCardProps) {
  const detailHref = `/library/${song.id}`;

  return (
    <article className="flex min-w-0 flex-col gap-2.5">
      <div className="relative">
        <Link to={detailHref} aria-label={`Mở ${song.title}`} className="block">
          <CoverArt title={song.title} tone={song.coverTone} url={song.coverUrl} />
        </Link>
        {showSave && (
          <SaveToggleButton
            variant="icon"
            itemName={song.title}
            isSaved={song.isSaved}
            disabled={isSaving}
            onToggle={() => onToggleSave(song)}
            className="absolute top-2.5 right-2.5"
          />
        )}
      </div>
      <Link to={detailHref} className="flex flex-col gap-0.5 text-bvc-ink hover:text-bvc-ink">
        <span className="truncate text-base font-bold">{song.title}</span>
        <span className="truncate text-[13px] text-bvc-muted">{song.composer || "Chưa rõ tác giả"}</span>
      </Link>
      <div className="flex flex-wrap items-center gap-2.5">
        <Chip to={levelFilterHref} title={`Lọc theo ${song.level.name}`}>
          {song.level.name}
        </Chip>
        <span className="inline-flex items-center gap-1.5 text-[13px] text-bvc-muted">
          <Guitar className="size-3.5" strokeWidth={1.8} aria-hidden />
          {song.instrumentCount} nhạc cụ
        </span>
      </div>
    </article>
  );
}
