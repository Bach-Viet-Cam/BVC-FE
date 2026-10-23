import { classesApi } from "@/features/classes/api/classesApi";
import { useApiQuery } from "@/shared/hooks/useApiQuery";

export function useInstruments() {
  const { data, error, isLoading } = useApiQuery(
    "instruments",
    async () => (await classesApi.listInstruments()).data.data
  );
  return {
    instruments: data ?? [],
    isLoading,
    error: error ? "Tải danh sách nhạc cụ thất bại. Vui lòng thử lại." : null,
  };
}
