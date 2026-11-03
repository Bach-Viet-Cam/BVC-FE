import type {
  CompareSegment,
  CompareSegmentBand,
  SubmissionCompare,
} from "@/features/practice/types/submissionHistoryTypes";
import { buildSeriesPath } from "@/features/practice/utils/resultFormat";

function formatMinutes(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

// "0:12 – 0:18"
export function formatSegmentRange(startSec: number, endSec: number): string {
  return `${formatMinutes(startSec)} – ${formatMinutes(endSec)}`;
}

// "Lệch +35¢ → Lệch +20¢"; chỉ một bên có nhãn thì hiện nhãn đó
export function formatLabelChange(olderLabel: string | null, newerLabel: string | null): string | null {
  if (olderLabel && newerLabel) return `${olderLabel} → ${newerLabel}`;
  return olderLabel ?? newerLabel;
}

// Đường bản mẫu, bài cũ, bài mới; đường nào toàn null thì là chuỗi rỗng (không vẽ)
export function toCompareChartPaths(
  chart: SubmissionCompare["chart"],
  xAt: (seconds: number) => number,
  yAt: (hz: number) => number
): { teacher: string; older: string; newer: string } {
  const times = chart.points.map((point) => point[0]);
  const pathOf = (column: 1 | 2 | 3) =>
    buildSeriesPath(
      times,
      chart.points.map((point) => point[column]),
      xAt,
      yAt
    );
  return { teacher: pathOf(1), older: pathOf(2), newer: pathOf(3) };
}

// Dải nền trên biểu đồ; đoạn chỉ có ở bài mới (NEW) không tô
export function toSegmentBands(segments: CompareSegment[], xAt: (seconds: number) => number): CompareSegmentBand[] {
  return segments.flatMap((segment) => {
    if (segment.status === "NEW") return [];
    const x = xAt(segment.startSec);
    return [{ id: segment.id, status: segment.status, x, width: xAt(segment.endSec) - x }];
  });
}
