import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EMPTY_SUBMISSION_FILTER,
  SUBMISSION_HISTORY_MOCK,
} from "@/features/practice/constants/submissionHistoryMockData";
import type {
  SubmissionAccuracyRange,
  SubmissionAdvancedFilter,
  SubmissionDatePreset,
  SubmissionFilter,
  SubmissionHistoryItem,
} from "@/features/practice/types/submissionHistoryTypes";
import {
  countActiveFilters,
  countAdvancedFilters,
  countQuickFilters,
  filterSubmissions,
  getPieceOptions,
  groupByDay,
} from "@/features/practice/utils/submissionHistory";

const REQUIRED_SELECTION = 2;

// SCR-01: danh sách bài nộp, lọc, chế độ chọn 2 bài để so sánh. Dữ liệu mẫu, chưa nối API.
export function useSubmissionHistory() {
  const navigate = useNavigate();

  const [filter, setFilter] = useState<SubmissionFilter>(EMPTY_SUBMISSION_FILTER);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showInvalid, setShowInvalid] = useState(false);

  const all = SUBMISSION_HISTORY_MOCK;
  const completedCount = all.filter((item) => item.status === "COMPLETED").length;
  const processingCount = all.length - completedCount;
  const visible = useMemo(() => filterSubmissions(all, filter), [all, filter]);
  const groups = useMemo(() => groupByDay(visible), [visible]);
  const activeFilterCount = countActiveFilters(filter);
  const quickFilterCount = countQuickFilters(filter);
  const advancedFilterCount = countAdvancedFilters(filter.advanced);
  const pieceOptions = useMemo(() => getPieceOptions(all), [all]);

  const summary =
    activeFilterCount > 0
      ? `${visible.length} trong ${all.length} bài nộp khớp bộ lọc`
      : `${completedCount} bài đã phân tích · ${processingCount} bài đang xử lý`;

  // GBR-15: chỉ cho so sánh khi có từ 2 bài đã phân tích xong
  const canCompare = completedCount >= REQUIRED_SELECTION;
  const isSelectionFull = selectedIds.length >= REQUIRED_SELECTION;

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
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((value) => value !== id);
      return current.length >= REQUIRED_SELECTION ? current : [...current, id];
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

  function openSubmission(item: SubmissionHistoryItem) {
    navigate(`/practice/submissions/${item.id}`);
  }

  function setPieceIds(pieceIds: string[]) {
    setFilter((current) => ({ ...current, pieceIds }));
  }

  // Bấm lại mốc đang chọn để bỏ chọn
  function setDatePreset(datePreset: SubmissionDatePreset | null) {
    setFilter((current) => ({ ...current, datePreset: current.datePreset === datePreset ? null : datePreset }));
  }

  function toggleAccuracyRange(range: SubmissionAccuracyRange) {
    setFilter((current) => ({
      ...current,
      accuracyRanges: current.accuracyRanges.includes(range)
        ? current.accuracyRanges.filter((value) => value !== range)
        : [...current.accuracyRanges, range],
    }));
  }

  // Số bài khớp nếu áp dụng bộ lọc nâng cao đang nhập (popup dùng để hiện số trên nút bấm)
  function countMatches(advanced: SubmissionAdvancedFilter) {
    return filterSubmissions(all, { ...filter, advanced }).length;
  }

  function applyAdvanced(advanced: SubmissionAdvancedFilter) {
    setFilter((current) => ({ ...current, advanced }));
    setIsAdvancedOpen(false);
  }

  function clearQuickFilter() {
    setFilter((current) => ({ ...current, pieceIds: [], datePreset: null, accuracyRanges: [] }));
  }

  function clearFilter() {
    setFilter(EMPTY_SUBMISSION_FILTER);
  }

  return {
    filter,
    pieceOptions,
    groups,
    quickFilterCount,
    advancedFilterCount,
    isAdvancedOpen,
    setIsAdvancedOpen,
    countMatches,
    applyAdvanced,
    clearQuickFilter,
    summary,
    totalCount: all.length,
    visibleCount: visible.length,
    activeFilterCount,
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
