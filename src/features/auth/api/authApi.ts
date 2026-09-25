import { axiosClient } from "@/shared/api/axiosClient";
import { type LoginRequest, type RegisterRequest, type AuthResponse } from "@/features/auth/types/authTypes";

export const authApi = {
  login: (data: LoginRequest) => axiosClient.post<AuthResponse>("/auth/login", data),

  register: (data: RegisterRequest) => axiosClient.post<AuthResponse>("/auth/register", data),

  logout: () => axiosClient.post("/auth/logout"),

  getMe: () => axiosClient.get<AuthResponse["user"]>("/auth/me"),
};
