import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { LIBRARY_SORT_OPTIONS } from "@/features/music-library/constants/musicLibraryConstants";
import type { LibrarySongQuery, LibrarySort } from "@/features/music-library/types/musicLibraryTypes";
import { LIBRARY_PARAM_NAMES as PARAM_NAMES } from "@/features/music-library/utils/libraryLinks";

function parseSort(value: string | null): LibrarySort {
  return LIBRARY_SORT_OPTIONS.find((option) => option.value === value)?.value ?? "newest";
}

function parseIdList(value: string | null) {
  return (value ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function toParamValue(value: LibrarySongQuery[keyof LibrarySongQuery]) {
  return Array.isArray(value) ? value.join(",") : String(value);
}

// Bộ lọc thư viện nằm trên URL để click tag ở trang chi tiết mở đúng danh sách đã lọc
export function useLibraryQuery() {
  const [params, setParams] = useSearchParams();

  const query = useMemo<LibrarySongQuery>(
    () => ({
      keyword: params.get(PARAM_NAMES.keyword) ?? "",
      genreId: params.get(PARAM_NAMES.genreId) ?? "",
      instrumentIds: parseIdList(params.get(PARAM_NAMES.instrumentIds)),
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
            const paramValue = toParamValue(value);
            const isDefault =
              paramValue === "" || (key === "sort" && value === "newest") || (key === "page" && value === 1);
            if (isDefault) next.delete(name);
            else next.set(name, paramValue);
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

  const clearFilters = useCallback(() => update({ genreId: "", instrumentIds: [], levelId: "" }), [update]);

  // Mỗi nhóm lọc tính là một điều kiện (các nhạc cụ trong nhóm là "hoặc")
  const activeFilterCount = [query.genreId, query.instrumentIds.length > 0, query.levelId].filter(Boolean).length;

  return { query, update, clearFilters, activeFilterCount };
}
