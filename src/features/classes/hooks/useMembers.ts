import { classesApi } from "@/features/classes/api/classesApi";
import { useApiQuery } from "@/features/classes/hooks/useApiQuery";
import { type MemberListParams } from "@/features/classes/types/classTypes";

export function useMembers(classId: string, params: MemberListParams) {
  const query = { q: params.q || undefined, accountStatus: params.accountStatus, limit: 200 };
  const { data, error, isLoading, reload } = useApiQuery(
    JSON.stringify({ classId, ...query }),
    async () => (await classesApi.listMembers(classId, query)).data.data
  );
  return { result: data, isLoading, error: error ? "Tải dữ liệu thất bại. Vui lòng thử lại." : null, reload };
}
