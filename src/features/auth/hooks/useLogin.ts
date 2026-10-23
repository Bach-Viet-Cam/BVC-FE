import { isAxiosError } from "axios";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authApi } from "@/features/auth/api/authApi";
import { useAuth } from "@/shared/context/AuthContext";
import { getRoleHome } from "@/shared/utils/roleHome";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

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
  return null;
}

// BE trả data.reason khi email Google chưa có tài khoản nào trong hệ thống
function isAccountNotProvisioned(error: unknown) {
  return (
    isAxiosError<{ data?: { reason?: string } }>(error) &&
    error.response?.data?.data?.reason === "ACCOUNT_NOT_PROVISIONED"
  );
}

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Giữ credential Google của email chưa có tài khoản để gửi lại khi người dùng đồng ý tạo mới
  const [pendingCredential, setPendingCredential] = useState<string | null>(null);

  const authenticate = async (credential: string, createIfMissing: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await authApi.googleAuth({ credential, createIfMissing });
      setPendingCredential(null);
      localStorage.setItem("accessToken", data.data.accessToken);
      setUser(data.data.user);
      navigate(redirectTarget(location.state) ?? getRoleHome(data.data.user.role), { replace: true });
    } catch (err: unknown) {
      if (!createIfMissing && isAccountNotProvisioned(err)) {
        setPendingCredential(credential);
        return;
      }
      setPendingCredential(null);
      setError(getApiErrorMessage(err, "Đăng nhập bằng Google thất bại. Vui lòng thử lại."));
    } finally {
      setIsLoading(false);
    }
  };

  const login = (credential: string) => authenticate(credential, false);

  const confirmCreateAccount = async () => {
    if (pendingCredential) await authenticate(pendingCredential, true);
  };

  const cancelCreateAccount = () => setPendingCredential(null);

  return {
    login,
    isLoading,
    error,
    setError,
    isCreateAccountOpen: pendingCredential !== null,
    confirmCreateAccount,
    cancelCreateAccount,
  };
}

