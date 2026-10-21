import { useState } from "react";
import { classesApi } from "@/features/classes/api/classesApi";
import { type ClassDetail, type ClassPayload } from "@/features/classes/types/classTypes";
import { type ParsedApiError, parseApiError } from "@/features/classes/utils/mapApiErrors";

type SaveResult = { classDetail: ClassDetail; message: string } | { error: ParsedApiError };

export function useSaveClass(classId: string | undefined) {
  const [isSaving, setIsSaving] = useState(false);

  const saveClass = async (payload: Partial<ClassPayload>): Promise<SaveResult> => {
    setIsSaving(true);
    try {
      const { data } = classId
        ? await classesApi.updateClass(classId, payload)
        : await classesApi.createClass(payload as ClassPayload);
      return { classDetail: data.data, message: data.message };
    } catch (error) {
      return { error: parseApiError(error, "Lưu lớp thất bại. Vui lòng thử lại.") };
    } finally {
      setIsSaving(false);
    }
  };

  return { saveClass, isSaving };
}
