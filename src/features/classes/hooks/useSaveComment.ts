import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import { type ParsedApiError, parseApiError } from "@/features/classes/utils/mapApiErrors";

export function useSaveComment() {
  const saveComment = async (
    submissionId: string,
    content: string
  ): Promise<{ message: string } | { error: ParsedApiError }> => {
    try {
      const { data } = await assignmentsApi.saveComment(submissionId, content);
      return { message: data.message };
    } catch (error) {
      return { error: parseApiError(error, "Gửi nhận xét thất bại. Vui lòng thử lại.") };
    }
  };
  return { saveComment };
}
