import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authApi } from "@/features/auth/api/authApi";
import { useAuth } from "@/shared/context/AuthContext";

// Trang gửi người dùng tới /login (vd. khách bấm Lưu ở thư viện) truyền state.from để quay lại đúng chỗ
function redirectTarget(state: unknown) {
  if (
    state &&
    typeof state === "object" &&
    "from" in state &&
    typeof state.from === "string" &&
    state.from.startsWith("/")
  ) {
    return state.from;
  }
  return "/dashboard";
}

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credential: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await authApi.googleAuth({ credential });
      localStorage.setItem("accessToken", data.data.accessToken);
      setUser(data.data.user);
      navigate(redirectTarget(location.state), { replace: true });
    } catch {
      setError("Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
}
