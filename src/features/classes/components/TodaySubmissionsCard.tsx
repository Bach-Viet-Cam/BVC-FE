import { TodaySubmissionRow } from "@/features/classes/components/TodaySubmissionRow";
import { type TodaySubmissions } from "@/features/classes/utils/teacherHomeFormat";

const TOP_COUNT = 5;

interface TodaySubmissionsCardProps {
  classes: TodaySubmissions[];
  onShowAll: () => void;
}

// Home "Lượt nộp bài mới": the classes with the most submitters today; the full list has its own page.
export function TodaySubmissionsCard({ classes, onShowAll }: TodaySubmissionsCardProps) {
  return (
    <section className="flex min-w-0 flex-col rounded-[20px] border border-bvc-border bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-bvc-border px-[20px] py-[14px]">
        <span className="flex items-center gap-[8px] text-[15px] font-extrabold tracking-[-0.025em]">
          Lượt nộp bài mới
          <span className="text-[12.5px] font-normal tracking-normal text-bvc-muted">Hôm nay</span>
        </span>
        <button
          type="button"
          onClick={onShowAll}
          className="flex min-h-[36px] cursor-pointer items-center rounded-[12px] border border-bvc-border-strong bg-white px-[14px] text-[13px] font-semibold text-bvc-ink"
        >
          Xem tất cả
        </button>
      </div>

      {classes.length === 0 ? (
        <p className="flex min-h-[52px] items-center px-[20px] text-[14px] text-bvc-muted">
          Chưa có lớp đang dạy để thống kê.
        </p>
      ) : (
        <ul className="m-0 list-none p-0">
          {classes.slice(0, TOP_COUNT).map((row) => (
            <TodaySubmissionRow key={row.classId} row={row} />
          ))}
        </ul>
      )}
    </section>
  );
}
