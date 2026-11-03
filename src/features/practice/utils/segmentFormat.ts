import type { PracticeSegment } from "@/features/practice/components/SegmentPickerSheet";

export interface SegmentQuery {
  start: number;
  end: number;
  countIn: boolean;
  attemptId: string | null;
}

const toSeconds = (raw: string | null): number | null => {
  if (raw === null || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
};

// Tham số URL của màn luyện đoạn; null khi thiếu, không phải số, start < 0 hoặc start >= end
export function parseSegmentQuery(params: URLSearchParams): SegmentQuery | null {
  const start = toSeconds(params.get("start"));
  const end = toSeconds(params.get("end"));
  if (start === null || end === null || start < 0 || start >= end) return null;
  return { start, end, countIn: params.get("countIn") === "1", attemptId: params.get("attemptId") };
}

const roundSeconds = (value: number) => Math.round(value * 100) / 100;

export function buildSegmentPath(submissionId: string, segment: PracticeSegment): string {
  const query = `start=${roundSeconds(segment.start)}&end=${roundSeconds(segment.end)}&countIn=${segment.countIn ? 1 : 0}`;
  return `/practice/submissions/${encodeURIComponent(submissionId)}/segment?${query}`;
}

// "+19", "−4", "0"; null khi thiếu một trong hai điểm
export function formatScoreDelta(from: number | null, to: number | null): string | null {
  if (from === null || to === null) return null;
  const delta = Math.round(to - from);
  if (delta === 0) return "0";
  return delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`;
}
