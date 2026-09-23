import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/features/auth/api/authApi";
import { useAuth } from "@/shared/context/AuthContext";
import { ROLES } from "@/shared/constants/roles";

export function useRegister() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (credential: string, role: number = ROLES.STUDENT) => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await authApi.googleAuth({ credential, role });
      localStorage.setItem("accessToken", data.data.accessToken);
      setUser(data.data.user);
      navigate("/dashboard");
    } catch {
      setError("Đăng ký bằng Google thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error };
}
