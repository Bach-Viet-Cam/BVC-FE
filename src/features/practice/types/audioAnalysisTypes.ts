export type AudioEvaluationStatus =
  "publishing" | "published" | "publish_failed" | "publish_unknown" | "queued" | "processing" | "completed" | "failed";

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
  result: {
    overallScore: number;
    pitchAccuracyPercent: number;
    rhythmAccuracyPercent: number;
    aiFeedback: string;
  } | null;
  error: { code: string; message: string } | null;
}
