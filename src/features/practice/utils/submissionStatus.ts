import { STAGE_LABELS } from "@/features/practice/constants/practiceConstants";
import type { SubmissionStatus } from "@/features/practice/types/practiceTypes";
import type {
  PracticeSubmission,
  PracticeSubmissionStage,
  PracticeSubmissionStatus,
} from "@/features/practice/types/practiceSubmissionTypes";

const STATUS_LABELS: Record<PracticeSubmissionStatus, SubmissionStatus> = {
  PROCESSING: "Đang xử lý",
  COMPLETED: "Hoàn tất",
  REJECTED: "Từ chối",
  FAILED: "Lỗi xử lý",
};

const STAGE_ORDER: PracticeSubmissionStage[] = ["QUALITY_CHECK", "AUDIO_ANALYSIS", "COMPARISON", "FEEDBACK"];

export function toStatusLabel(status: PracticeSubmissionStatus): SubmissionStatus {
  return STATUS_LABELS[status];
}

// Vị trí bước cho StageTracker; "Hoàn tất" đánh dấu cả bốn bước đã xong
export function toStageIndex(submission: Pick<PracticeSubmission, "status" | "stage">): number {
  if (submission.status === "COMPLETED") return STAGE_LABELS.length;
  return Math.max(0, STAGE_ORDER.indexOf(submission.stage ?? "QUALITY_CHECK"));
}

export function isFinalStatus(status: PracticeSubmissionStatus): boolean {
  return status !== "PROCESSING";
}

// GBR-59: hết lượt thử lại thì file đã bị xóa khỏi máy chủ (GBR-62)
export function isRetryExhausted(submission: PracticeSubmission): boolean {
  return submission.status === "FAILED" && (submission.isFileDeleted || submission.retryCount >= submission.maxRetries);
}

export function secondsUntil(iso: string | null, now: number): number {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 1000));
}
