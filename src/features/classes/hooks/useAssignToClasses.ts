import { useState } from "react";
import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import { type AssignPayload, type AssignResult } from "@/features/classes/types/teacherAssignmentTypes";
import { type ParsedApiError, parseApiError } from "@/features/classes/utils/mapApiErrors";

type AssignOutcome = { result: AssignResult; message: string } | { error: ParsedApiError };

export function useAssignToClasses() {
  const [isAssigning, setIsAssigning] = useState(false);

  const assign = async (payload: AssignPayload): Promise<AssignOutcome> => {
    setIsAssigning(true);
    try {
      const { data } = await assignmentsApi.assignToClasses(payload);
      return { result: data.data, message: data.message };
    } catch (error) {
      return { error: parseApiError(error, "Gán bài tập thất bại. Vui lòng thử lại.") };
    } finally {
      setIsAssigning(false);
    }
  };

  return { assign, isAssigning };
}
