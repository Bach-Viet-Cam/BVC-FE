import { Link } from "react-router-dom";
import { TagBadge } from "@/shared/components/bvc/TagBadge";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { ActionTooltip } from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/utils/cn";
import { formatDate } from "@/shared/utils/formatDate";
import { CoverArt } from "@/features/music-library/components/CoverArt";
import { VisibilitySwitch } from "@/features/music-library/components/VisibilitySwitch";
import { LIBRARY_MESSAGES } from "@/features/music-library/constants/musicLibraryConstants";
import type { LecturerPiece } from "@/features/music-library/types/lecturerTypes";
import { coverToneOf } from "@/features/music-library/utils/coverTone";
import { pieceLockMessage } from "@/features/music-library/utils/pieceAccess";

interface ManagedSongRowProps {
  song: LecturerPiece;
  isUpdating: boolean;
  onRequestVisibility: (song: LecturerPiece, nextVisible: boolean) => void;
}

export const MANAGED_GRID_COLUMNS =
  "xl:grid xl:grid-cols-[56px_minmax(0,1.6fr)_minmax(0,1.3fr)_80px_150px_80px_250px] xl:items-center xl:gap-4";

export function ManagedSongRow({ song, isUpdating, onRequestVisibility }: ManagedSongRowProps) {
  const instrumentNames = song.instruments.map((instrument) => instrument.name).join(", ");
  const editHref = `/songs/${song.id}/edit`;
  const sheetsHref = `/songs/${song.id}/sheets`;
  const isOwner = song.canEdit;
  const isLocked = !song.canManageSheets;
  // Thư viện chỉ mở bài đang công khai, bài ẩn thì sinh viên (và cả trang xem) chưa thấy được
  const isViewable = song.effectiveVisibility === "PUBLIC";

  const row = (
    <li
      aria-disabled={isLocked || undefined}
      className={cn(
        "flex flex-col gap-3 border-t border-bvc-border px-3.5 py-4 xl:py-2.5",
        MANAGED_GRID_COLUMNS,
        isLocked && "cursor-not-allowed opacity-60"
      )}
    >
      <div className="flex items-start gap-3 xl:contents">
        <CoverArt title={song.title} tone={coverToneOf(song.id)} url={song.coverUrl ?? undefined} size="thumb" />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex min-w-0 items-center gap-2">
            {isLocked ? (
              <span className="truncate text-[15px] font-semibold text-bvc-ink">{song.title}</span>
            ) : (
              <Link
                to={isOwner ? editHref : sheetsHref}
                className="truncate text-[15px] font-semibold text-bvc-ink hover:text-bvc-accent-text"
              >
                {song.title}
              </Link>
            )}
            {!isOwner && <TagBadge label="Đóng góp" />}
          </span>
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
        <span
          className="font-bvc-mono text-[13px] text-bvc-ink"
          title={isOwner ? undefined : `Bạn đóng góp ${song.mySheetMusicCount}/${song.sheetMusicCount} bản`}
        >
          {isOwner ? song.sheetMusicCount : `${song.mySheetMusicCount}/${song.sheetMusicCount}`}
          <span className="font-bvc-sans text-bvc-muted xl:hidden"> bản</span>
        </span>
        <span
          className="order-first xl:order-none"
          title={!isOwner && !isLocked ? LIBRARY_MESSAGES.ownerOnlyVisibility : undefined}
        >
          <VisibilitySwitch
            visibility={song.effectiveVisibility}
            itemName={song.title}
            disabled={isUpdating || !song.canChangeVisibility}
            onRequestChange={(nextVisible) => onRequestVisibility(song, nextVisible)}
          />
        </span>
        <span className="font-bvc-mono text-[13px] text-bvc-muted">{formatDate(song.updatedAt, "dd/MM")}</span>
        <span className="ml-auto flex gap-1.5 xl:ml-0 xl:justify-end">
          {isOwner && (
            <Link to={editHref} className={actionButtonClass("secondary", "sm", "hover:text-bvc-ink")}>
              Sửa
            </Link>
          )}
          {isLocked ? (
            <span aria-disabled className={actionButtonClass("secondary", "sm", "pointer-events-none")}>
              Bản nhạc
            </span>
          ) : (
            <Link to={sheetsHref} className={actionButtonClass("secondary", "sm", "hover:text-bvc-ink")}>
              Bản nhạc
            </Link>
          )}
          {isViewable && (
            <Link
              to={`/library/${song.id}`}
              title="Xem chi tiết bài hát như sinh viên"
              className={actionButtonClass("ghost", "sm", "hover:text-bvc-accent-text")}
            >
              Xem
            </Link>
          )}
        </span>
      </div>

      {isOwner && song.moderation === "ADMIN_HIDDEN" && (
        <p className="text-xs text-bvc-accent-text xl:col-span-full">
          {LIBRARY_MESSAGES.hiddenByAdmin}
          {song.moderationReason && ` Lý do: ${song.moderationReason}`}
        </p>
      )}
    </li>
  );

  return isLocked ? <ActionTooltip content={pieceLockMessage(song.moderation)}>{row}</ActionTooltip> : row;
}
