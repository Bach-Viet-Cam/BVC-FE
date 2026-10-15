import { useAuth } from "@/shared/context/AuthContext";
import { ROLES } from "@/shared/constants/roles";

export type ViewerRole = "guest" | "student" | "teacher" | "admin";

export const DEV_VIEWER_ROLE_KEY = "bvc.devViewerRole";

const VIEWER_ROLES: ViewerRole[] = ["guest", "student", "teacher", "admin"];

function readDevOverride(): ViewerRole | null {
  if (!import.meta.env.DEV) return null;
  try {
    const value = localStorage.getItem(DEV_VIEWER_ROLE_KEY);
    return VIEWER_ROLES.find((role) => role === value) ?? null;
  } catch {
    return null;
  }
}

// Ở môi trường dev có thể ép vai trò qua DevNav để xem giao diện khách / sinh viên / giảng viên
export function useViewerRole(): ViewerRole {
  const { user } = useAuth();
  const override = readDevOverride();
  if (override) return override;
  if (!user) return "guest";
  if (user.role === ROLES.TEACHER) return "teacher";
  if (user.role === ROLES.SYSTEM_ADMIN) return "admin";
  return "student";
}
