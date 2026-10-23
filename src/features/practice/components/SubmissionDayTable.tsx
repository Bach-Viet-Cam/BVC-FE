import { SubmissionRow } from "@/features/practice/components/SubmissionRow";
import type { SubmissionDayGroup, SubmissionHistoryItem } from "@/features/practice/types/submissionHistoryTypes";

interface SubmissionDayTableProps {
  group: SubmissionDayGroup;
  isSelecting: boolean;
  selectedIds: string[];
  isSelectable: (item: SubmissionHistoryItem) => boolean;
  onOpen: (item: SubmissionHistoryItem) => void;
  onToggle: (id: string) => void;
}

const HEAD_CELL = "px-3 py-2 text-left text-[11.5px] font-semibold text-bvc-muted";

// Bảng bài nộp của một ngày. Độ rộng cột cố định (table-fixed) nên mọi bảng thẳng hàng cột với nhau;
// màn hẹp thì bảng cuộn ngang trong khung thay vì bóp chữ.
export function SubmissionDayTable({
  group,
  isSelecting,
  selectedIds,
  isSelectable,
  onOpen,
  onToggle,
}: SubmissionDayTableProps) {
  return (
    <section className="flex shrink-0 flex-col gap-2">
      <h2 className="text-[13px] font-bold text-bvc-muted">{group.label}</h2>
      <div className="overflow-x-auto rounded-bvc-lg border border-bvc-border bg-white">
        <table className="w-full min-w-[640px] table-fixed border-collapse">
          <caption className="sr-only">Bài nộp {group.label}</caption>
          <colgroup>
            <col className="w-20" />
            <col className="w-84" />
            <col className="w-50" />
            <col className="w-50" />
            <col />
            <col className="w-14" />
          </colgroup>
          <thead className="bg-bvc-soft">
            <tr>
              <th scope="col" className={`${HEAD_CELL} text-center`}>
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
            {group.items.map((item) => (
              <SubmissionRow
                key={item.id}
                item={item}
                isSelecting={isSelecting}
                isSelected={selectedIds.includes(item.id)}
                isSelectable={isSelectable(item)}
                onOpen={onOpen}
                onToggle={onToggle}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
