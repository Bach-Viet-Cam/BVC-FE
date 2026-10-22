export type LeaderboardCategory = "overall" | "accuracy" | "improvement" | "streak" | "activity";

export interface LeaderboardSemester {
  name: string;
  label: string;
}

export interface LeaderboardRow {
  rank: number;
  studentId: string;
  fullName: string;
  className: string;
  value: number;
}

export type LeaderboardMe =
  | { status: "RANKED"; rank: number; value: number }
  | { status: "NO_ACTIVITY" }
  | { status: "NOT_IN_CATEGORY"; reason: "NO_DATA" | "NO_PREVIOUS_WEEK" };

export interface LeaderboardPagination {
  page: number;
  limit: number;
  total: number;
}

export interface LeaderboardResult {
  semester: LeaderboardSemester | null;
  generatedAt: string | null;
  totalRanked: number;
  categoryTotal: number;
  me: LeaderboardMe | null;
  top3: LeaderboardRow[];
  items: LeaderboardRow[];
  pagination: LeaderboardPagination;
}

export interface LeaderboardParams {
  category: LeaderboardCategory;
  page: number;
  limit: number;
  semester?: string;
}
