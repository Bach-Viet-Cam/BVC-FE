import { useState } from "react";
import { classesApi } from "@/features/classes/api/classesApi";
import { type StudentPayload } from "@/features/classes/types/classTypes";
import { type ParsedApiError, parseApiError } from "@/features/classes/utils/mapApiErrors";

export function useAddStudent(classId: string) {
  const [isSaving, setIsSaving] = useState(false);

  const addStudent = async (payload: StudentPayload): Promise<{ message: string } | { error: ParsedApiError }> => {
    setIsSaving(true);
    try {
      const { data } = await classesApi.addMember(classId, payload);
      return { message: data.message };
    } catch (error) {
      return { error: parseApiError(error, "Thêm sinh viên thất bại. Vui lòng thử lại.") };
    } finally {
      setIsSaving(false);
    }
  };

  return { addStudent, isSaving };
}
