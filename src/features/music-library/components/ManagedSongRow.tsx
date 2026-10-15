import { Link } from "react-router-dom";
import { Chip } from "@/shared/components/bvc/Chip";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { formatDate } from "@/shared/utils/formatDate";
import { CoverArt } from "@/features/music-library/components/CoverArt";
import { VisibilitySwitch } from "@/features/music-library/components/VisibilitySwitch";
import { LIBRARY_MESSAGES } from "@/features/music-library/constants/musicLibraryConstants";
import type { ManagedSong } from "@/features/music-library/types/musicLibraryTypes";

interface ManagedSongRowProps {
  song: ManagedSong;
  isUpdating: boolean;
  onRequestVisibility: (song: ManagedSong, nextVisible: boolean) => void;
}

export const MANAGED_GRID_COLUMNS =
  "xl:grid xl:grid-cols-[56px_minmax(0,1.6fr)_minmax(0,1.3fr)_120px_80px_150px_80px_200px] xl:items-center xl:gap-4";

export function ManagedSongRow({ song, isUpdating, onRequestVisibility }: ManagedSongRowProps) {
  const instrumentNames = song.instruments.map((instrument) => instrument.name).join(", ");
  const editHref = `/songs/${song.id}/edit`;
  const sheetsHref = `/songs/${song.id}/sheets`;

  return (
    <li className={`flex flex-col gap-3 border-t border-bvc-border px-3.5 py-4 xl:py-2.5 ${MANAGED_GRID_COLUMNS}`}>
      <div className="flex items-start gap-3 xl:contents">
        <CoverArt title={song.title} tone={song.coverTone} url={song.coverUrl} size="thumb" />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Link to={editHref} className="truncate text-[15px] font-bold text-bvc-ink hover:text-bvc-accent-text">
            {song.title}
          </Link>
          <span className="truncate text-[12.5px] text-bvc-muted">
            {song.composer || "Chưa rõ tác giả"}
            <span className="xl:hidden"> · {instrumentNames}</span>
          </span>
        </span>
        <span className="hidden truncate text-[13px] text-bvc-muted xl:block" title={instrumentNames}>
          {instrumentNames}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 xl:contents">
        <span>
          <Chip>{song.level.name}</Chip>
        </span>
        <span className="font-bvc-mono text-[13px] text-bvc-ink">
          {song.sheetCount}
          <span className="font-bvc-sans text-bvc-muted xl:hidden"> bản</span>
        </span>
        <VisibilitySwitch
          visibility={song.visibility}
          itemName={song.title}
          disabled={isUpdating}
          onRequestChange={(nextVisible) => onRequestVisibility(song, nextVisible)}
          className="order-first xl:order-none"
        />
        <span className="font-bvc-mono text-[13px] text-bvc-muted">{formatDate(song.updatedAt, "dd/MM")}</span>
        <span className="ml-auto flex gap-1.5 xl:ml-0 xl:justify-end">
          <Link to={editHref} className={actionButtonClass("secondary", "sm", "hover:text-bvc-ink")}>
            Sửa
          </Link>
          <Link to={sheetsHref} className={actionButtonClass("secondary", "sm", "hover:text-bvc-ink")}>
            Bản nhạc
          </Link>
        </span>
      </div>

      {song.visibility === "HIDDEN_BY_ADMIN" && (
        <p className="text-xs text-bvc-accent-text xl:hidden">{LIBRARY_MESSAGES.hiddenByAdmin}</p>
      )}
    </li>
  );
}
