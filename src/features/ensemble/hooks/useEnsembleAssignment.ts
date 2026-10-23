import { ensembleApi } from "@/features/ensemble/api/ensembleApi";
import { type EnsembleAssignmentInfo } from "@/features/ensemble/types/ensembleTypes";
import { useAsyncData } from "@/shared/hooks/useAsyncData";

const LOAD_ERROR = "Không thể tải thông tin bài tập.";

// Thông tin phụ: lỗi thì trả null, màn hòa tấu vẫn dùng bình thường.
export function useEnsembleAssignment(assignmentId: string | undefined): EnsembleAssignmentInfo | null {
  const { data } = useAsyncData<EnsembleAssignmentInfo | null>(
    () =>
      assignmentId
        ? ensembleApi.getAssignment(assignmentId).then(({ data: body }) => body.data)
        : Promise.resolve(null),
    assignmentId ?? "none",
    LOAD_ERROR
  );
  return data;
}
