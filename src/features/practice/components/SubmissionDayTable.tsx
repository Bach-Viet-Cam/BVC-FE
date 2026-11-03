import { SubmissionRow } from "@/features/practice/components/SubmissionRow";
import type { SubmissionDayGroup, SubmissionHistoryItem } from "@/features/practice/types/submissionHistoryTypes";
import type { SelectionBlock } from "@/features/practice/utils/submissionHistory";
import { TABLE_STYLES } from "@/shared/components/bvc/tableStyles";
import { cn } from "@/shared/utils/cn";

interface SubmissionDayTableProps {
  group: SubmissionDayGroup;
  isSelecting: boolean;
  selectedIds: string[];
  selectionBlock: (item: SubmissionHistoryItem) => SelectionBlock | null;
  onOpen: (item: SubmissionHistoryItem) => void;
  onToggle: (item: SubmissionHistoryItem) => void;
}

const HEAD_CELL = TABLE_STYLES.headCell;

// Bảng bài nộp của một ngày. Độ rộng cột cố định (table-fixed) nên mọi bảng thẳng hàng cột với nhau;
// màn hẹp thì bảng cuộn ngang trong khung thay vì bóp chữ.
export function SubmissionDayTable({
  group,
  isSelecting,
  selectedIds,
  selectionBlock,
  onOpen,
  onToggle,
}: SubmissionDayTableProps) {
  return (
    <section className="flex shrink-0 flex-col gap-2">
      <h2 className="text-[13px] font-semibold text-bvc-muted">{group.label}</h2>
      <div className={TABLE_STYLES.frame}>
        <table className={cn(TABLE_STYLES.table, "min-w-[640px] table-fixed")}>
          <caption className="sr-only">Bài nộp {group.label}</caption>
          <colgroup>
            <col className="w-20" />
            <col className="w-84" />
            <col className="w-50" />
            <col className="w-50" />
            <col />
            <col className="w-14" />
          </colgroup>
          <thead>
            <tr className={TABLE_STYLES.headRow}>
              <th scope="col" className={cn(HEAD_CELL, "text-center")}>
                Accuracy
              </th>
              <th scope="col" className={HEAD_CELL}>
                Bài hát
              </th>
              <th scope="col" className={HEAD_CELL}>
                Ngày giờ nộp
              </th>
              <th scope="col" className={HEAD_CELL}>
                Loại bài
              </th>
              <th scope="col" className={HEAD_CELL}>
                Phạm vi
              </th>
              <th scope="col" className={HEAD_CELL}>
                <span className="sr-only">{isSelecting ? "Chọn" : "Mở"}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {group.items.map((item) => {
              const block = selectionBlock(item);
              return (
                <SubmissionRow
                  key={item.id}
                  item={item}
                  isSelecting={isSelecting}
                  isSelected={selectedIds.includes(item.id)}
                  isSelectable={block === null}
                  isDifferentSheet={block === "DIFFERENT_SHEET"}
                  onOpen={onOpen}
                  onToggle={onToggle}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
