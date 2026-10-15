import { useCallback, useEffect, useMemo, useState } from "react";
import { userApi } from "@/features/platform/api/userApi";
import {
  type UserItem,
  type UserListParams,
  type UserSortKey,
  type UserStatus,
} from "@/features/platform/types/userTypes";
import { USER_PAGE_SIZE } from "@/features/platform/constants/userConstants";
import { type UserFormValues } from "@/features/platform/utils/validateUser";
import { toast } from "@/shared/components/ui/toast";
import { type SortDirection } from "@/shared/types/commonTypes";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

export interface UserFilters {
  role?: number;
  status?: UserStatus;
  q: string;
  sortBy: UserSortKey;
  sortDir: SortDirection;
  page: number;
}

interface LoadedUsers {
  requestKey: string;
  items: UserItem[];
  total: number;
  error: string | null;
}

const INITIAL_FILTERS: UserFilters = { q: "", sortBy: "username", sortDir: "asc", page: 1 };
const LOAD_ERROR = "Tải dữ liệu thất bại. Vui lòng thử lại.";

export function useUsers() {
  const [filters, setFilters] = useState<UserFilters>(INITIAL_FILTERS);
  const [reloadCount, setReloadCount] = useState(0);
  const [loaded, setLoaded] = useState<LoadedUsers | null>(null);

  const params = useMemo<UserListParams>(
    () => ({
      role: filters.role,
      status: filters.status,
      q: filters.q || undefined,
      sortBy: filters.sortBy,
      sortDir: filters.sortDir,
      page: filters.page,
      pageSize: USER_PAGE_SIZE,
    }),
    [filters]
  );
  const requestKey = JSON.stringify([params, reloadCount]);

  useEffect(() => {
    let isCancelled = false;
    userApi
      .list(params)
      .then(({ data }) => {
        if (isCancelled) return;
        setLoaded({ requestKey, items: data.data.items, total: data.data.total, error: null });
      })
      .catch((error: unknown) => {
        if (isCancelled) return;
        setLoaded({ requestKey, items: [], total: 0, error: getApiErrorMessage(error, LOAD_ERROR) });
      });
    return () => {
      isCancelled = true;
    };
  }, [params, requestKey]);

  const updateFilters = useCallback((next: Partial<UserFilters>) => {
    setFilters((previous) => ({ ...previous, page: 1, ...next }));
  }, []);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  const saveUser = useCallback(
    async (userId: string | null, values: UserFormValues): Promise<boolean> => {
      const body = {
        email: values.email,
        username: values.username,
        role: Number(values.role),
        studentCode: values.studentCode || undefined,
      };
      try {
        const { data } = userId
          ? await userApi.update(userId, { ...body, studentCode: values.studentCode || null })
          : await userApi.create(body);
        toast.success(data.message);
        reload();
        return true;
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Không thể lưu người dùng. Vui lòng thử lại."));
        return false;
      }
    },
    [reload]
  );

  const toggleLock = useCallback(
    async (user: UserItem): Promise<boolean> => {
      try {
        const { data } = user.status === "LOCKED" ? await userApi.unlock(user.id) : await userApi.lock(user.id);
        toast.success(data.message);
        reload();
        return true;
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Không thể cập nhật tài khoản. Vui lòng thử lại."));
        return false;
      }
    },
    [reload]
  );

  const isLoading = loaded?.requestKey !== requestKey;
  return {
    filters,
    updateFilters,
    items: loaded?.items ?? [],
    total: loaded?.total ?? 0,
    error: loaded?.error ?? null,
    isLoading,
    pageSize: USER_PAGE_SIZE,
    saveUser,
    toggleLock,
  };
}
