import { axiosClient } from "@/shared/api/axiosClient";
import type { ApiResponse } from "@/shared/types/commonTypes";
import type { StudentEvaluation, StudentStats } from "@/features/practice/types/studentStatsTypes";

const studentPath = (classId: string, studentId: string) =>
  `/classes/${encodeURIComponent(classId)}/students/${encodeURIComponent(studentId)}`;

export const studentStatsApi = {
  getForLecturer: (classId: string, studentId: string) =>
    axiosClient.get<ApiResponse<StudentStats>>(`${studentPath(classId, studentId)}/stats`),
  // Không truyền lớp: BE chọn lớp đang học gần nhất; null khi sinh viên chưa ở lớp nào
  getMine: (classId?: string) =>
    axiosClient.get<ApiResponse<StudentStats | null>>("/me/stats", { params: classId ? { classId } : undefined }),
  saveEvaluation: (classId: string, studentId: string, content: string) =>
    axiosClient.put<ApiResponse<{ evaluation: StudentEvaluation }>>(`${studentPath(classId, studentId)}/evaluation`, {
      content,
    }),
};
