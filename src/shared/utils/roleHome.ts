import { ROLES } from "@/shared/constants/roles";

export function getRoleHome(role: number): string {
  if (role === ROLES.SYSTEM_ADMIN) return "/admin";
  if (role === ROLES.TEACHER) return "/teacher/home";
  return "/home";
}
