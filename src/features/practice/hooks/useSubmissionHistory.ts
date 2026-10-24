import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { practiceSubmissionApi } from "@/features/practice/api/practiceSubmissionApi";
import { EMPTY_SUBMISSION_FILTER } from "@/features/practice/constants/submissionHistoryMockData";
import type {
  SubmissionAccuracyRange,
  SubmissionAdvancedFilter,
  SubmissionDatePreset,
  SubmissionFilter,
  SubmissionHistoryItem,
  SubmissionHistoryOverall,
} from "@/features/practice/types/submissionHistoryTypes";
import {
  countActiveFilters,
  countAdvancedFilters,
  countQuickFilters,
  groupByDay,
  toHistoryQuery,
} from "@/features/practice/utils/submissionHistory";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

const REQUIRED_SELECTION = 2;
const LOAD_ERROR = "Tải danh sách bài nộp thất bại. Vui lòng thử lại.";
const EMPTY_OVERALL: SubmissionHistoryOverall = { total: 0, completed: 0, processing: 0, rejected: 0, failed: 0 };

interface LoadedHistory {
  // Bộ lọc (dạng query trang 1) mà các trang đã tải thuộc về
  key: string;
  // Lần gọi gần nhất đã xong (bộ lọc + trang + lần tải lại)
  requestKey: string;
  items: SubmissionHistoryItem[];
  total: number;
}

function toSummary(overall: SubmissionHistoryOverall) {
  return [
    `${overall.completed} bài đã phân tích`,
    `${overall.processing} bài đang xử lý`,
    overall.rejected > 0 && `${overall.rejected} bài bị từ chối`,
    overall.failed > 0 && `${overall.failed} bài lỗi xử lý`,
  ]
    .filter(Boolean)
    .join(" · ");
}

