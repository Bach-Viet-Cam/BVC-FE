import { axiosClient } from "@/shared/api/axiosClient";
import { type ApiResponse } from "@/shared/types/commonTypes";
import {
  type AssignmentAction,
  type AssignmentBase,
  type AssignmentContentPayload,
  type AssignmentDetail,
  type AssignmentListParams,
  type AssignmentListResult,
  type ClassSheetMusic,
  type CreateAssignmentPayload,
  type StudentSubmissions,
  type SubmissionComment,
} from "@/features/classes/types/teacherAssignmentTypes";

export const assignmentsApi = {
  listAssignments: (params: AssignmentListParams) =>
    axiosClient.get<ApiResponse<AssignmentListResult>>("/assignments", { params }),
  listClassSheetMusic: (classId: string) =>
    axiosClient.get<ApiResponse<ClassSheetMusic[]>>("/assignments/sheet-music", { params: { classId } }),
  getAssignment: (assignmentId: string) =>
    axiosClient.get<ApiResponse<AssignmentDetail>>(`/assignments/${assignmentId}`),
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
