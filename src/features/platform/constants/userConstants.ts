import { ROLES } from "@/shared/constants/roles";
import { type UserStatus } from "@/features/platform/types/userTypes";

export const USER_ROLE_OPTIONS = [
  { value: ROLES.STUDENT, label: "Sinh viên" },
  { value: ROLES.TEACHER, label: "Giảng viên" },
  { value: ROLES.SYSTEM_ADMIN, label: "Quản trị hệ thống" },
] as const;

export const USER_ROLE_LABELS: Record<number, string> = Object.fromEntries(
  USER_ROLE_OPTIONS.map((option) => [option.value, option.label])
);

export const USER_STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: "PENDING", label: "Chờ kích hoạt" },
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "LOCKED", label: "Đã khóa" },
];

export const USER_STATUS_DOT: Record<UserStatus, string> = {
  PENDING: "bg-bvc-warn",
  ACTIVE: "bg-bvc-ok",
  LOCKED: "bg-bvc-bar-strong",
};

export const USER_PAGE_SIZE = 20;
