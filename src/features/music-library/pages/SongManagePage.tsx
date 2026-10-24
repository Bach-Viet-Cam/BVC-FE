import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { TeacherShell } from "@/shared/components/bvc/TeacherShell";
import { SearchField } from "@/shared/components/bvc/SearchField";
import { FilterPill } from "@/shared/components/bvc/FilterPill";
import { Pagination } from "@/shared/components/bvc/Pagination";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { ConfirmDialog } from "@/shared/components/bvc/ConfirmDialog";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { useDebouncedCallback } from "@/shared/hooks/useDebouncedCallback";
import { cn } from "@/shared/utils/cn";
import { MANAGED_GRID_COLUMNS, ManagedSongRow } from "@/features/music-library/components/ManagedSongRow";
import {
  KEYWORD_MAX_LENGTH,
  LIBRARY_MESSAGES,
  MANAGE_PAGE_SIZE,
  VISIBILITY_LABELS,
} from "@/features/music-library/constants/musicLibraryConstants";
import { INITIAL_MANAGED_QUERY, useManagedSongs } from "@/features/music-library/hooks/useManagedSongs";
import { useMusicCategories } from "@/features/music-library/hooks/useMusicCategories";
import { useVisibilityConfirm } from "@/features/music-library/hooks/useVisibilityConfirm";
import type { LecturerPiece } from "@/features/music-library/types/lecturerTypes";
import type { Visibility } from "@/features/music-library/types/musicLibraryTypes";

// Object.keys trả string[]; key của VISIBILITY_LABELS chính là Visibility
const VISIBILITY_OPTIONS = (Object.keys(VISIBILITY_LABELS) as Visibility[]).map((value) => ({
  value,
  label: VISIBILITY_LABELS[value],
}));

const COLUMN_HEADERS = ["", "Tiêu đề", "Nhạc cụ", "Bản nhạc", "Hiển thị", "Cập nhật", ""];

