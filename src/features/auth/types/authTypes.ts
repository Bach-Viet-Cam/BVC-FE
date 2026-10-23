import { type UserInfo } from "@/shared/context/AuthContext";

export interface GoogleAuthRequest {
  credential: string;
  // Gửi true sau khi người dùng đồng ý tạo tài khoản học sinh cho email chưa có trong hệ thống
  createIfMissing?: boolean;
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
