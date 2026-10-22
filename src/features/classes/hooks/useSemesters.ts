import { classesApi } from "@/features/classes/api/classesApi";
import { useApiQuery } from "@/features/classes/hooks/useApiQuery";

export function useSemesters() {
  const { data, error, isLoading } = useApiQuery("semesters", async () => (await classesApi.listSemesters()).data.data);
  return {
    semesters: data?.items ?? [],
    defaultSemesterName: data?.defaultName ?? null,
    isLoading,
    error: error ? "Tải danh sách học kỳ thất bại. Vui lòng thử lại." : null,
  };
}
