export const ROLES = {
  STUDENT: 1,
  TEACHER: 2,
  SYSTEM_ADMIN: 3,
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const REGISTERABLE_ROLES = [ROLES.STUDENT, ROLES.TEACHER] as const;

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.STUDENT]: "Học viên",
  [ROLES.TEACHER]: "Giáo viên",
  [ROLES.SYSTEM_ADMIN]: "Quản trị viên",
};
