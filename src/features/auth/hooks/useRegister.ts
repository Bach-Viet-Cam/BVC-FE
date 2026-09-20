import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/features/auth/api/authApi";
import { useAuth } from "@/shared/context/AuthContext";
import { type RegisterFormValues } from "@/features/auth/utils/validateLogin";

export function useRegister() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (values: RegisterFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await authApi.register(values);
      localStorage.setItem("accessToken", data.accessToken);
      setUser(data.user);
      navigate("/dashboard");
    } catch {
      setError("Đăng ký thất bại, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error };
}
