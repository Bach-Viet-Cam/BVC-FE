import type { SegmentAttempt } from "@/features/practice/types/practiceSegmentTypes";
import { formatScoreDelta } from "@/features/practice/utils/segmentFormat";

const scoreText = (score: number | null) => (score === null ? "-" : `${score}%`);

interface ComparisonLinesProps {
  attempt: SegmentAttempt;
}

// Dải so sánh của lượt luyện đoạn với bản gốc / lần trước; tự ẩn khi thiếu điểm để so
export function ComparisonLines({ attempt }: ComparisonLinesProps) {
  const current = attempt.scores?.overall ?? null;
  const original = attempt.comparison.original?.overall ?? null;
  const previous = attempt.comparison.previous?.overall ?? null;
  const originalDelta = formatScoreDelta(original, current);
  const previousDelta = formatScoreDelta(previous, current);
  if (originalDelta === null && previousDelta === null) return null;
  return (
    <ul className="flex flex-col gap-1 rounded-bvc-xl border border-bvc-border bg-white p-4 text-[13.5px] text-bvc-ink md:p-5.5">
      {originalDelta !== null && (
        <li>
          So với bản gốc: {scoreText(original)} → {scoreText(current)} ({originalDelta})
        </li>
      )}
      {previousDelta !== null && <li>So với lần trước: {previousDelta}</li>}
    </ul>
  );
}
