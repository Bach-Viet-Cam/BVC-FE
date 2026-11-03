export const LIBRARY_PARAM_NAMES = {
  keyword: "q",
  genreId: "genre",
  // Nhiều nhạc cụ ghi chung một tham số, ngăn bằng dấu phẩy
  instrumentIds: "instrument",
  levelId: "level",
  sort: "sort",
  page: "page",
} as const;

type FilterLink = Partial<Record<"genreId" | "instrumentId" | "levelId", string>>;

// Link tới thư viện đã lọc sẵn; dùng cho tag thể loại / nhạc cụ / trình độ
export function libraryFilterHref(filters: FilterLink) {
  const params = new URLSearchParams();
  if (filters.genreId) params.set(LIBRARY_PARAM_NAMES.genreId, filters.genreId);
  if (filters.instrumentId) params.set(LIBRARY_PARAM_NAMES.instrumentIds, filters.instrumentId);
  if (filters.levelId) params.set(LIBRARY_PARAM_NAMES.levelId, filters.levelId);
  const search = params.toString();
  return search ? `/library?${search}` : "/library";
}
