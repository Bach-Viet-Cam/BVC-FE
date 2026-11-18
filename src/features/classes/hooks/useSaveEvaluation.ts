import { studentStatsApi } from "@/features/practice/api/studentStatsApi";
import { type ApiFieldError } from "@/features/classes/types/classTypes";
import { parseApiError } from "@/features/classes/utils/mapApiErrors";
import { toast } from "@/shared/components/ui/toast";

// Lưu đánh giá chung, báo kết quả bằng toast; trả lỗi theo trường cho form
export function useSaveEvaluation(classId: string, studentId: string, onSaved: () => void) {
  return async (content: string): Promise<ApiFieldError[] | null> => {
    try {
      const { data } = await studentStatsApi.saveEvaluation(classId, studentId, content);
      toast.success(data.message || "Đã lưu đánh giá.");
      onSaved();
      return null;
    } catch (error) {
      const parsed = parseApiError(error, "Lưu đánh giá thất bại. Vui lòng thử lại.");
      if (parsed.fieldErrors.length === 0) toast.error(parsed.message);
      return parsed.fieldErrors;
    }
  };
}
