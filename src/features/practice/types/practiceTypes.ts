export type RecordState = "idle" | "countin" | "recording" | "preview";

export type SubmitMode = "record" | "upload";

export type SubmissionStatus = "Đang xử lý" | "Từ chối" | "Lỗi xử lý" | "Hoàn tất";

export type FileErrorKind = "" | "format" | "size" | "duration";

export type BeatAccent = "strong" | "soft" | "off";

export type SubdivisionKey = "white" | "black" | "half" | "quarter";

export type StageState = "pending" | "active" | "done" | "fail";

export interface RecordingFile {
  name: string;
  fmt: string;
  mb: number;
  dur: number;
  source?: SubmitMode;
}

export interface NoteInfo {
  vn: string;
  en: string;
  f: number;
}

export interface StringInfo {
  code: string;
  vn: string;
  en: string;
  f: number;
  off: number;
}

export interface TimeSignature {
  label: string;
  beats: number;
}

export interface MappedNote {
  name: string;
  start: number;
  dur: number;
}

export interface DemoFlags {
  expired: boolean;
  micDenied: boolean;
  otherProc: boolean;
  noPitch: boolean;
  invalid: "none" | "format" | "size" | "duration";
  autoStop: boolean;
}
