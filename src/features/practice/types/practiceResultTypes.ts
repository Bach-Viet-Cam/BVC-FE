// Kết quả phân tích (M01), khớp DTO của BE: GET /practice/submissions/:id/{result,history,class-rank,pitch-chart}
import type { PracticeSubmissionStatus } from "@/features/practice/types/practiceSubmissionTypes";

export type ResultIssueKind = "pitch" | "rhythm";
export type RhythmIssueStatus = "fast" | "slow" | "missing";

export interface ResultIssue {
  id: string;
  kind: ResultIssueKind;
  startSec: number;
  endSec: number;
  rhythmStatus: RhythmIssueStatus | null;
  centsDifference: number | null;
  label: string;
}

export interface ResultScores {
  overall: number;
  pitch: number;
  rhythm: number;
  tempo: number | null;
}

export interface ResultFeedback {
  text: string;
  isFallback: boolean;
}

export interface QualityWarning {
  code: string;
  message: string;
}

export interface PracticeResult {
  submission: {
    id: string;
    status: PracticeSubmissionStatus;
    submittedAt: string;
    analyzedAt: string | null;
    attemptNo: number;
  };
  piece: { id: string; title: string };
  sheetMusic: { id: string; name: string } | null;
  assignment: { id: string; title: string; classId: string } | null;
  recording: { durationSec: number | null };
  scores: ResultScores | null;
  tempo: { teacherBpm: number | null; studentBpm: number | null; deviationPercent: number | null } | null;
  aiFeedback: ResultFeedback | null;
  issues: ResultIssue[];
  qualityWarnings: QualityWarning[];
  audio: { teacherUrl: string | null; studentUrl: string | null };
}

export interface ResultAttempt {
  submissionId: string;
  attemptNo: number;
  accuracyPercent: number;
  submittedAt: string;
  isCurrent: boolean;
}

export interface ResultHistory {
  pieceTitle: string;
  isFirstAttempt: boolean;
  deltaPercent: number | null;
  bestPercent: number;
  attempts: ResultAttempt[];
}

export interface ClassRank {
  className: string;
  peerCount: number;
  myScore: number;
  classAverage: number;
  betterThanPercent: number;
  topPercent: number;
  distribution: { score: number; count: number }[];
}

// [giây theo bản mẫu, Hz bản mẫu, Hz bản thu]; null = khoảng lặng
export type PitchPoint = [number, number | null, number | null];

export interface PitchSegment {
  id: string;
  kind: ResultIssueKind;
  startSec: number;
  endSec: number;
  label: string;
}

export interface PitchChart {
  durationSec: number;
  minHz: number;
  maxHz: number;
  points: PitchPoint[];
  segments: PitchSegment[];
  // Cặp [giây bản mẫu, giây bản thu] cùng một chỗ trong bài, để tua bản thu
  timeMap: [number, number][];
}
