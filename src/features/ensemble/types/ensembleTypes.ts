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
  tracks: EnsembleTrack[];
}

export interface TrackSetting {
  trackId: string;
  volume: number;
  isMuted: boolean;
  isSolo: boolean;
}

export interface EnsembleSessionResult {
  id: string;
  status: "RECORDING" | "COMPLETED" | "FAILED";
  recordingUrl: string | null;
}

export type PracticeStatus = "ready" | "countIn" | "recording" | "processing" | "preview" | "saving" | "saved";

/** Bản thu tạm sau khi dừng: đã đổi sang WAV, chờ người học nghe lại rồi bấm lưu. */
export interface EnsembleTake {
  blob: Blob;
  url: string;
  peaks: number[];
  durationSec: number;
}

/** Vị trí tâm ghế trên sân khấu, tính theo % chiều rộng (x) và chiều cao (y). */
export interface SeatPosition {
  x: number;
  y: number;
}

/** Phần thông tin bài tập màn hòa tấu cần; `GET /assignments/:id` trả nhiều trường hơn. */
export interface EnsembleAssignmentInfo {
  id: string;
  title: string;
  className: string;
  deadline: string;
}

export type ListeningMode = "headphones" | "speaker";
export type MicPermission = "pending" | "granted" | "denied";
