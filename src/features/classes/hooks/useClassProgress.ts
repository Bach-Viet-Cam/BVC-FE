import { progressApi } from "@/features/classes/api/progressApi";
import { useApiQuery } from "@/features/classes/hooks/useApiQuery";

export function useClassProgress(classId: string | null) {
  const { data, error, isLoading, reload } = useApiQuery(
    classId ? `progress:${classId}` : null,
    async () => (await progressApi.getClassProgress(classId as string)).data.data,
  );
  return { progress: data, isLoading, error: error ? "Tải dữ liệu thất bại. Vui lòng thử lại." : null, reload };
}
