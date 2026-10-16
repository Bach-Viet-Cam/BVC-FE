import { useState } from "react";
import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import { type AssignmentAction } from "@/features/classes/types/assignmentTypes";
import { parseApiError } from "@/features/classes/utils/mapApiErrors";

type ActionOutcome = { message: string } | { error: string };

export function useAssignmentActions(assignmentId: string) {
  const [isWorking, setIsWorking] = useState(false);

  const run = async (request: () => Promise<{ data: { message: string } }>): Promise<ActionOutcome> => {
    setIsWorking(true);
    try {
      const { data } = await request();
      return { message: data.message };
    } catch (error) {
      return { error: parseApiError(error, "Thao tác thất bại. Vui lòng thử lại.").message };
    } finally {
      setIsWorking(false);
    }
  };

  const changeStatus = (action: AssignmentAction) => run(() => assignmentsApi.changeStatus(assignmentId, action));
  const deleteAssignment = () => run(() => assignmentsApi.deleteAssignment(assignmentId));

  return { changeStatus, deleteAssignment, isWorking };
}
