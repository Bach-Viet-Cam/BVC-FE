import {
  type AssignmentMedia,
  type AssignmentStudent,
  type ClassPractice,
  type PracticeStats,
} from "@/features/classes/types/teacherAssignmentTypes";

export type ChallengeStatus = "DRAFT" | "PUBLISHED";
export type ChallengeDisplayStatus = "DRAFT" | "UPCOMING" | "ACTIVE" | "ENDED";

export interface ChallengeRef {
  id: string;
  name: string;
}

export interface ChallengePieceRef {
  id: string;
  title: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  status: ChallengeStatus;
  displayStatus: ChallengeDisplayStatus;
  instrument: ChallengeRef | null;
  piece: ChallengePieceRef | null;
  classes: ChallengeRef[];
  // Monday of the challenge week, yyyy-MM-dd.
  weekStart: string | null;
  startsAt: string | null;
  endsAt: string | null;
  minAccuracy: number | null;
  requiredBpm: number | null;
  maxSubmissions: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengePagination {
  page: number;
  limit: number;
  total: number;
}

export interface ChallengeListResult {
  items: Challenge[];
  pagination: ChallengePagination;
}

export interface ChallengeListParams {
  page: number;
  limit: number;
}

export interface ChallengePayload {
  title: string;
  description?: string | null;
  instrumentId?: string | null;
  pieceId?: string | null;
  classIds?: string[];
  weekStart?: string | null;
  minAccuracy?: number | null;
  requiredBpm?: number | null;
  maxSubmissions?: number;
}

export interface CreateChallengePayload extends ChallengePayload {
  publish: boolean;
}

// PATCH: a missing key keeps the stored value, null clears it.
export type UpdateChallengePayload = Partial<ChallengePayload>;

export interface ChallengePiece {
  id: string;
  title: string;
  composer: string | null;
  kind: string;
  bpm: number;
}

export interface ChallengePieceListResult {
  items: ChallengePiece[];
  pagination: ChallengePagination;
}

export interface ChallengePieceParams {
  instrumentId?: string;
  q?: string;
}

export interface ChallengeFormMeta {
  defaultMinAccuracy: number;
  maxSubmissionsDefault: number;
}

// A student of the challenge classes; one listed in several classes appears once, under the first by name.
export interface ChallengeStudent extends AssignmentStudent {
  classId: string;
  className: string;
}

export interface StudentChallenge extends Challenge {
  sheetMusicId: string | null;
  effectiveMinAccuracy: number;
  usedSubmissions: number;
  bestAccuracy: number | null;
  canPractice: boolean;
}

export interface StudentChallengeDetail extends StudentChallenge {
  // Chỉ có sau khi thử thách kết thúc
  rank: number | null;
  participants: number;
}

export interface StudentChallengeSubmission {
  id: string;
  attemptNumber: number;
  status: "PROCESSING" | "COMPLETED" | "REJECTED" | "FAILED";
  accuracy: number | null;
  submittedAt: string;
}

export interface StudentChallengeListResult {
  items: StudentChallenge[];
  pagination: ChallengePagination;
}

// Lecturer drawer: configuration plus progress of submissions counted toward the challenge.
export interface ChallengeDetail extends Challenge {
  // minAccuracy, or the admin default when the challenge has none.
  effectiveMinAccuracy: number;
  students: ChallengeStudent[];
  practiceStats: PracticeStats;
  byClass: ClassPractice[];
  media: AssignmentMedia | null;
}
