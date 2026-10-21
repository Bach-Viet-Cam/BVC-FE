export type MicState = "idle" | "granted" | "denied";

export interface ExpectedNote {
  midi: number;
  start: number;
  dur: number;
}

export interface PracticeSessionConfig {
  targetBpm: number;
  beatsPerBar: number;
  pieceLenSec: number;
  hasPitch: boolean;
  fminHz: number;
  fmaxHz: number;
  notes: ExpectedNote[];
}

export interface AnalysisFrame {
  samples: Float32Array; // cửa sổ phân tích, mẫu cũ → mới
  endTime: number; // giây (đồng hồ AudioContext) của mẫu cuối cửa sổ
  hopRms: number; // RMS của hop mới nhất
}

export type CaptureEndReason = "manual" | "pieceEnd";

export type CaptureMessage =
  { type: "pcm"; samples: Float32Array } | { type: "captureEnded"; reason: CaptureEndReason } | { type: "trackEnded" };

export type WorkletCommand =
  | { type: "analysis"; on: boolean }
  | { type: "startCapture"; startFrame: number; stopFrame: number }
  | { type: "stopCapture" }
  | { type: "cancelCapture" };

// Message worklet gửi về main thread (trackEnded do main tự phát, không đến từ worklet)
export type WorkletMessage = ({ type: "frame" } & AnalysisFrame) | Exclude<CaptureMessage, { type: "trackEnded" }>;

export interface CapturedTake {
  file: File;
  url: string; // object URL để nghe lại; phải revoke khi huỷ
  durationSec: number;
  peaks: number[]; // 0..1, dùng cho Waveform ở preview
}
