import { axiosClient } from "@/shared/api/axiosClient";
import { type ApiResponse } from "@/shared/types/commonTypes";
import {
  type ClassDetail,
  type ClassListParams,
  type ClassListResult,
  type ClassPayload,
  type ImportConfirmResult,
  type ImportPreview,
  type Instrument,
  type Member,
  type MemberListParams,
  type MemberListResult,
  type StudentPayload,
} from "@/features/classes/types/classTypes";

export const classesApi = {
  listInstruments: () => axiosClient.get<ApiResponse<Instrument[]>>("/instruments", { params: { active: "true" } }),

  listClasses: (params: ClassListParams) => axiosClient.get<ApiResponse<ClassListResult>>("/classes", { params }),
  getClass: (classId: string) => axiosClient.get<ApiResponse<ClassDetail>>(`/classes/${classId}`),
  createClass: (payload: ClassPayload) => axiosClient.post<ApiResponse<ClassDetail>>("/classes", payload),
  updateClass: (classId: string, payload: Partial<ClassPayload>) =>
    axiosClient.patch<ApiResponse<ClassDetail>>(`/classes/${classId}`, payload),
  endClass: (classId: string) => axiosClient.post<ApiResponse<ClassDetail>>(`/classes/${classId}/end`),

  listMembers: (classId: string, params: MemberListParams) =>
    axiosClient.get<ApiResponse<MemberListResult>>(`/classes/${classId}/members`, { params }),
  addMember: (classId: string, payload: StudentPayload) =>
    axiosClient.post<ApiResponse<Member>>(`/classes/${classId}/members`, payload),
  removeMember: (classId: string, studentId: string) =>
    axiosClient.delete<ApiResponse<null>>(`/classes/${classId}/members/${studentId}`),

  downloadImportTemplate: () => axiosClient.get<Blob>("/classes/import-template", { responseType: "blob" }),
  previewImport: (classId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post<ApiResponse<ImportPreview>>(`/classes/${classId}/imports`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  confirmImport: (classId: string, logId: string) =>
    axiosClient.post<ApiResponse<ImportConfirmResult>>(`/classes/${classId}/imports/${logId}/confirm`),
  cancelImport: (classId: string, logId: string) =>
    axiosClient.post<ApiResponse<null>>(`/classes/${classId}/imports/${logId}/cancel`),
};
