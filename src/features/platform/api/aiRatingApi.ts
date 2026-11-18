import { axiosClient } from "@/shared/api/axiosClient";

export interface AiRating {
  id: string;
  accuracyStars: number;
  satisfactionStars: number;
  comment: string | null;
  updatedAt: string;
}
export interface AiRatingState {
  feedback: string | null;
  feedbackKey: string | null;
  canComment: boolean;
  rating: AiRating | null;
}
export interface AiRatingHistoryItem extends AiRating {
  submissionId: string;
  raterName: string;
  raterRole: number;
  feedbackText: string;
  createdAt: string;
  submission: {
    id: string;
    createdAt: string;
    student: { username: string };
    piece: { title: string };
    assignment: { title: string } | null;
  };
}
export const aiRatingApi = {
  get: async (id: string): Promise<AiRatingState> =>
    (await axiosClient.get(`/submissions/${encodeURIComponent(id)}/ai-rating`)).data.data,
  save: async (
    id: string,
    body: { feedbackKey: string; accuracyStars: number; satisfactionStars: number; comment?: string | null }
  ): Promise<AiRatingState> =>
    (await axiosClient.put(`/submissions/${encodeURIComponent(id)}/ai-rating`, body)).data.data,
  history: async (
    page: number,
    role: string
  ): Promise<{ items: AiRatingHistoryItem[]; total: number; page: number; pageSize: number }> =>
    (await axiosClient.get("/admin/ai-ratings", { params: { page, role } })).data.data,
};
