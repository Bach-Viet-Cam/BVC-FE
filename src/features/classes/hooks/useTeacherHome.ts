import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import { progressApi } from "@/features/classes/api/progressApi";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { useClassList } from "@/features/classes/hooks/useClassList";
import { type AssignmentStatus } from "@/features/classes/types/teacherAssignmentTypes";
import { formatCurrentWeek } from "@/features/classes/utils/classFormat";
import { formatWeekLabel, type HomeClass } from "@/features/classes/utils/teacherHomeFormat";
import { useAsyncData } from "@/shared/hooks/useAsyncData";

const LOAD_ERROR = "Tải dữ liệu thất bại. Vui lòng thử lại.";

function useAssignmentCount(status: AssignmentStatus) {
  return useApiQuery(
    `home-assignments-${status}`,
    async () => (await assignmentsApi.listAssignments({ status, limit: 1 })).data.data.pagination.total
  );
}

// Running classes with their progress summary, plus the lecturer's published / draft assignment counts.
export function useTeacherHome() {
  const classList = useClassList({ status: "ACTIVE" });
  const published = useAssignmentCount("PUBLISHED");
  const drafts = useAssignmentCount("DRAFT");

  const activeItems = classList.result?.items ?? [];
  const progress = useAsyncData(
    () =>
      Promise.all(
        activeItems.map((cls) =>
          progressApi
            .getProgress(cls.id, { sortBy: "studentCode", sortDir: "asc" })
            .then(({ data }) => data.data.summary)
        )
      ),
    `home-progress:${activeItems.map((cls) => cls.id).join(",")}`,
    LOAD_ERROR
  );

  const classes: HomeClass[] = activeItems.map((cls, index) => ({
    id: cls.id,
    name: cls.name,
    cohort: cls.cohort,
    memberCount: cls.memberCount,
    weekLabel: formatWeekLabel(formatCurrentWeek(cls.startDate, cls.status)),
    onTrack: progress.data?.[index]?.onTrack ?? 0,
    atRisk: progress.data?.[index]?.atRisk ?? 0,
    behind: progress.data?.[index]?.behind ?? 0,
  }));

  const queryError = classList.error ?? (published.error || drafts.error ? LOAD_ERROR : null);
  return {
    classes,
    publishedCount: published.data ?? 0,
    draftCount: drafts.data ?? 0,
    isLoading: classList.isLoading || published.isLoading || drafts.isLoading || progress.isLoading,
    error: queryError ?? progress.error,
    reload: () => {
      classList.reload();
      published.reload();
      drafts.reload();
      progress.reload();
    },
  };
}
