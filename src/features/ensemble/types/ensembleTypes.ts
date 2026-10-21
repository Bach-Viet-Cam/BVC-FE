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

export type PracticeStatus = "ready" | "countIn" | "recording" | "saving" | "saved";
