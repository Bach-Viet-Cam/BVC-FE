import { axiosClient } from "@/shared/api/axiosClient";
import { type ApiResponse } from "@/shared/types/commonTypes";
import {
  type AdminRoadmapListItem,
  type ClassRoadmap,
  type FingerExercise,
  type RoadmapVersion,
  type SaveRoadmapPayload,
} from "@/features/classes/types/roadmapTypes";

export const roadmapsApi = {
  listAdminRoadmaps: () => axiosClient.get<ApiResponse<AdminRoadmapListItem[]>>("/admin/roadmaps"),
  getAdminRoadmap: (instrumentId: string) =>
    axiosClient.get<ApiResponse<RoadmapVersion>>(`/admin/roadmaps/${instrumentId}`),
  listFingerExercises: (instrumentId: string, q?: string) =>
    axiosClient.get<ApiResponse<FingerExercise[]>>(`/admin/roadmaps/${instrumentId}/exercises`, {
      params: { q: q || undefined },
    }),
  saveRoadmapVersion: (instrumentId: string, payload: SaveRoadmapPayload) =>
    axiosClient.post<ApiResponse<RoadmapVersion>>(`/admin/roadmaps/${instrumentId}/versions`, payload),
  getClassRoadmap: (classId: string) => axiosClient.get<ApiResponse<ClassRoadmap>>(`/classes/${classId}/roadmap`),
};
