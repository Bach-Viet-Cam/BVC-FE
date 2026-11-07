import { useAuth } from "@/shared/context/AuthContext";
import { getRoleHome } from "@/shared/utils/roleHome";

export function useLandingAccount() {
  const { user, isLoading } = useAuth();
  return {
    isLoading,
    accountLabel: user ? user.username : "Đăng nhập",
    homePath: user ? getRoleHome(user.role) : "/login",
  };
}
