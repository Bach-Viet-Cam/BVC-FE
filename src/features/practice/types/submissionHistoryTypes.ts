export type SubmissionHistoryStatus = "COMPLETED" | "PROCESSING";

// Luyện tập tự do, bài bonus, bài tập độc tấu hoặc hòa tấu
export type SubmissionKind = "PRACTICE" | "BONUS" | "SOLO" | "ENSEMBLE";

// Đoạn đã luyện, tính bằng giây từ đầu bài
export interface SubmissionSegment {
  startSec: number;
  endSec: number;
}

export interface SubmissionHistoryItem {
  id: string;
  // Bài hát được nộp; lịch sử gom bài nộp của mọi bài hát
  pieceId: string;
  pieceTitle: string;
  // Bản nhạc (sheet) đã nộp, dùng để luyện lại đoạn
  sheetMusicId: string;
  title: string;
  submittedAt: string;
  status: SubmissionHistoryStatus;
  // null khi bài còn đang xử lý
  accuracy: number | null;
  kind: SubmissionKind;
  // null = nộp cả bài
  segment: SubmissionSegment | null;
}

export interface SubmissionDayGroup {
  key: string;
  label: string;
  items: SubmissionHistoryItem[];
}

// Bộ lọc nhanh: nhiều bài hát, một mốc ngày, nhiều khoảng accuracy (rỗng = không lọc)
export type SubmissionDatePreset = "TODAY" | "LAST_3_DAYS" | "LAST_7_DAYS" | "THIS_MONTH";

export type SubmissionAccuracyRange = "ABOVE_90" | "70_90" | "50_70" | "BELOW_50";

// Bộ lọc nâng cao (popup): ngày yyyy-MM-dd, accuracy chuỗi số 0-100; chuỗi rỗng = không lọc
// Phạm vi: cả bài hoặc một đoạn
export type SubmissionScope = "FULL" | "PART";

export interface SubmissionAdvancedFilter {
  title: string;
  fromDate: string;
  toDate: string;
  minAccuracy: string;
  maxAccuracy: string;
  kinds: SubmissionKind[];
  scopes: SubmissionScope[];
}

// Bộ lọc nhanh và bộ lọc nâng cao cùng áp dụng (AND)
export interface SubmissionFilter {
  pieceIds: string[];
  datePreset: SubmissionDatePreset | null;
  accuracyRanges: SubmissionAccuracyRange[];
  advanced: SubmissionAdvancedFilter;
}

export interface SubmissionPieceOption {
  id: string;
  title: string;
}

// GBR-18: chỉ có ở bài cũ = đã cải thiện; có ở cả hai = lỗi lặp lại; chỉ có ở bài mới = lỗi mới (không nhãn)
export type CompareSegmentStatus = "IMPROVED" | "REPEATED" | "NEW";

export interface CompareSegment {
  id: string;
  barLabel: string;
  status: CompareSegmentStatus;
}

export interface CompareChartBand {
  id: string;
  status: Exclude<CompareSegmentStatus, "NEW">;
  x: number;
  width: number;
}

export interface CompareChartTick {
  x: number;
  label: string;
}
