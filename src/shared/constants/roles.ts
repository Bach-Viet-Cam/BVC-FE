export const ROLES = {
  STUDENT: "STUDENT",
  TEACHER: "TEACHER",
  SYSTEM_ADMIN: "SYSTEM_ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
