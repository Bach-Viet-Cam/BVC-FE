import { classesApi } from "@/features/classes/api/classesApi";
import { useApiQuery } from "@/features/classes/hooks/useApiQuery";

// All classes of the lecturer (any status) for filters and the assignment form.
export function useLecturerClasses() {
  const { data, isLoading } = useApiQuery(
    "lecturer-classes",
    async () => (await classesApi.listClasses({ status: "ALL", limit: 200 })).data.data
  );
  return { classes: data?.items ?? [], isLoading };
}