export function SongManagePage() {
  const { options } = useMusicCategories("lecturer");
  const songs = useManagedSongs();
  const visibility = useVisibilityConfirm(songs.changeVisibility);
  const [keyword, setKeyword] = useState("");
  const debouncedSearch = useDebouncedCallback((value: string) => songs.updateQuery({ keyword: value.trim() }));

  const { query, result } = songs;
  const hasFilters = Boolean(query.keyword || query.genreId || query.instrumentId || query.levelId || query.visibility);

  // R-03: công khai bài chưa có bản nhạc công khai thì hỏi lại trước
  const requestVisibility = (song: LecturerPiece, nextVisible: boolean) =>
    visibility.request(song, nextVisible ? "PUBLIC" : "HIDDEN", nextVisible && song.publicSheetMusicCount === 0);

  const resetFilters = () => {
    debouncedSearch.cancel();
    setKeyword("");
    songs.updateQuery(INITIAL_MANAGED_QUERY);
  };

  const pendingSong = visibility.pending?.item;

  return (
    <TeacherShell>
      <header className="flex shrink-0 flex-wrap items-end justify-between gap-4 px-[18px] pt-5 pb-4 md:px-8 md:pt-7">
        <div className="flex flex-col gap-1">
          <h1 className="text-[27px] leading-tight font-extrabold tracking-[-0.03em] text-bvc-ink md:text-[34px]">
            Thư viện bài hát của tôi
          </h1>
          <span className="text-sm text-bvc-muted">
            {result ? `${result.total} bài · ` : ""}
            {MANAGE_PAGE_SIZE} bài mỗi trang, mới cập nhật trước
          </span>
        </div>
        <Link to="/songs/new" className={actionButtonClass("primary", "md", "hover:text-white")}>
          <Plus className="size-[18px]" aria-hidden />
          Thêm bài hát
        </Link>
      </header>

      <div className="flex shrink-0 flex-col gap-2.5 px-[18px] pb-3.5 md:px-8 lg:flex-row lg:items-center">
        <SearchField
          label="Tìm bài hát"
          value={keyword}
          onChange={(value) => {
            setKeyword(value);
            debouncedSearch.run(value);
          }}
          maxLength={KEYWORD_MAX_LENGTH}
          placeholder="Tên bài hoặc tác giả"
          className="lg:w-[340px]"
        />
        <div className="-mx-[18px] flex gap-2 overflow-x-auto px-[18px] [scrollbar-width:none] md:mx-0 md:px-0">
          <FilterPill
            label="Thể loại"
            value={query.genreId}
            options={options.genres}
            onChange={(genreId) => songs.updateQuery({ genreId })}
          />
          <FilterPill
            label="Nhạc cụ"
            value={query.instrumentId}
            options={options.instruments}
            onChange={(instrumentId) => songs.updateQuery({ instrumentId })}
          />
          <FilterPill
            label="Trình độ bản nhạc"
            value={query.levelId}
            options={options.levels}
            onChange={(levelId) => songs.updateQuery({ levelId })}
          />
          <FilterPill
            label="Hiển thị"
            value={query.visibility}
            options={VISIBILITY_OPTIONS}
            // Option lấy từ VISIBILITY_LABELS nên giá trị luôn là Visibility hoặc rỗng
            onChange={(value) => songs.updateQuery({ visibility: value as Visibility | "" })}
          />
        </div>
      </div>

      <section aria-label="Danh sách bài hát" className="flex flex-1 flex-col px-[18px] pb-6 md:px-8 xl:px-[18px]">
        {songs.error ? (
          <EmptyState
            title="Không tải được danh sách"
            description={songs.error}
            actions={<ActionButton onClick={songs.reload}>Thử lại</ActionButton>}
          />
        ) : songs.isFirstLoad ? (
          <div aria-hidden className="flex animate-pulse flex-col gap-2">
            {Array.from({ length: 6 }, (_, index) => (
              <span key={index} className="h-[68px] rounded-2xl bg-bvc-surface" />
            ))}
          </div>
        ) : result && result.items.length === 0 ? (
          <EmptyState
            title={hasFilters ? "Không có bài hát khớp bộ lọc" : "Bạn chưa có bài hát nào"}
            description={
              hasFilters
                ? "Thử bỏ bớt từ khóa hoặc bộ lọc."
                : "Thêm bài hát đầu tiên, rồi tải lên bản nhạc cho từng nhạc cụ."
            }
            actions={
              hasFilters ? (
                <ActionButton onClick={resetFilters}>Xóa bộ lọc</ActionButton>
              ) : (
                <Link to="/songs/new" className={actionButtonClass("primary", "md", "hover:text-white")}>
                  Thêm bài hát
                </Link>
              )
            }
          />
        ) : (
          <>
            <div
              aria-hidden
              className={cn(
                "hidden px-3.5 pb-2.5 text-xs font-bold tracking-[0.06em] text-bvc-muted uppercase",
                MANAGED_GRID_COLUMNS
              )}
            >
              {COLUMN_HEADERS.map((header, index) => (
                <span key={index}>{header}</span>
              ))}
            </div>
            <ul className={cn("border-b border-bvc-border transition-opacity", songs.isLoading && "opacity-60")}>
              {result?.items.map((song) => (
                <ManagedSongRow
                  key={song.id}
                  song={song}
                  isUpdating={songs.updatingId === song.id}
                  onRequestVisibility={requestVisibility}
                />
              ))}
            </ul>
            {result && (
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                <span className="font-bvc-mono text-[13px] text-bvc-muted">
                  Trang {result.page} / {result.totalPages}
                </span>
                <Pagination
                  page={result.page}
                  totalPages={result.totalPages}
                  onChange={(page) => songs.updateQuery({ page })}
                />
              </div>
            )}
          </>
        )}
      </section>

      <ConfirmDialog
        open={visibility.pending !== null}
        onOpenChange={(open) => !open && visibility.cancel()}
        title={
          visibility.pending?.reason === "hide" ? `Ẩn “${pendingSong?.title}”?` : `Công khai “${pendingSong?.title}”?`
        }
        description={
          visibility.pending?.reason === "hide"
            ? "Sinh viên sẽ không còn thấy bài này. Bài đã lưu sẽ hiện “Không khả dụng”."
            : LIBRARY_MESSAGES.noVisibleSheet
        }
        confirmLabel={visibility.pending?.reason === "hide" ? "Ẩn" : "Vẫn công khai"}
        onConfirm={visibility.confirm}
        isLoading={visibility.isApplying}
      />
    </TeacherShell>
  );
}
