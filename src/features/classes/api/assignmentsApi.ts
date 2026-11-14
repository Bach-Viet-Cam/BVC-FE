import { axiosClient } from "@/shared/api/axiosClient";
import { type ApiResponse } from "@/shared/types/commonTypes";
import {
  type AssignmentAction,
  type AssignmentOverview,
  type AssignPayload,
  type AssignResult,
  type AssignmentBase,
  type AssignmentContentPayload,
  type AssignmentDetail,
  type AssignmentListParams,
  type AssignmentListResult,
  type ClassSheetMusic,
  type SheetGroupDetail,
  type CreateAssignmentPayload,
  type StudentSubmissions,
  type SubmissionComment,
} from "@/features/classes/types/teacherAssignmentTypes";

export const assignmentsApi = {
  listAssignments: (params: AssignmentListParams) =>
    axiosClient.get<ApiResponse<AssignmentListResult>>("/assignments", { params }),
  getOverview: () => axiosClient.get<ApiResponse<AssignmentOverview>>("/assignments/overview"),
  assignToClasses: (payload: AssignPayload) =>
    axiosClient.post<ApiResponse<AssignResult>>("/assignments/assign", payload),
  listClassSheetMusic: (target: { classId: string } | { instrumentId: string }) =>
    axiosClient.get<ApiResponse<ClassSheetMusic[]>>("/assignments/sheet-music", { params: target }),
  getAssignment: (assignmentId: string) =>
    axiosClient.get<ApiResponse<AssignmentDetail>>(`/assignments/${assignmentId}`),
  getSheetGroup: (sheetMusicId: string) =>
    axiosClient.get<ApiResponse<SheetGroupDetail>>(`/assignments/sheet-groups/${sheetMusicId}`),
  createAssignment: (payload: CreateAssignmentPayload) =>
    axiosClient.post<ApiResponse<AssignmentBase>>("/assignments", payload),
  updateAssignment: (assignmentId: string, payload: AssignmentContentPayload) =>
    axiosClient.put<ApiResponse<AssignmentBase>>(`/assignments/${assignmentId}`, payload),
  changeStatus: (assignmentId: string, action: AssignmentAction) =>
    axiosClient.post<ApiResponse<AssignmentBase>>(`/assignments/${assignmentId}/${action}`),
  deleteAssignment: (assignmentId: string) => axiosClient.delete<ApiResponse<null>>(`/assignments/${assignmentId}`),
  getStudentSubmissions: (assignmentId: string, studentId: string) =>
    axiosClient.get<ApiResponse<StudentSubmissions>>(`/assignments/${assignmentId}/students/${studentId}/submissions`),
  saveComment: (submissionId: string, content: string) =>
    axiosClient.put<ApiResponse<SubmissionComment>>(`/submissions/${submissionId}/comment`, { content }),
};
