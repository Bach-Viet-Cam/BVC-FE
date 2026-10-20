import { FilterPill } from "@/shared/components/bvc/FilterPill";
import type { SelectOption } from "@/shared/types/commonTypes";
import { LIBRARY_SORT_OPTIONS } from "@/features/music-library/constants/musicLibraryConstants";
import type { LibrarySongQuery, LibrarySort } from "@/features/music-library/types/musicLibraryTypes";

interface LibraryFilterBarProps {
  query: LibrarySongQuery;
  options: { genres: SelectOption[]; instruments: SelectOption[]; levels: SelectOption[] };
  total?: number;
  page?: number;
  totalPages?: number;
  hasActiveFilters: boolean;
  onChange: (changes: Partial<LibrarySongQuery>) => void;
  onClearFilters: () => void;
}

export function LibraryFilterBar({
  query,
  options,
  total,
  page,
  totalPages,
  hasActiveFilters,
  onChange,
  onClearFilters,
}: LibraryFilterBarProps) {
  return (
    <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:gap-2">
      <div className="-mx-[18px] flex gap-[7px] overflow-x-auto px-[18px] [scrollbar-width:none] md:mx-0 md:px-0 md:gap-2">
        <FilterPill
          label="Thể loại"
          value={query.genreId}
          options={options.genres}
          onChange={(genreId) => onChange({ genreId })}
        />
        <FilterPill
          label="Nhạc cụ"
          value={query.instrumentId}
          options={options.instruments}
          onChange={(instrumentId) => onChange({ instrumentId })}
        />
        <FilterPill
          label="Trình độ"
          value={query.levelId}
          options={options.levels}
          onChange={(levelId) => onChange({ levelId })}
        />
      </div>

      <div className="flex items-center justify-between gap-2.5 md:flex-1">
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="cursor-pointer text-[13.5px] font-semibold text-bvc-accent-text hover:underline md:ml-1.5"
          >
            Xóa bộ lọc
          </button>
        ) : (
          <span className="md:hidden" />
        )}
        <span className="flex items-center gap-2.5 md:ml-auto">
          {total !== undefined && (
            <span className="text-[13px] text-bvc-muted md:text-[13.5px]" aria-live="polite">
              {total} bài
              {totalPages !== undefined && totalPages > 1 && (
                <span className="md:hidden">
                  {" "}
                  · trang {page} / {totalPages}
                </span>
              )}
            </span>
          )}
          <label htmlFor="library-sort" className="sr-only">
            Sắp xếp
          </label>
          <select
            id="library-sort"
            value={query.sort}
            // Giá trị select chỉ đến từ LIBRARY_SORT_OPTIONS
            onChange={(event) => onChange({ sort: event.target.value as LibrarySort })}
            className="h-9 cursor-pointer rounded-full border border-bvc-border-strong bg-white px-3 text-[13px] text-bvc-ink md:h-10 md:px-3.5 md:text-[13.5px]"
          >
            {LIBRARY_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </span>
      </div>
    </div>
  );
}
