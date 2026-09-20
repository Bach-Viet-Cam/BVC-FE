import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/features/auth/api/authApi";
import { useAuth } from "@/shared/context/AuthContext";
import { type LoginFormValues } from "@/features/auth/utils/validateLogin";

export function useLogin() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (values: LoginFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await authApi.login(values);
      localStorage.setItem("accessToken", data.accessToken);
      setUser(data.user);
      navigate("/dashboard");
    } catch {
      setError("Email hoặc mật khẩu không đúng");
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
}
