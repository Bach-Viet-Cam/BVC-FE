import { axiosClient } from "@/shared/api/axiosClient";
import {
  type ApiResponse,
  type AuthResponse,
  type GoogleAuthRequest,
} from "@/features/auth/types/authTypes";

export const authApi = {
  googleAuth: (data: GoogleAuthRequest) =>
    axiosClient.post<ApiResponse<AuthResponse>>("/auth/google", data),
  refresh: () => axiosClient.post<ApiResponse<AuthResponse>>("/auth/refresh"),
  logout: () => axiosClient.post("/auth/logout"),
  getMe: () => axiosClient.get<ApiResponse<AuthResponse["user"]>>("/auth/me"),
};
