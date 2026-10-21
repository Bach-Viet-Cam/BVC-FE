import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import { useApiQuery } from "@/features/classes/hooks/useApiQuery";

export function useClassPieces(classId: string) {
  const { data, isLoading } = useApiQuery(
    classId ? `class-pieces:${classId}` : null,
    async () => (await assignmentsApi.listClassPieces(classId)).data.data
  );
  return { pieces: data ?? [], isLoading };
}
