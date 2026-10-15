import { classesApi } from "@/features/classes/api/classesApi";
import { useApiQuery } from "@/features/classes/hooks/useApiQuery";
import { parseApiError } from "@/features/classes/utils/mapApiErrors";

export function useClassDetail(classId: string | undefined) {
  const { data, error, isLoading, reload, setData } = useApiQuery(
    classId ?? null,
    async () => (await classesApi.getClass(classId as string)).data.data
  );
  const parsedError = error ? parseApiError(error, "Tải dữ liệu thất bại. Vui lòng thử lại.") : null;
  return {
    classDetail: data,
    setClassDetail: setData,
    isLoading,
    error: parsedError?.message ?? null,
    isNotFound: parsedError?.status === 404,
    reload,
  };
}
