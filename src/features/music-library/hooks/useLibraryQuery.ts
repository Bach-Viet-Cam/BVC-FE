import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { LIBRARY_SORT_OPTIONS } from "@/features/music-library/constants/musicLibraryConstants";
import type { LibrarySongQuery, LibrarySort } from "@/features/music-library/types/musicLibraryTypes";
import { LIBRARY_PARAM_NAMES as PARAM_NAMES } from "@/features/music-library/utils/libraryLinks";

function parseSort(value: string | null): LibrarySort {
  return LIBRARY_SORT_OPTIONS.find((option) => option.value === value)?.value ?? "newest";
}

// Bộ lọc thư viện nằm trên URL để click tag ở trang chi tiết mở đúng danh sách đã lọc
export function useLibraryQuery() {
  const [params, setParams] = useSearchParams();

  const query = useMemo<LibrarySongQuery>(
    () => ({
      keyword: params.get(PARAM_NAMES.keyword) ?? "",
      genreId: params.get(PARAM_NAMES.genreId) ?? "",
      instrumentId: params.get(PARAM_NAMES.instrumentId) ?? "",
      levelId: params.get(PARAM_NAMES.levelId) ?? "",
      sort: parseSort(params.get(PARAM_NAMES.sort)),
      page: Math.max(1, Number(params.get(PARAM_NAMES.page)) || 1),
    }),
    [params]
  );

  const update = useCallback(
    (changes: Partial<LibrarySongQuery>) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          Object.entries(changes).forEach(([key, value]) => {
            // Object.entries trả key dạng string; key luôn thuộc LibrarySongQuery
            const name = PARAM_NAMES[key as keyof typeof PARAM_NAMES];
            const isDefault = value === "" || (key === "sort" && value === "newest") || (key === "page" && value === 1);
            if (isDefault) next.delete(name);
            else next.set(name, String(value));
          });
          // Đổi bộ lọc thì quay về trang 1
          if (!("page" in changes)) next.delete(PARAM_NAMES.page);
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  const clearFilters = useCallback(() => update({ genreId: "", instrumentId: "", levelId: "" }), [update]);

  const activeFilterCount = [query.genreId, query.instrumentId, query.levelId].filter(Boolean).length;

  return { query, update, clearFilters, activeFilterCount };
}
