import { useState } from "react";
import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import { type AssignmentBase, type AssignmentContentPayload } from "@/features/classes/types/assignmentTypes";
import { type ParsedApiError, parseApiError } from "@/features/classes/utils/mapApiErrors";

type SaveResult = { assignment: AssignmentBase; message: string } | { error: ParsedApiError };

export function useSaveAssignment(assignmentId: string | undefined) {
  const [isSaving, setIsSaving] = useState(false);

  const saveAssignment = async (
    payload: AssignmentContentPayload & { classId: string },
    publish: boolean
  ): Promise<SaveResult> => {
    setIsSaving(true);
    try {
      const { classId, ...content } = payload;
      const { data } = assignmentId
        ? await assignmentsApi.updateAssignment(assignmentId, content)
        : await assignmentsApi.createAssignment({ classId, ...content, publish });
      return { assignment: data.data, message: data.message };
    } catch (error) {
      return { error: parseApiError(error, "Lưu bài tập thất bại. Vui lòng thử lại.") };
    } finally {
      setIsSaving(false);
    }
  };

  return { saveAssignment, isSaving };
}
