import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/shared/context/AuthContext";
import { type Role } from "@/shared/constants/roles";

interface ProtectedRouteProps {
  allowedRoles?: readonly Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, hasAnyRole } = useAuth();

  if (isLoading) return null;
  // Chưa đăng nhập thì về trang giới thiệu (landing), bấm Đăng nhập ở đó để vào
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !hasAnyRole([...allowedRoles])) return <Navigate to="/403" replace />;

  return <Outlet />;
}
