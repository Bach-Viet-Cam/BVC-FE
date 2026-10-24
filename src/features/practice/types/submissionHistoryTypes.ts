export type SubmissionHistoryStatus = "COMPLETED" | "PROCESSING" | "REJECTED" | "FAILED";

// Luyện tập tự do, bài bonus, bài tập độc tấu hoặc hòa tấu
export type SubmissionKind = "PRACTICE" | "BONUS" | "SOLO" | "ENSEMBLE";

// Một dòng của GET /practice/submissions. Chưa có phạm vi (đoạn): mọi bài hiện "Cả bài".
export interface SubmissionHistoryItem {
  id: string;
  // Bài hát được nộp; lịch sử gom bài nộp của mọi bài hát
  pieceId: string;
  pieceTitle: string;
  // Bản nhạc (sheet) đã nộp, dùng để luyện lại đoạn
  sheetMusicId: string | null;
  assignmentId: string | null;
  submittedAt: string;
  status: SubmissionHistoryStatus;
  // null khi chưa phân tích xong (đang xử lý, bị từ chối, lỗi)
  accuracy: number | null;
  kind: SubmissionKind;
}

// SCR-02 (mockup): bài nộp kèm nhãn "Tên bài #n" để hiện trên thẻ so sánh
export interface SubmissionCompareItem extends SubmissionHistoryItem {
  title: string;
}

// Số bài nộp của học viên theo trạng thái, không tính bộ lọc
export interface SubmissionHistoryOverall {
  total: number;
  completed: number;
  processing: number;
  rejected: number;
  failed: number;
}

export interface SubmissionHistoryPage {
  items: SubmissionHistoryItem[];
  pagination: { page: number; limit: number; total: number };
  overall: SubmissionHistoryOverall;
}

// Query của GET /practice/submissions; danh sách gửi dạng "a,b"
export interface SubmissionHistoryQuery {
  pieceIds?: string;
  fromDate?: string;
  toDate?: string;
  accuracyRanges?: string;
  minAccuracy?: number;
  maxAccuracy?: number;
  title?: string;
  kinds?: string;
  page: number;
  limit: number;
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
export interface SubmissionAdvancedFilter {
  title: string;
  fromDate: string;
  toDate: string;
  minAccuracy: string;
  maxAccuracy: string;
  kinds: SubmissionKind[];
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
