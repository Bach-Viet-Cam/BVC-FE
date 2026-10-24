import { useState } from "react";
import { SearchX } from "lucide-react";
import { SearchField } from "@/shared/components/bvc/SearchField";
import { Pagination } from "@/shared/components/bvc/Pagination";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { useDebouncedCallback } from "@/shared/hooks/useDebouncedCallback";
import { cn } from "@/shared/utils/cn";
import { LibraryFilterBar } from "@/features/music-library/components/LibraryFilterBar";
import { LibraryShell } from "@/features/music-library/components/LibraryShell";
import { SongCard } from "@/features/music-library/components/SongCard";
import { SongGridSkeleton } from "@/features/music-library/components/SongGridSkeleton";
import { GuestSaveDialog } from "@/features/music-library/components/GuestSaveDialog";
import { useLibraryQuery } from "@/features/music-library/hooks/useLibraryQuery";
import { useLibrarySongs } from "@/features/music-library/hooks/useLibrarySongs";
import { useMusicCategories } from "@/features/music-library/hooks/useMusicCategories";
import { useSaveToggle } from "@/features/music-library/hooks/useSaveToggle";
import { KEYWORD_MAX_LENGTH, LIBRARY_MESSAGES } from "@/features/music-library/constants/musicLibraryConstants";

function describeNoResult(filterCount: number, hasKeyword: boolean) {
  const conditions = filterCount + (hasKeyword ? 1 : 0);
  if (conditions >= 2) {
    return `Thử bỏ bớt từ khóa hoặc bộ lọc. Bạn đang kết hợp ${conditions} điều kiện, kết quả phải khớp tất cả.`;
  }
  if (hasKeyword) return "Thử từ khóa khác hoặc kiểm tra lại chính tả.";
  return "Chưa có bài hát công khai nào thuộc bộ lọc này.";
}

export function LibraryPage() {
  const { query, update, clearFilters, activeFilterCount } = useLibraryQuery();
  const { options } = useMusicCategories();
  const { result, error, isLoading, isFirstLoad, reload, setSongSaved } = useLibrarySongs(query);
  const save = useSaveToggle();
  const [keyword, setKeyword] = useState(query.keyword);
  const debouncedSearch = useDebouncedCallback((value: string) => update({ keyword: value.trim() }));

  const changeKeyword = (value: string) => {
    setKeyword(value);
    debouncedSearch.run(value);
  };

  const clearKeyword = () => {
    debouncedSearch.cancel();
    setKeyword("");
    update({ keyword: "" });
  };

  const songs = result?.data ?? [];

  return (
    <LibraryShell>
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-4 px-[18px] pt-3.5 pb-6 md:gap-6 md:px-14 md:pt-8 md:pb-7">
        <div className="flex flex-col gap-1">
          <h1 className="text-[27px] leading-tight font-extrabold tracking-[-0.025em] text-bvc-ink md:text-[40px] md:tracking-[-0.03em]">
            Thư viện bài hát
          </h1>
          <p className="hidden text-[15px] text-bvc-muted md:block">Bài hát và bản nhạc giảng viên đã công khai.</p>
        </div>

        <div className="flex flex-col gap-2.5 md:gap-3.5">
          <SearchField
            label="Tìm bài hát"
            value={keyword}
            onChange={changeKeyword}
            maxLength={KEYWORD_MAX_LENGTH}
            placeholder="Tìm theo tên bài, tác giả hoặc mô tả"
            size="lg"
          />
          <LibraryFilterBar
            query={query}
            options={options}
            total={result?.total}
            page={result?.page}
            totalPages={result?.totalPages}
            hasActiveFilters={activeFilterCount > 0}
            onChange={update}
            onClearFilters={clearFilters}
          />
        </div>

        {error ? (
          <EmptyState
            title="Không tải được thư viện"
            description={error}
            actions={<ActionButton onClick={reload}>Thử lại</ActionButton>}
          />
        ) : isFirstLoad ? (
          <SongGridSkeleton />
        ) : songs.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-10" strokeWidth={1.5} />}
            title={LIBRARY_MESSAGES.noResult}
            description={describeNoResult(activeFilterCount, Boolean(query.keyword))}
            actions={
              <>
                {activeFilterCount > 0 && <ActionButton onClick={clearFilters}>Xóa bộ lọc</ActionButton>}
                {query.keyword && (
                  <ActionButton variant="secondary" onClick={clearKeyword}>
                    Xóa từ khóa
                  </ActionButton>
                )}
              </>
            }
            className="md:py-20"
          />
        ) : (
          <div
            aria-busy={isLoading}
            className={cn(
              "grid grid-cols-2 content-start gap-x-3.5 gap-y-4 transition-opacity sm:grid-cols-3 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5",
              isLoading && "opacity-60"
            )}
          >
            {songs.map((song) => (
              <SongCard
                key={song.id}
                song={{ ...song, isSaved: save.isSavedForViewer(song.isSaved) }}
                showSave={save.canSave}
                isSaving={save.isPending(song.id)}
                onToggleSave={(target) =>
                  save.toggle({
                    target: "song",
                    id: target.id,
                    isSaved: target.isSaved,
                    onChange: (isSaved) => setSongSaved(target.id, isSaved),
                  })
                }
              />
            ))}
          </div>
        )}

        {result && (
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            onChange={(page) => {
              update({ page });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="mt-auto pt-2"
          />
        )}
      </div>

      <GuestSaveDialog open={save.isGuestPromptOpen} onOpenChange={save.setGuestPromptOpen} />
    </LibraryShell>
  );
}
