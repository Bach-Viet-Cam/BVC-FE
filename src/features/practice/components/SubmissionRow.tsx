import { ChevronRight } from "lucide-react";
import type { SubmissionHistoryItem, SubmissionKind } from "@/features/practice/types/submissionHistoryTypes";
import {
  FULL_PIECE_LABEL,
  SUBMISSION_KIND_LABEL,
  formatSubmittedAt,
} from "@/features/practice/utils/submissionHistory";
import { toStatusLabel } from "@/features/practice/utils/submissionStatus";
import { TABLE_STYLES } from "@/shared/components/bvc/tableStyles";
import { cn } from "@/shared/utils/cn";

interface SubmissionRowProps {
  item: SubmissionHistoryItem;
  isSelecting: boolean;
  isSelected: boolean;
  isSelectable: boolean;
  // Bị chặn chỉ vì khác bản nhạc với bài đã chọn: hiện gợi ý thay vì để dòng mờ không lời giải thích
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

const CELL = TABLE_STYLES.cell;

function scoreClass(accuracy: number) {
  if (accuracy >= 85) return "text-bvc-dot-ok";
  if (accuracy < 70) return "text-bvc-accent-text";
  return "text-bvc-muted";
}

// Một dòng của bảng ngày: độ chính xác, tên bài hát, ngày giờ nộp, loại bài, phạm vi (hiện luôn là cả bài).
// Cột cố định theo SubmissionDayTable nên các bảng của các ngày thẳng hàng với nhau.
export function SubmissionRow({
  item,
  isSelecting,
  isSelected,
  isSelectable,
  isDifferentSheet,
  onOpen,
  onToggle,
}: SubmissionRowProps) {
  const isProcessing = item.status === "PROCESSING";
  // Bị từ chối hoặc lỗi: chưa có accuracy, mở màn xử lý để xem lý do hoặc thử lại
  const isUnscored = item.status === "REJECTED" || item.status === "FAILED";
  const isOpenable = !isSelecting && !isProcessing;
  const isClickable = isSelecting ? isSelectable : isOpenable;

  function handleRowClick() {
    if (isSelecting && isSelectable) onToggle(item);
    else if (isOpenable) onOpen(item);
  }

  return (
    <tr
      onClick={handleRowClick}
      aria-selected={isSelecting ? isSelected : undefined}
      className={cn(
        "border-b border-bvc-border text-bvc-ink transition-colors last:border-b-0",
        isClickable && "cursor-pointer hover:bg-bvc-soft/70",
        (isProcessing || isSelected) && "bg-bvc-soft",
        isSelecting && !isSelectable && "cursor-not-allowed bg-bvc-soft opacity-55"
      )}
    >
      <td className={cn(CELL, "text-center font-bvc-mono text-sm font-semibold")}>
        {item.accuracy === null ? (
          <span className="text-bvc-faint">-</span>
        ) : (
          <span className={scoreClass(item.accuracy)}>{item.accuracy}%</span>
        )}
      </td>
      <td className={CELL}>
        {isOpenable ? (
          <button type="button" className="block w-full cursor-pointer truncate text-left text-sm font-medium">
            {item.pieceTitle}
          </button>
        ) : (
          <span className="block truncate text-sm font-medium">{item.pieceTitle}</span>
        )}
        {isProcessing && (
          <span className="mt-0.5 flex items-center gap-1 text-[11px] text-bvc-ink">
            <span className="size-[7px] rounded-full bg-bvc-gold" aria-hidden />
            Đang xử lý
          </span>
        )}
        {isSelecting && isDifferentSheet && (
          <span className="mt-0.5 block text-[11px] text-bvc-muted">Chỉ so sánh được bài cùng bản nhạc</span>
        )}
        {isUnscored && (
          <span className="mt-0.5 flex items-center gap-1 text-[11px] text-bvc-accent-text">
            <span className="size-[7px] rounded-full bg-bvc-accent" aria-hidden />
            {toStatusLabel(item.status)}
          </span>
        )}
      </td>
      <td className={cn(CELL, "text-xs whitespace-nowrap text-bvc-muted")}>{formatSubmittedAt(item.submittedAt)}</td>
      <td className={CELL}>
        <span
          className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", KIND_CLASS[item.kind])}
        >
          {SUBMISSION_KIND_LABEL[item.kind]}
        </span>
      </td>
      <td className={cn(CELL, "font-bvc-mono text-xs whitespace-nowrap text-bvc-muted")}>{FULL_PIECE_LABEL}</td>
      <td className={cn(CELL, "text-center")}>
        {isSelecting ? (
          <input
            type="checkbox"
            checked={isSelected}
            disabled={!isSelectable}
            onClick={(event) => event.stopPropagation()}
            onChange={() => onToggle(item)}
            aria-label={`Chọn ${item.pieceTitle} ${formatSubmittedAt(item.submittedAt)}`}
            className="size-5 cursor-[inherit] align-middle accent-bvc-ink"
          />
        ) : (
          isOpenable && <ChevronRight className="inline size-[18px] text-bvc-faint" strokeWidth={1.8} aria-hidden />
        )}
      </td>
    </tr>
  );
}
