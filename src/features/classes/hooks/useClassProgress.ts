import { teacherProgressApi } from "@/features/classes/api/teacherProgressApi";
import { useApiQuery } from "@/features/classes/hooks/useApiQuery";

export function useClassProgress(classId: string | null) {
  const { data, error, isLoading, reload } = useApiQuery(
    classId ? `progress:${classId}` : null,
    async () => (await teacherProgressApi.getClassProgress(classId as string)).data.data,
  );
  return { progress: data, isLoading, error: error ? "Tải dữ liệu thất bại. Vui lòng thử lại." : null, reload };
}
