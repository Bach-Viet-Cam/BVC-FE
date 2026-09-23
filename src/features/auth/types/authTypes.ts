import { type UserInfo } from "@/shared/context/AuthContext";

export interface GoogleAuthRequest {
  credential: string;
  role?: number;
}

export interface AuthResponse {
  accessToken: string;
  user: UserInfo;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
