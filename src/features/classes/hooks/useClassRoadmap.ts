import { roadmapsApi } from "@/features/classes/api/roadmapsApi";
import { useApiQuery } from "@/shared/hooks/useApiQuery";

// classId null = no class chosen yet: nothing is fetched.
export function useClassRoadmap(classId: string | null) {
  const { data, error, isLoading, reload } = useApiQuery(
    classId === null ? null : `class-roadmap:${classId}`,
    async () => (classId === null ? null : (await roadmapsApi.getClassRoadmap(classId)).data.data)
  );
  return { classRoadmap: data, isLoading, error: error ? "Tải dữ liệu thất bại. Vui lòng thử lại." : null, reload };
}
