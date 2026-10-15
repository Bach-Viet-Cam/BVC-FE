import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/shared/context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: number[];
}

// With allowedRoles: requires a signed-in user with one of those roles (no user → /login, wrong role → /403).
// Without allowedRoles it stays a pass-through so the existing mockup routes keep working.
// The server re-checks every permission; this guard only avoids showing screens that would fail.
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (!allowedRoles) return <Outlet />;
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/403" replace />;
  return <Outlet />;
}
