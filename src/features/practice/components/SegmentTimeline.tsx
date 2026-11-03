import type { ResultIssue } from "@/features/practice/types/practiceResultTypes";
import { fmtTime } from "@/features/practice/utils/practiceFormat";

interface SegmentTimelineProps {
  durationSec: number;
  start: number;
  end: number;
  issues: ResultIssue[];
}

const percent = (seconds: number, durationSec: number) => `${Math.min(100, Math.max(0, (seconds / durationSec) * 100))}%`;

// Toàn bài trên một dải: đoạn đang luyện tô sáng, các lỗi gốc nằm trong đoạn được đánh dấu
export function SegmentTimeline({ durationSec, start, end, issues }: SegmentTimelineProps) {
  const total = Math.max(durationSec, end, 1);
  const inRange = issues.filter((issue) => issue.endSec > start && issue.startSec < end);

  return (
    <div className="flex flex-col gap-1.5" aria-label={`Đoạn luyện ${fmtTime(start)} đến ${fmtTime(end)}`}>
      <div className="relative h-3 overflow-hidden rounded-full bg-bvc-surface">
        <span
          className="absolute inset-y-0 rounded-full bg-bvc-ink/80"
          style={{ left: percent(start, total), width: `calc(${percent(end, total)} - ${percent(start, total)})` }}
        />
        {inRange.map((issue) => (
          <span
            key={issue.id}
            className="absolute inset-y-0 w-0.75 bg-bvc-warn"
            style={{ left: percent(Math.max(issue.startSec, start), total) }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[12px] text-bvc-muted">
        <span>00:00</span>
        <span>{fmtTime(total)}</span>
      </div>
    </div>
  );
}
