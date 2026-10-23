export type PracticeSubmissionStatus = "PROCESSING" | "COMPLETED" | "REJECTED" | "FAILED";

// Bước xử lý AI đang chạy (JOB-01 → JOB-04, GBR-63)
export type PracticeSubmissionStage = "QUALITY_CHECK" | "AUDIO_ANALYSIS" | "COMPARISON" | "FEEDBACK";

export interface PracticeSubmission {
  id: string;
  pieceId: string;
  sheetMusicId: string | null;
  assignmentId: string | null;
  status: PracticeSubmissionStatus;
  stage: PracticeSubmissionStage | null;
  stageStartedAt: string | null;
  retryCount: number;
  maxRetries: number;
  retryAvailableAt: string | null;
  isFileDeleted: boolean;
  rejectReason: string | null;
  errorMessage: string | null;
  analyzedAt: string | null;
  submittedAt: string;
}

export interface CreatePracticeSubmissionInput {
  sheetMusicId: string;
  assignmentId?: string;
  studentUploadId: string;
}

export interface PracticeSubmitTarget {
  sheetMusicId: string;
  assignmentId?: string;
}
