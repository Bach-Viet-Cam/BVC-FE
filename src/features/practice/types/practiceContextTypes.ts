// OPEN: lần luyện này tính vào bài tập. ENDED: quá hạn, lớp đã kết thúc hoặc bài tập đã đóng. EXHAUSTED: hết lượt nộp
export type PracticeAssignmentState = "OPEN" | "ENDED" | "EXHAUSTED";

export interface PracticeContextAssignment {
  id: string;
  title: string;
  description: string;
  deadline: string;
  maxSubmissions: number;
  usedSubmissions: number;
  remainingSubmissions: number;
  targetBpm: number | null;
  state: PracticeAssignmentState;
  countsTowardAssignment: boolean;
}

export interface PracticeContext {
  piece: { id: string; title: string };
  sheet: {
    id: string;
    name: string;
    isMain: boolean;
    durationSec: number | null;
    instrument: { id: string; name: string };
    level: { id: string; name: string };
    practice: { isAvailable: boolean; reason: string | null };
    // Bản thu mẫu để nghe trước khi ghi; isFallback: bản nhạc không có bản thu riêng nên dùng của bản chính
    referenceAudio: { url: string; isFallback: boolean } | null;
  };
  enrollment: "NO_CLASS" | "IN_CLASS";
  classRecord: { id: string; name: string } | null;
  assignment: PracticeContextAssignment | null;
}

export interface PracticeContextQuery {
  sheetMusicId: string;
  assignmentId?: string;
}
