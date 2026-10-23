export type AudioEvaluationStatus =
  | "publishing"
  | "published"
  | "publish_failed"
  | "publish_unknown"
  | "queued"
  | "processing"
  | "waiting"
  | "completed"
  | "failed"
  | "rejected";

export type AudioJobCode = "quality_check" | "audio_analysis" | "comparison" | "feedback";

export interface AudioUploadResult {
  fileId: string;
  url: string;
}
export interface AudioEvaluationInput {
  templateUrl: string;
  studentUrl: string;
}
export interface AudioEvaluation {
  evaluationId: string;
  status: AudioEvaluationStatus;
  stage?: AudioJobCode | null;
  attempt?: number;
  result: {
    overallScore: number;
    pitchAccuracyPercent: number;
    rhythmAccuracyPercent: number;
    aiFeedback: string;
  } | null;
  error: { code: string; message: string } | null;
}
