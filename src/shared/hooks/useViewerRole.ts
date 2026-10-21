import { useAuth } from "@/shared/context/AuthContext";
import { ROLES } from "@/shared/constants/roles";

export type ViewerRole = "guest" | "student" | "teacher" | "admin";

export function useViewerRole(): ViewerRole {
  const { user } = useAuth();
  if (!user) return "guest";
  if (user.role === ROLES.TEACHER) return "teacher";
  if (user.role === ROLES.SYSTEM_ADMIN) return "admin";
  return "student";
}
