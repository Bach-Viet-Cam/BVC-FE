// Luyện tập lại đoạn lỗi (UC-03), khớp DTO của BE: /practice/submissions/:id/segments và /practice/segments/:id
import type { ResultFeedback, ResultIssue } from "@/features/practice/types/practiceResultTypes";
import type {
  PracticeSubmissionStage,
  PracticeSubmissionStatus,
} from "@/features/practice/types/practiceSubmissionTypes";

// Từng điểm có thể null khi đoạn không có nốt để chấm
export interface SegmentScores {
  overall: number | null;
  pitch: number | null;
  rhythm: number | null;
}

export interface SegmentAttempt {
  id: string;
  submissionId: string;
  startSec: number;
  endSec: number;
  status: PracticeSubmissionStatus;
  stage: PracticeSubmissionStage | null;
  createdAt: string;
  analyzedAt: string | null;
  scores: SegmentScores | null;
  issues: ResultIssue[];
  aiFeedback: ResultFeedback | null;
  error: { code: string | null; message: string | null } | null;
  comparison: {
    original: SegmentScores | null;
    previous: (SegmentScores & { attemptId: string }) | null;
  };
}

export interface SegmentSummary {
  id: string;
  startSec: number;
  endSec: number;
  status: PracticeSubmissionStatus;
  overall: number | null;
  baselineOverall: number | null;
  createdAt: string;
}

export interface SegmentPage {
  items: SegmentSummary[];
  nextCursor: string | null;
}

export interface CreateSegmentInput {
  startSec: number;
  endSec: number;
  studentUploadId: string;
}
