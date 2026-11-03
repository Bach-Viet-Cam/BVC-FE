import { Navigate } from "react-router-dom";
import { useAuth } from "@/shared/context/AuthContext";
import { getRoleHome } from "@/shared/utils/roleHome";

// Đường dẫn cũ /dashboard: chuyển về trang chủ theo vai trò (giao diện mới), không giữ màn chào mừng riêng
export function DashboardPage() {
  const { user } = useAuth();
  return <Navigate to={user ? getRoleHome(user.role) : "/login"} replace />;
}
