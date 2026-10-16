import { useCallback } from "react";
import { categoryApi } from "@/features/platform/api/categoryApi";
import { type CategoryFormTarget, type ContentCategoryNode } from "@/features/platform/types/categoryTypes";
import { type CategoryFormValues } from "@/features/platform/utils/validateCategory";
import { toast } from "@/shared/components/ui/toast";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

const LOAD_ERROR = "Tải danh mục thất bại. Vui lòng thử lại.";

export function useContentCategories() {
  const { data, error, isLoading, reload } = useAsyncData<ContentCategoryNode[]>(
    () => categoryApi.list().then(({ data: body }) => body.data),
    "content-categories",
    LOAD_ERROR
  );

  const saveCategory = useCallback(
    async (target: CategoryFormTarget | null, values: CategoryFormValues): Promise<boolean> => {
      try {
        const { data: body } = target
          ? await categoryApi.rename(target.id, { name: values.name })
          : await categoryApi.create({ name: values.name, parentId: values.parentId || null });
        toast.success(body.message);
        reload();
        return true;
      } catch (saveError: unknown) {
        toast.error(getApiErrorMessage(saveError, "Không thể lưu danh mục. Vui lòng thử lại."));
        return false;
      }
    },
    [reload]
  );

  const removeCategory = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { data: body } = await categoryApi.remove(id);
        toast.success(body.message);
        reload();
        return true;
      } catch (removeError: unknown) {
        toast.error(getApiErrorMessage(removeError, "Không thể xóa danh mục. Vui lòng thử lại."));
        return false;
      }
    },
    [reload]
  );

  return { items: data ?? [], error, isLoading, reload, saveCategory, removeCategory };
}
