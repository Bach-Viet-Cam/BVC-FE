export interface EnsembleTrack {
  id: string;
  instrumentId: string;
  instrumentName: string;
  fileUrl: string;
  durationSec: number;
  offsetMs: number;
  defaultVolume: number;
}

export interface EnsembleTracksResult {
  pieceId: string;
  pieceTitle: string;
  targetBpm: number;
  myInstrumentId: string;
  myInstrumentName: string;
  mySheetMusicId: string | null;
  isAssignmentCounted: boolean;
  tracks: EnsembleTrack[];
}

export interface TrackSetting {
  trackId: string;
  volume: number;
  isMuted: boolean;
  isSolo: boolean;
}

export type EnsembleSubmissionStatus = "PROCESSING" | "COMPLETED" | "REJECTED" | "FAILED";
export type EnsembleSubmissionStage = "QUALITY_CHECK" | "AUDIO_ANALYSIS" | "COMPARISON" | "FEEDBACK";

export interface EnsembleSubmission {
  id: string;
  assignmentId: string | null;
  status: EnsembleSubmissionStatus;
  stage: EnsembleSubmissionStage | null;
  retryCount: number;
  maxRetries: number;
  retryAvailableAt: string | null;
  isFileDeleted: boolean;
  rejectReason: string | null;
  errorMessage: string | null;
}

export interface EnsembleSessionDetail {
  id: string;
  pieceId: string;
  instrumentId: string;
  assignmentId: string | null;
  targetBpm: number;
  status: "RECORDING" | "COMPLETED" | "FAILED";
  recordingUrl: string | null;
  createdAt: string;
}

export type PracticeStatus = "ready" | "countIn" | "recording" | "processing" | "preview" | "saving" | "saved";

export interface EnsembleTake {
  blob: Blob;
  url: string;
  peaks: number[];
  durationSec: number;
}

export interface SeatPosition {
  x: number;
  y: number;
}

export interface EnsembleAssignmentInfo {
  id: string;
  title: string;
  className: string;
  deadline: string;
  canSubmit: boolean;
  usedSubmissions: number;
  maxSubmissions: number;
}

export type ListeningMode = "headphones" | "speaker";
export type MicPermission = "pending" | "granted" | "denied";
