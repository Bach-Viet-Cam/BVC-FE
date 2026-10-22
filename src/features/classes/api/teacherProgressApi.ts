import { axiosClient } from "@/shared/api/axiosClient";
import { type ApiResponse } from "@/shared/types/commonTypes";
import { type ClassProgress, type HistoryParams, type StudentHistory, type StudentSummary } from "@/features/classes/types/teacherProgressTypes";

export const teacherProgressApi = {
  getClassProgress: (classId: string) => axiosClient.get<ApiResponse<ClassProgress>>(`/classes/${classId}/progress`),
  getStudentSummary: (classId: string, studentId: string) =>
    axiosClient.get<ApiResponse<StudentSummary>>(`/classes/${classId}/students/${studentId}/summary`),
  getStudentHistory: (classId: string, studentId: string, params: HistoryParams) =>
    axiosClient.get<ApiResponse<StudentHistory>>(`/classes/${classId}/students/${studentId}/history`, { params }),
};
