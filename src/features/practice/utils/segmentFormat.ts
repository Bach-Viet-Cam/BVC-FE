import type { PracticeSegment } from "@/features/practice/components/SegmentPickerSheet";

// Chế độ "đoạn" của màn Ghi âm: bản nộp gốc (`of`) và đoạn cần luyện, nằm trong query để F5 / Back không mất chế độ
export interface SegmentQuery {
  of: string;
  start: number;
  end: number;
  countIn: boolean;
}

const toSeconds = (raw: string | null): number | null => {
  if (raw === null || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
};

// Tham số URL của màn Ghi âm ở chế độ đoạn; null khi thiếu `of`, thiếu / không phải số, start < 0 hoặc start >= end
export function parseSegmentQuery(params: URLSearchParams): SegmentQuery | null {
  const of = params.get("of");
  const start = toSeconds(params.get("start"));
  const end = toSeconds(params.get("end"));
  if (!of || start === null || end === null || start < 0 || start >= end) return null;
  return { of, start, end, countIn: params.get("countIn") === "1" };
}

const roundSeconds = (value: number) => Math.round(value * 100) / 100;

// Màn Ghi âm ở chế độ đoạn: cùng URL với luyện cả bài, thêm of / start / end / countIn
export function buildSegmentRecordPath(sheetId: string, submissionId: string, segment: PracticeSegment): string {
  const query = `of=${encodeURIComponent(submissionId)}&start=${roundSeconds(segment.start)}&end=${roundSeconds(segment.end)}&countIn=${segment.countIn ? 1 : 0}`;
  return `/practice/sheets/${encodeURIComponent(sheetId)}/record?${query}`;
}

// Màn Chờ ở chế độ đoạn: :id là bản nộp gốc, attempt là lượt luyện đoạn
export function buildAttemptProcessingPath(submissionId: string, attemptId: string): string {
  return `/practice/submissions/${encodeURIComponent(submissionId)}/processing?attempt=${encodeURIComponent(attemptId)}`;
}

// Màn Kết quả ở chế độ đoạn
export function buildAttemptResultPath(submissionId: string, attemptId: string): string {
  return `/practice/submissions/${encodeURIComponent(submissionId)}?attempt=${encodeURIComponent(attemptId)}`;
}

// Mã lượt luyện đoạn trên màn Chờ / Kết quả; null khi không có (chế độ cả bài)
export function parseAttemptId(params: URLSearchParams): string | null {
  const attempt = params.get("attempt");
  return attempt ? attempt : null;
}

// "+19", "−4", "0"; null khi thiếu một trong hai điểm
export function formatScoreDelta(from: number | null, to: number | null): string | null {
  if (from === null || to === null) return null;
  const delta = Math.round(to - from);
  if (delta === 0) return "0";
  return delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`;
}