// SCR-01: danh sách bài nộp (GET /practice/submissions), lọc phía BE, tải thêm theo trang, chế độ chọn 2 bài để so sánh
export function useSubmissionHistory() {
  const navigate = useNavigate();
  // Cố định "hôm nay" trong suốt phiên xem để mốc ngày và nhãn "Hôm nay" không đổi giữa chừng
  const [today] = useState(() => new Date());

  const [filter, setFilter] = useState<SubmissionFilter>(EMPTY_SUBMISSION_FILTER);
  const [page, setPage] = useState(1);
  const [loaded, setLoaded] = useState<LoadedHistory | null>(null);
  const [overall, setOverall] = useState<SubmissionHistoryOverall | null>(null);
  const [loadError, setLoadError] = useState<{ key: string; message: string } | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showInvalid, setShowInvalid] = useState(false);

  const filterQuery = useMemo(() => toHistoryQuery(filter, 1, today), [filter, today]);
  const filterKey = JSON.stringify(filterQuery);
  const requestKey = `${filterKey}#${page}#${reloadCount}`;

  useEffect(() => {
    if (!filterQuery) return;
    const controller = new AbortController();
    practiceSubmissionApi.listHistory({ ...filterQuery, page }, controller.signal).then(
      ({ data }) => {
        const result = data.data;
        setOverall(result.overall);
        setLoadError(null);
        setLoaded((current) => ({
          key: filterKey,
          requestKey,
          // Trang sau nối vào danh sách đang có của cùng bộ lọc; trang 1 thay mới
          items: page > 1 && current?.key === filterKey ? [...current.items, ...result.items] : result.items,
          total: result.pagination.total,
        }));
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setLoadError({ key: requestKey, message: getErrorMessage(error, LOAD_ERROR) });
      }
    );
    return () => controller.abort();
  }, [filterQuery, filterKey, page, requestKey]);

  const pieces = useAsyncData(
    () => practiceSubmissionApi.listHistoryPieces().then(({ data }) => data.data),
    "submission-history:pieces",
    "Tải danh sách bài hát thất bại."
  );

  // Hai khoảng ngày không giao nhau: chắc chắn rỗng, không gọi API
  const isImpossible = filterQuery === null;
  // Trong lúc tải bộ lọc mới vẫn giữ danh sách cũ để màn không nháy
  const items = useMemo(() => (isImpossible ? [] : (loaded?.items ?? [])), [isImpossible, loaded]);
  const visibleCount = isImpossible ? 0 : (loaded?.total ?? 0);
  const error = loadError?.key === requestKey ? loadError.message : null;
  const isLoading = !isImpossible && !error && loaded?.requestKey !== requestKey;
  const isFirstLoad = isLoading && loaded === null;
  const hasMore = !isImpossible && !isLoading && loaded !== null && loaded.items.length < loaded.total;

  const groups = useMemo(() => groupByDay(items, today), [items, today]);
  const stats = overall ?? EMPTY_OVERALL;
  const activeFilterCount = countActiveFilters(filter);
  const quickFilterCount = countQuickFilters(filter);
  const advancedFilterCount = countAdvancedFilters(filter.advanced);

  const summary =
    activeFilterCount > 0 ? `${visibleCount} trong ${stats.total} bài nộp khớp bộ lọc` : toSummary(stats);

  // GBR-15: chỉ cho so sánh khi có từ 2 bài đã phân tích xong
  const canCompare = stats.completed >= REQUIRED_SELECTION;
  const isSelectionFull = selectedIds.length >= REQUIRED_SELECTION;

  // Mọi thay đổi bộ lọc đều tải lại từ trang 1
  function updateFilter(update: (current: SubmissionFilter) => SubmissionFilter) {
    setFilter(update);
    setPage(1);
  }

  function isSelectable(item: SubmissionHistoryItem) {
    if (item.status !== "COMPLETED") return false;
    return isSelectionFull ? selectedIds.includes(item.id) : true;
  }

  function startSelecting() {
    setIsSelecting(true);
    setSelectedIds([]);
    setShowInvalid(false);
  }

  function cancelSelecting() {
    setIsSelecting(false);
    setSelectedIds([]);
    setShowInvalid(false);
  }

  function toggleSelected(id: string) {
    setShowInvalid(false);
    setSelectedIds((selected) => {
      if (selected.includes(id)) return selected.filter((value) => value !== id);
      return selected.length >= REQUIRED_SELECTION ? selected : [...selected, id];
    });
  }

  // MSG-25 khi bấm "Xem so sánh" mà chưa đủ 2 bài (Alt 4)
  function submitCompare() {
    if (selectedIds.length !== REQUIRED_SELECTION) {
      setShowInvalid(true);
      return;
    }
    const [a, b] = selectedIds;
    navigate(`/practice/submissions/compare?a=${a}&b=${b}`);
  }

  // Bài đã phân tích mở màn kết quả; bài bị từ chối hoặc lỗi mở màn xử lý (lý do, thử lại)
  function openSubmission(item: SubmissionHistoryItem) {
    const path = `/practice/submissions/${encodeURIComponent(item.id)}`;
    navigate(item.status === "COMPLETED" ? path : `${path}/processing`);
  }

  function setPieceIds(pieceIds: string[]) {
    updateFilter((value) => ({ ...value, pieceIds }));
  }

  // Bấm lại mốc đang chọn để bỏ chọn
  function setDatePreset(datePreset: SubmissionDatePreset | null) {
    updateFilter((value) => ({ ...value, datePreset: value.datePreset === datePreset ? null : datePreset }));
  }

  function toggleAccuracyRange(range: SubmissionAccuracyRange) {
    updateFilter((value) => ({
      ...value,
      accuracyRanges: value.accuracyRanges.includes(range)
        ? value.accuracyRanges.filter((item) => item !== range)
        : [...value.accuracyRanges, range],
    }));
  }

  function applyAdvanced(advanced: SubmissionAdvancedFilter) {
    updateFilter((value) => ({ ...value, advanced }));
    setIsAdvancedOpen(false);
  }

  function clearQuickFilter() {
    updateFilter((value) => ({ ...value, pieceIds: [], datePreset: null, accuracyRanges: [] }));
  }

  function clearFilter() {
    updateFilter(() => EMPTY_SUBMISSION_FILTER);
  }

  function loadMore() {
    if (hasMore && !isLoading) setPage((value) => value + 1);
  }

  function reload() {
    setReloadCount((value) => value + 1);
  }

  return {
    filter,
    pieceOptions: pieces.data ?? [],
    groups,
    quickFilterCount,
    advancedFilterCount,
    isAdvancedOpen,
    setIsAdvancedOpen,
    applyAdvanced,
    clearQuickFilter,
    summary,
    totalCount: stats.total,
    visibleCount,
    activeFilterCount,
    isFirstLoad,
    isLoading,
    error,
    hasMore,
    loadMore,
    reload,
    isSelecting,
    selectedIds,
    showInvalid,
    canCompare,
    isSelectable,
    startSelecting,
    cancelSelecting,
    toggleSelected,
    submitCompare,
    openSubmission,
    setPieceIds,
    setDatePreset,
    toggleAccuracyRange,
    clearFilter,
  };
}
