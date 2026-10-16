import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/features/auth/api/authApi";
import { useAuth } from "@/shared/context/AuthContext";
import { getRoleHome } from "@/shared/utils/roleHome";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

export function useLogin() {
  const navigate = useNavigate();
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
      navigate(getRoleHome(data.data.user.role), { replace: true });
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Đăng nhập bằng Google thất bại. Vui lòng thử lại."));
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error, setError };
}

