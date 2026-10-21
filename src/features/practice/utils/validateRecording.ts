import type { CapturedTake } from "@/features/practice/types/practiceAudioTypes";
import {
  FILE_FORMATS,
  FILE_MAX_MB,
  FILE_MAX_S,
  FILE_MIN_S,
  MSG,
} from "@/features/practice/constants/practiceConstants";
import type { FileErrorKind, RecordingFile } from "@/features/practice/types/practiceTypes";

export function validateFile(file: RecordingFile): FileErrorKind {
  if (!FILE_FORMATS.includes(file.fmt)) return "format"; // MSG-13
  if (file.mb > FILE_MAX_MB) return "size"; // MSG-14
  if (file.dur < FILE_MIN_S || file.dur > FILE_MAX_S) return "duration"; // MSG-15
  return "";
}

export function fileErrorMessage(kind: FileErrorKind): string {
  if (kind === "format") return MSG.format;
  if (kind === "size") return MSG.size;
  if (kind === "duration") return MSG.duration;
  return "";
}

export function takeToRecordingFile(take: CapturedTake): RecordingFile {
  return {
    name: take.file.name,
    fmt: "wav",
    mb: take.file.size / (1024 * 1024),
    dur: take.durationSec,
    source: "record",
  };
}
