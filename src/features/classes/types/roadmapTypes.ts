export type RoadmapWeekStatus = "PAST" | "CURRENT" | "UPCOMING";

export interface RoadmapExercise {
  pieceId: string;
  title: string;
  isAvailable: boolean;
}

export interface RoadmapWeek {
  weekNumber: number;
  title: string;
  content: string;
  exercises: RoadmapExercise[];
}

export interface RoadmapVersion {
  id: string | null;
  instrument: { id: string; name: string };
  version: number | null;
  isTemplate: boolean;
  createdAt: string | null;
  weeks: RoadmapWeek[];
}

export interface AdminRoadmapListItem {
  instrument: { id: string; name: string };
  latestVersion: { version: number; createdAt: string } | null;
}

export interface FingerExercise {
  id: string;
  title: string;
  defaultBpm: number | null;
}

export interface ClassRoadmapWeek extends RoadmapWeek {
  startDate: string;
  endDate: string;
  status: RoadmapWeekStatus;
}

export interface ClassRoadmap {
  roadmap: { id: string; version: number; weeks: ClassRoadmapWeek[] } | null;
}

export interface SaveRoadmapPayload {
  weeks: Array<{ weekNumber: number; title: string; content: string; exerciseIds: string[] }>;
  // Version being edited (null = standard framework); the server rejects a stale one with 409.
  baseVersion: number | null;
}
