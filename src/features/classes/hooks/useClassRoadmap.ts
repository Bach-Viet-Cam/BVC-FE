import { roadmapsApi } from "@/features/classes/api/roadmapsApi";
import { useApiQuery } from "@/features/classes/hooks/useApiQuery";

export function useClassRoadmap(classId: string) {
  const { data, error, isLoading, reload } = useApiQuery(
    `class-roadmap:${classId}`,
    async () => (await roadmapsApi.getClassRoadmap(classId)).data.data
  );
  return { classRoadmap: data, isLoading, error: error ? "Tải dữ liệu thất bại. Vui lòng thử lại." : null, reload };
}
