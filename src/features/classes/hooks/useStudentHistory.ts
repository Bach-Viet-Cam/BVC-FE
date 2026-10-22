import { teacherProgressApi } from "@/features/classes/api/teacherProgressApi";
import { useApiQuery } from "@/features/classes/hooks/useApiQuery";

// The API has no sort parameter, so one large page is loaded and sorted on the client.
export const HISTORY_PAGE_LIMIT = 200;

export function useStudentHistory(classId: string, studentId: string, range: { from?: string; to?: string }) {
  const { data, error, isLoading, reload } = useApiQuery(
    `history:${classId}:${studentId}:${range.from ?? ""}:${range.to ?? ""}`,
    async () =>
      (await teacherProgressApi.getStudentHistory(classId, studentId, { ...range, page: 1, limit: HISTORY_PAGE_LIMIT })).data
        .data
  );
  return { history: data, isLoading, error: error ? "Tải dữ liệu thất bại. Vui lòng thử lại." : null, reload };
}
