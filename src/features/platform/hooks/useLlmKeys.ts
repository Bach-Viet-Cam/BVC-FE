import { useCallback } from "react";
import { llmKeyApi } from "@/features/platform/api/llmKeyApi";
import type { LlmKeyCreateInput, LlmKeyItem, LlmKeyUpdateInput } from "@/features/platform/types/llmKeyTypes";
import { toast } from "@/shared/components/ui/toast";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

const LOAD_ERROR = "Tải danh sách API key thất bại. Vui lòng thử lại.";

// create/update/remove trả về null khi thành công, hoặc thông báo lỗi để hiện cho người dùng.
// Hook không giữ giá trị key: nó chỉ chuyển body xuống API rồi bỏ.
export function useLlmKeys() {
  const { data, error, isLoading, reload } = useAsyncData<LlmKeyItem[]>(
    () => llmKeyApi.list(),
    "admin-llm-keys",
    LOAD_ERROR
  );

  const run = useCallback(
    async (action: () => Promise<unknown>, success: string, fallback: string): Promise<string | null> => {
      try {
        await action();
      } catch (actionError: unknown) {
        return getApiErrorMessage(actionError, fallback);
      }
      toast.success(success);
      reload();
      return null;
    },
    [reload]
  );

  const create = useCallback(
    (body: LlmKeyCreateInput) => run(() => llmKeyApi.create(body), "Đã thêm API key.", "Không thể thêm API key."),
    [run]
  );
  const update = useCallback(
    (id: string, body: LlmKeyUpdateInput) =>
      run(() => llmKeyApi.update(id, body), "Đã cập nhật API key.", "Không thể cập nhật API key."),
    [run]
  );
  const remove = useCallback(
    (id: string) => run(() => llmKeyApi.remove(id), "Đã xóa API key.", "Không thể xóa API key."),
    [run]
  );

  return { items: data ?? [], loading: isLoading, error, create, update, remove, reload };
}
