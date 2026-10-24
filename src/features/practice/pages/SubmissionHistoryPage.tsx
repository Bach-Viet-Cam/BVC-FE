import { Search, SlidersHorizontal } from "lucide-react";
import { SubmissionPageTitle } from "@/features/practice/components/SubmissionPageTitle";
import { SubmissionFilterBar } from "@/features/practice/components/SubmissionFilterBar";
import { SubmissionFilterSheet } from "@/features/practice/components/SubmissionFilterSheet";
import { SubmissionDayTable } from "@/features/practice/components/SubmissionDayTable";
import { MSG_25 } from "@/features/practice/constants/submissionHistoryMockData";
import { useSubmissionHistory } from "@/features/practice/hooks/useSubmissionHistory";
import { cn } from "@/shared/utils/cn";
import { StudentShell } from "@/shared/components/bvc/StudentShell";

// SCR-01 Lịch sử bài nộp (UC 1.4): GET /practice/submissions, lọc phía BE, tải thêm theo trang.
// Gồm chế độ xem, chế độ chọn 2 bài (MSG-25 khi chọn chưa đủ), lọc nâng cao (popup), kết quả lọc và trạng thái rỗng.
export function SubmissionHistoryPage() {
  const history = useSubmissionHistory();
  const {
    filter,
    pieceOptions,
    groups,
    summary,
    totalCount,
    visibleCount,
    activeFilterCount,
    quickFilterCount,
    advancedFilterCount,
    isAdvancedOpen,
    setIsAdvancedOpen,
    applyAdvanced,
    clearQuickFilter,
    isFirstLoad,
    isLoading,
    error,
    hasMore,
    isSelecting,
    selectedIds,
    showInvalid,
  } = history;
  const isEmpty = !isLoading && !error && visibleCount === 0;
  // Chưa nộp bài nào: khác với lọc không ra kết quả
  const isNeverSubmitted = isEmpty && activeFilterCount === 0;

  return (
    <StudentShell>
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-3.5 px-[18px] pt-5 pb-6 md:gap-4 md:px-14 md:pt-8">
        <SubmissionPageTitle
          title="Bài nộp"
          subtitle={`Tất cả bài hát · ${totalCount} bài nộp`}
          rightSlot={
            isSelecting ? (
              <button
                type="button"
                onClick={history.cancelSelecting}
                className="flex min-h-11 shrink-0 cursor-pointer items-center px-3 text-[15px] font-bold text-bvc-ink"
              >
                Hủy
              </button>
            ) : undefined
          }
        />

        <p className="shrink-0 text-[12.5px] text-bvc-muted">{isFirstLoad ? "Đang tải bài nộp..." : summary}</p>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <SubmissionFilterBar
            filter={filter}
            pieceOptions={pieceOptions}
            activeFilterCount={quickFilterCount}
            onPieceIds={history.setPieceIds}
            onDatePreset={history.setDatePreset}
            onToggleAccuracyRange={history.toggleAccuracyRange}
            onClear={clearQuickFilter}
          />
          <button
            type="button"
            aria-label={
              advancedFilterCount > 0 ? `Lọc nâng cao, đang áp dụng ${advancedFilterCount} bộ lọc` : "Lọc nâng cao"
            }
            onClick={() => setIsAdvancedOpen(true)}
            className={cn(
              "flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border pr-2.5 pl-3 text-[13.5px]",
              advancedFilterCount > 0
                ? "border-bvc-accent bg-bvc-accent-tint font-bold text-bvc-accent-text"
                : "border-bvc-border-strong bg-white font-semibold text-bvc-ink"
            )}
          >
            <SlidersHorizontal className="size-4 shrink-0" strokeWidth={2} aria-hidden />
            Lọc nâng cao
            {advancedFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-bvc-ink px-1.5 font-bvc-mono text-[11.5px] font-semibold text-white">
                {advancedFilterCount}
              </span>
            )}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="flex flex-col items-center gap-3 rounded-[20px] border border-bvc-border bg-white px-5 py-7 text-center"
          >
            <p className="text-[15px] font-bold text-bvc-ink">{error}</p>
            <button
              type="button"
              onClick={history.reload}
              className="flex min-h-11 cursor-pointer items-center justify-center rounded-[14px] border border-bvc-border-strong bg-bvc-soft px-[18px] text-sm font-semibold text-bvc-ink"
            >
              Thử lại
            </button>
          </div>
        )}

        {isEmpty ? (
          <div className="flex flex-col items-center gap-3 rounded-[20px] border border-bvc-border bg-white px-5 py-7 text-center">
            <span className="flex size-11 items-center justify-center rounded-bvc-md bg-bvc-soft text-bvc-muted">
              <Search className="size-[21px]" strokeWidth={1.7} aria-hidden />
            </span>
            {isNeverSubmitted ? (
              <>
                <p className="text-[15px] font-bold text-bvc-ink">Chưa có bài nộp nào</p>
                <p className="text-[13px] leading-normal text-bvc-muted">
                  Bài bạn nộp khi luyện tập sẽ hiện ở đây.
                </p>
              </>
            ) : (
              <>
                <p className="text-[15px] font-bold text-bvc-ink">Không có bài nộp nào khớp</p>
                <p className="text-[13px] leading-normal text-bvc-muted">
                  Thử mở rộng khoảng ngày hoặc hạ mức accuracy.
                </p>
                <button
                  type="button"
                  onClick={history.clearFilter}
                  className="flex min-h-11 cursor-pointer items-center justify-center rounded-[14px] border border-bvc-border-strong bg-bvc-soft px-[18px] text-sm font-semibold text-bvc-ink"
                >
                  Xóa bộ lọc
                </button>
              </>
            )}
          </div>
        ) : (
          groups.map((group) => (
            <SubmissionDayTable
              key={group.key}
              group={group}
              isSelecting={isSelecting}
              selectedIds={selectedIds}
              isSelectable={history.isSelectable}
              onOpen={history.openSubmission}
              onToggle={history.toggleSelected}
            />
          ))
        )}

        {hasMore && (
          <button
            type="button"
            onClick={history.loadMore}
            className="flex min-h-11 shrink-0 cursor-pointer items-center justify-center self-center rounded-[14px] border border-bvc-border-strong bg-white px-[18px] text-sm font-semibold text-bvc-ink"
          >
            Xem thêm
          </button>
        )}
        {isLoading && !isFirstLoad && (
          <p className="shrink-0 text-center text-[12.5px] text-bvc-muted" aria-live="polite">
            Đang tải...
          </p>
        )}
      </div>

      {(isSelecting || history.canCompare) && (
        <div className="sticky bottom-0 z-10 border-t border-bvc-border-strong bg-white">
          <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2.5 px-[18px] pt-3.5 pb-6 md:flex-row md:items-center md:gap-6 md:px-14 md:py-4">
            {isSelecting && (
              <div className="flex flex-col gap-2 md:flex-1 md:flex-row md:items-center md:gap-4">
                <p className="text-sm font-semibold text-bvc-ink">
                  Đã chọn <span className="font-bvc-mono font-bold">{selectedIds.length}/2</span>
                </p>
                {showInvalid && (
                  <div
                    role="alert"
                    className="rounded-bvc-md border border-bvc-accent-border bg-bvc-accent-tint px-3 py-2.5 text-[13px] leading-normal text-bvc-accent-text"
                  >
                    {MSG_25}
                  </div>
                )}
              </div>
            )}
            {isSelecting ? (
              <button
                type="button"
                onClick={history.submitCompare}
                className="flex min-h-[50px] w-full cursor-pointer items-center justify-center rounded-2xl bg-bvc-ink text-[15px] font-bold text-white md:ml-auto md:w-auto md:min-w-64 md:px-8"
              >
                Xem so sánh
              </button>
            ) : (
              <button
                type="button"
                onClick={history.startSelecting}
                className="flex min-h-[50px] w-full cursor-pointer items-center justify-center rounded-2xl border border-bvc-border-strong bg-bvc-soft text-[15px] font-semibold text-bvc-ink md:ml-auto md:w-auto md:min-w-64 md:px-8"
              >
                So sánh
              </button>
            )}
          </div>
        </div>
      )}
      <SubmissionFilterSheet
        open={isAdvancedOpen}
        advanced={filter.advanced}
        onOpenChange={setIsAdvancedOpen}
        onApply={applyAdvanced}
      />
    </StudentShell>
  );
}
