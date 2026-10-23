import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import { useApiQuery } from "@/shared/hooks/useApiQuery";

export function useClassSheetMusic(classId: string) {
  const { data, isLoading } = useApiQuery(
    classId ? `class-sheet-music:${classId}` : null,
    async () => (await assignmentsApi.listClassSheetMusic(classId)).data.data
  );
  return { sheets: data ?? [], isLoading };
}
