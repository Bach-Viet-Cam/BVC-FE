import { useCallback, useState } from "react";
import { catalogCategoryApi } from "@/features/platform/api/catalogCategoryApi";
import {
  type CatalogCategoryItem,
  type CatalogCategoryListParams,
  type CatalogCategoryListResult,
  type CatalogCategoryStatusFilter,
  type CatalogCategoryType,
} from "@/features/platform/types/catalogCategoryTypes";
import { type CatalogCategoryFormValues } from "@/features/platform/utils/validateCatalogCategory";
import { toast } from "@/shared/components/ui/toast";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

export interface CatalogCategoryFilters {
  type: CatalogCategoryType;
  q: string;
  status: CatalogCategoryStatusFilter;
  page: number;
}

export const CATALOG_CATEGORY_PAGE_SIZE = 50;
const INITIAL_FILTERS: CatalogCategoryFilters = { type: "GENRE", q: "", status: "all", page: 1 };
const LOAD_ERROR = "Tải danh mục thất bại. Vui lòng thử lại.";

export function useCatalogCategories() {
  const [filters, setFilters] = useState<CatalogCategoryFilters>(INITIAL_FILTERS);
  const params: CatalogCategoryListParams = {
    type: filters.type,
    q: filters.q || undefined,
    status: filters.status,
    page: filters.page,
    limit: CATALOG_CATEGORY_PAGE_SIZE,
  };
  const { data, error, isLoading, reload } = useAsyncData<CatalogCategoryListResult>(
    () => catalogCategoryApi.list(params).then(({ data: body }) => body.data),
    `catalog-categories:${JSON.stringify(params)}`,
    LOAD_ERROR
  );

  const updateFilters = useCallback((next: Partial<CatalogCategoryFilters>) => {
    setFilters((previous) => ({ ...previous, page: 1, ...next }));
  }, []);

  const saveCategory = useCallback(
    async (target: CatalogCategoryItem | null, values: CatalogCategoryFormValues): Promise<boolean> => {
      const body = { name: values.name, description: values.description || null, displayOrder: values.displayOrder };
      try {
        const { data: response } = target
          ? await catalogCategoryApi.update(target.id, body)
          : await catalogCategoryApi.create({ ...body, type: filters.type });
        toast.success(response.message);
        reload();
        return true;
      } catch (saveError: unknown) {
        toast.error(getApiErrorMessage(saveError, "Không thể lưu danh mục. Vui lòng thử lại."));
        return false;
      }
    },
    [filters.type, reload]
  );

  const toggleActive = useCallback(
    async (category: CatalogCategoryItem): Promise<void> => {
      try {
        const { data: response } =
          category.status === "ACTIVE"
            ? await catalogCategoryApi.deactivate(category.id)
            : await catalogCategoryApi.activate(category.id);
        toast.success(response.message);
        reload();
      } catch (toggleError: unknown) {
        toast.error(getApiErrorMessage(toggleError, "Không thể cập nhật danh mục. Vui lòng thử lại."));
      }
    },
    [reload]
  );

  const removeCategory = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { data: response } = await catalogCategoryApi.remove(id);
        toast.success(response.message);
        reload();
        return true;
      } catch (removeError: unknown) {
        toast.error(getApiErrorMessage(removeError, "Không thể xóa danh mục. Vui lòng thử lại."));
        return false;
      }
    },
    [reload]
  );

  return {
    filters,
    updateFilters,
    items: data?.items ?? [],
    total: data?.pagination.total ?? 0,
    error,
    isLoading,
    reload,
    saveCategory,
    toggleActive,
    removeCategory,
  };
}
