import { ChevronRight } from "lucide-react";
import type { SubmissionHistoryItem, SubmissionKind } from "@/features/practice/types/submissionHistoryTypes";
import { SUBMISSION_KIND_LABEL, formatSegment, formatSubmittedAt } from "@/features/practice/utils/submissionHistory";
import { cn } from "@/shared/utils/cn";

interface SubmissionRowProps {
  item: SubmissionHistoryItem;
  isSelecting: boolean;
  isSelected: boolean;
  isSelectable: boolean;
  onOpen: (item: SubmissionHistoryItem) => void;
  onToggle: (id: string) => void;
}

const KIND_CLASS: Record<SubmissionKind, string> = {
  PRACTICE: "bg-bvc-surface text-bvc-muted",
  SOLO: "bg-bvc-soft text-bvc-ink",
  ENSEMBLE: "bg-bvc-soft text-bvc-accent",
  BONUS: "bg-bvc-accent-tint text-bvc-accent-text",
};

const CELL = "px-3 py-2.5 align-middle";

function scoreClass(accuracy: number) {
  if (accuracy >= 85) return "text-bvc-dot-ok";
  if (accuracy < 70) return "text-bvc-accent-text";
  return "text-bvc-muted";
}

// Một dòng của bảng ngày: độ chính xác, tên bài hát, ngày giờ nộp, loại bài, cả bài hay đoạn nào.
// Cột cố định theo SubmissionDayTable nên các bảng của các ngày thẳng hàng với nhau.
export function SubmissionRow({ item, isSelecting, isSelected, isSelectable, onOpen, onToggle }: SubmissionRowProps) {
  const isProcessing = item.status === "PROCESSING";
  const isOpenable = !isSelecting && !isProcessing;
  const isClickable = isSelecting ? isSelectable : isOpenable;

  function handleRowClick() {
    if (isSelecting && isSelectable) onToggle(item.id);
    else if (isOpenable) onOpen(item);
  }

  return (
    <tr
      onClick={handleRowClick}
      aria-selected={isSelecting ? isSelected : undefined}
      className={cn(
        "border-t border-bvc-border text-bvc-ink first:border-t-0",
        isClickable && "cursor-pointer hover:bg-bvc-soft",
        (isProcessing || isSelected) && "bg-bvc-soft",
        isSelecting && !isSelectable && "cursor-not-allowed bg-bvc-soft opacity-55"
      )}
    >
      <td className={cn(CELL, "text-center font-bvc-mono text-sm font-bold")}>
        {item.accuracy === null ? (
          <span className="text-bvc-faint">-</span>
        ) : (
          <span className={scoreClass(item.accuracy)}>{item.accuracy}%</span>
        )}
      </td>
      <td className={CELL}>
        {isOpenable ? (
          <button type="button" className="block w-full cursor-pointer truncate text-left text-sm font-semibold">
            {item.pieceTitle}
          </button>
        ) : (
          <span className="block truncate text-sm font-semibold">{item.pieceTitle}</span>
        )}
        {isProcessing && (
          <span className="mt-0.5 flex items-center gap-1 text-[11px] text-bvc-ink">
            <span className="size-[7px] rounded-full bg-bvc-gold" aria-hidden />
            Đang xử lý
          </span>
        )}
      </td>
      <td className={cn(CELL, "text-xs whitespace-nowrap text-bvc-muted")}>{formatSubmittedAt(item.submittedAt)}</td>
      <td className={CELL}>
        <span
          className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap", KIND_CLASS[item.kind])}
        >
          {SUBMISSION_KIND_LABEL[item.kind]}
        </span>
      </td>
      <td className={cn(CELL, "font-bvc-mono text-xs whitespace-nowrap text-bvc-muted")}>
        {formatSegment(item.segment)}
      </td>
      <td className={cn(CELL, "text-center")}>
        {isSelecting ? (
          <input
            type="checkbox"
            checked={isSelected}
            disabled={!isSelectable}
            onClick={(event) => event.stopPropagation()}
            onChange={() => onToggle(item.id)}
            aria-label={`Chọn ${item.title}`}
            className="size-5 cursor-[inherit] align-middle accent-bvc-ink"
          />
        ) : (
          isOpenable && <ChevronRight className="inline size-[18px] text-bvc-faint" strokeWidth={1.8} aria-hidden />
        )}
      </td>
    </tr>
  );
}
