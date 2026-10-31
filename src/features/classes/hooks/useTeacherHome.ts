import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import { useActiveClassProgress } from "@/features/classes/hooks/useActiveClassProgress";
import { useTodaySubmissions } from "@/features/classes/hooks/useTodaySubmissions";
import { type AssignmentStatus } from "@/features/classes/types/teacherAssignmentTypes";
import { formatCurrentWeek } from "@/features/classes/utils/classFormat";
import { formatWeekLabel, type HomeClass } from "@/features/classes/utils/teacherHomeFormat";
import { useApiQuery } from "@/shared/hooks/useApiQuery";

const LOAD_ERROR = "Tải dữ liệu thất bại. Vui lòng thử lại.";

function useAssignmentCount(status: AssignmentStatus) {
  return useApiQuery(
    `home-assignments-${status}`,
    async () => (await assignmentsApi.listAssignments({ status, limit: 1 })).data.data.pagination.total
  );
}

// Running classes with their progress summary, the students to watch, today's submissions,
// plus the lecturer's published / draft assignment counts.
export function useTeacherHome() {
  const active = useActiveClassProgress();
  const today = useTodaySubmissions(active.classes);
  const published = useAssignmentCount("PUBLISHED");
  const drafts = useAssignmentCount("DRAFT");

  const classes: HomeClass[] = active.classes.map((cls, index) => ({
    id: cls.id,
    name: cls.name,
    cohort: cls.cohort,
    memberCount: cls.memberCount,
    weekLabel: formatWeekLabel(formatCurrentWeek(cls.startDate, cls.status)),
    onTrack: active.progress?.[index]?.summary.onTrack ?? 0,
    atRisk: active.progress?.[index]?.summary.atRisk ?? 0,
    behind: active.progress?.[index]?.summary.behind ?? 0,
  }));

  return {
    classes,
    attentionStudents: active.attentionStudents,
    todaySubmissions: today.rows,
    publishedCount: published.data ?? 0,
    draftCount: drafts.data ?? 0,
    isLoading: active.isLoading || today.isLoading || published.isLoading || drafts.isLoading,
    error: active.error ?? (published.error || drafts.error ? LOAD_ERROR : null) ?? today.error,
    reload: () => {
      active.reload();
      today.reload();
      published.reload();
      drafts.reload();
    },
  };
}
