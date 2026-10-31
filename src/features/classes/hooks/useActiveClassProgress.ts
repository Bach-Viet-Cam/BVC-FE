import { progressApi } from "@/features/classes/api/progressApi";
import { useClassList } from "@/features/classes/hooks/useClassList";
import { rankAttentionStudents } from "@/features/classes/utils/teacherHomeFormat";
import { useAsyncData } from "@/shared/hooks/useAsyncData";

const LOAD_ERROR = "Tải dữ liệu thất bại. Vui lòng thử lại.";

// The lecturer's running classes with each class's progress, and the students to watch across them.
export function useActiveClassProgress() {
  const classList = useClassList({ status: "ACTIVE" });
  const classes = classList.result?.items ?? [];
  const progress = useAsyncData(
    () =>
      Promise.all(
        classes.map((cls) =>
          progressApi.getProgress(cls.id, { sortBy: "studentCode", sortDir: "asc" }).then(({ data }) => data.data)
        )
      ),
    `home-progress:${classes.map((cls) => cls.id).join(",")}`,
    LOAD_ERROR
  );

  const attentionStudents = rankAttentionStudents(
    classes.flatMap((cls, index) =>
      (progress.data?.[index]?.items ?? []).map((item) => ({ ...item, classId: cls.id, className: cls.name }))
    )
  );

  return {
    classes,
    progress: progress.data,
    attentionStudents,
    isLoading: classList.isLoading || progress.isLoading,
    error: classList.error ?? progress.error,
    reload: () => {
      classList.reload();
      progress.reload();
    },
  };
}
