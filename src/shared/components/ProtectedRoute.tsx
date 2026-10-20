import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/shared/context/AuthContext";
import { type Role } from "@/shared/constants/roles";

interface ProtectedRouteProps {
  allowedRoles?: readonly Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, hasAnyRole } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !hasAnyRole([...allowedRoles])) return <Navigate to="/403" replace />;

  return <Outlet />;
}
