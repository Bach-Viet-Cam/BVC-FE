import { assignmentApi } from "@/features/classes/api/assignmentApi";
import { type AssignmentDetail } from "@/features/classes/types/assignmentTypes";
import { useAsyncData } from "@/shared/hooks/useAsyncData";

const LOAD_ERROR = "Không thể mở bài tập vì bài tập không còn khả dụng.";

export function useAssignmentDetail(assignmentId: string) {
  const { data, error, isLoading } = useAsyncData<AssignmentDetail>(
    () => assignmentApi.get(assignmentId).then(({ data: body }) => body.data),
    assignmentId,
    LOAD_ERROR
  );
  return { assignment: data, error, isLoading };
}
