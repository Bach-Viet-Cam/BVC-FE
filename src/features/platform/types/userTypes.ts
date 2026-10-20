import { type SortDirection } from "@/shared/types/commonTypes";

export type UserStatus = "PENDING" | "ACTIVE" | "LOCKED";
export type UserSortKey = "username" | "email" | "role" | "status";

export interface UserItem {
  id: string;
  username: string;
  email: string;
  role: number;
  status: UserStatus;
  studentCode: string | null;
  lastLoginAt: string | null;
}

export interface UserListParams {
  role?: number;
  status?: UserStatus;
  q?: string;
  sortBy: UserSortKey;
  sortDir: SortDirection;
  page: number;
  pageSize: number;
}

export interface UserCreateRequest {
  email: string;
  username: string;
  role: number;
  studentCode?: string;
}

export interface UserUpdateRequest {
  email?: string;
  username?: string;
  role?: number;
  studentCode?: string | null;
}
