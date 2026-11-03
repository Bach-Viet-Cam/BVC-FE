import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import { type ClassSummary } from "@/features/classes/types/classTypes";
import {
  countTodaySubmitters,
  rankTodaySubmissions,
  type TodaySubmissions,
} from "@/features/classes/utils/teacherHomeFormat";
import { useAsyncData } from "@/shared/hooks/useAsyncData";

const LOAD_ERROR = "Tải dữ liệu thất bại. Vui lòng thử lại.";

// A class has at most one solo and one ensemble assignment, so the students who submitted today
// are read from the published assignments' per-student last submission.
async function loadTodaySubmissions(classes: ClassSummary[]): Promise<TodaySubmissions[]> {
  if (classes.length === 0) return [];
  const now = new Date();
  const classIds = new Set(classes.map((cls) => cls.id));
  const { items } = (await assignmentsApi.listAssignments({ status: "PUBLISHED", limit: 100 })).data.data;
  const watched = items.filter(
    (item) => classIds.has(item.classId) && (item.kind === "SOLO" || item.kind === "ENSEMBLE")
  );
  const details = await Promise.all(
    watched.map(async (item) => (await assignmentsApi.getAssignment(item.id)).data.data)
  );
  return rankTodaySubmissions(
    classes.map((cls) => {
      const countKind = (kind: "SOLO" | "ENSEMBLE") => {
        const detail = details.find((item) => item.classId === cls.id && item.kind === kind);
        return detail ? countTodaySubmitters(detail.students, now) : null;
      };
      return {
        classId: cls.id,
        className: cls.name,
        cohort: cls.cohort,
        memberCount: cls.memberCount,
        solo: countKind("SOLO"),
        ensemble: countKind("ENSEMBLE"),
      };
    })
  );
}

// "Lượt nộp bài mới": per running class, most submitters today first.
export function useTodaySubmissions(classes: ClassSummary[]) {
  const today = useAsyncData(
    () => loadTodaySubmissions(classes),
    `home-today:${classes.map((cls) => cls.id).join(",")}`,
    LOAD_ERROR
  );
  return { rows: today.data ?? [], isLoading: today.isLoading, error: today.error, reload: today.reload };
}
