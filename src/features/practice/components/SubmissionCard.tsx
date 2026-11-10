import { ChevronRight } from "lucide-react";
import type { SubmissionHistoryItem, SubmissionKind } from "@/features/practice/types/submissionHistoryTypes";
import { SUBMISSION_KIND_LABEL, formatSubmittedAt } from "@/features/practice/utils/submissionHistory";
import { toStatusLabel } from "@/features/practice/utils/submissionStatus";
import { cn } from "@/shared/utils/cn";

interface SubmissionCardProps {
  item: SubmissionHistoryItem;
  isSelecting: boolean;
  isSelected: boolean;
  isSelectable: boolean;
  isDifferentSheet: boolean;
  onOpen: (item: SubmissionHistoryItem) => void;
  onToggle: (item: SubmissionHistoryItem) => void;
}

const KIND_CLASS: Record<SubmissionKind, string> = {
  PRACTICE: "bg-bvc-surface text-bvc-muted",
  SOLO: "bg-bvc-soft text-bvc-ink",
  ENSEMBLE: "bg-bvc-soft text-bvc-accent",
  BONUS: "bg-bvc-accent-tint text-bvc-accent-text",
};

function scoreClass(accuracy: number) {
  if (accuracy >= 85) return "text-bvc-dot-ok";
  if (accuracy < 70) return "text-bvc-accent-text";
  return "text-bvc-muted";
}

// Một bài nộp dạng thẻ cho màn hẹp (thay cho dòng của bảng, vốn cần ít nhất 640px)
export function SubmissionCard({
  item,
  isSelecting,
  isSelected,
  isSelectable,
  isDifferentSheet,
  onOpen,
  onToggle,
}: SubmissionCardProps) {
  const isProcessing = item.status === "PROCESSING";
  const isUnscored = item.status === "REJECTED" || item.status === "FAILED";
  const isOpenable = !isSelecting && !isProcessing;
  const isClickable = isSelecting ? isSelectable : isOpenable;

  function handleClick() {
    if (isSelecting && isSelectable) onToggle(item);
    else if (isOpenable) onOpen(item);
  }

  return (
    <li
      onClick={handleClick}
      aria-selected={isSelecting ? isSelected : undefined}
      className={cn(
        "flex min-w-0 items-center gap-3 border-b border-bvc-border px-3.5 py-3 text-bvc-ink last:border-b-0",
        isClickable && "cursor-pointer active:bg-bvc-soft/70",
        (isProcessing || isSelected) && "bg-bvc-soft",
        isSelecting && !isSelectable && "cursor-not-allowed bg-bvc-soft opacity-55"
      )}
    >
      <div className="w-14 shrink-0 text-center font-bvc-mono text-sm font-semibold">
        {item.accuracy === null ? (
          <span className="text-bvc-faint">-</span>
        ) : (
          <span className={scoreClass(item.accuracy)}>{item.accuracy}%</span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm font-medium">{item.pieceTitle}</span>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-bvc-muted">
          <span>{formatSubmittedAt(item.submittedAt)}</span>
          <span
            className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", KIND_CLASS[item.kind])}
          >
            {SUBMISSION_KIND_LABEL[item.kind]}
          </span>
        </div>
        {isProcessing && (
          <span className="flex items-center gap-1 text-[11px] text-bvc-ink">
            <span className="size-[7px] rounded-full bg-bvc-gold" aria-hidden />
            Đang xử lý
          </span>
        )}
        {isUnscored && (
          <span className="flex items-center gap-1 text-[11px] text-bvc-accent-text">
            <span className="size-[7px] rounded-full bg-bvc-accent" aria-hidden />
            {toStatusLabel(item.status)}
          </span>
        )}
        {isSelecting && isDifferentSheet && (
          <span className="text-[11px] text-bvc-muted">Chỉ so sánh được bài cùng bản nhạc</span>
        )}
      </div>

      <div className="flex w-6 shrink-0 justify-center">
        {isSelecting ? (
          <input
            type="checkbox"
            checked={isSelected}
            disabled={!isSelectable}
            onClick={(event) => event.stopPropagation()}
            onChange={() => onToggle(item)}
            aria-label={`Chọn ${item.pieceTitle} ${formatSubmittedAt(item.submittedAt)}`}
            className="size-5 cursor-[inherit] accent-bvc-ink"
          />
        ) : (
          isOpenable && <ChevronRight className="size-[18px] text-bvc-faint" strokeWidth={1.8} aria-hidden />
        )}
      </div>
    </li>
  );
}
