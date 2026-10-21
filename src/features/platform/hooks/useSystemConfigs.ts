import { useCallback, useState } from "react";
import { systemConfigApi } from "@/features/platform/api/systemConfigApi";
import {
  type ConfigGroup,
  type SystemConfigItem,
  type SystemConfigListParams,
} from "@/features/platform/types/configTypes";
import { fromFormValue } from "@/features/platform/utils/configValue";
import { toast } from "@/shared/components/ui/toast";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

export interface SystemConfigFilters {
  group?: ConfigGroup;
  q: string;
}

const LOAD_ERROR = "Tải dữ liệu thất bại. Vui lòng thử lại.";

export function useSystemConfigs() {
  const [filters, setFilters] = useState<SystemConfigFilters>({ q: "" });
  const params: SystemConfigListParams = {
    group: filters.group,
    q: filters.q || undefined,
    sortBy: "group",
    sortDir: "asc",
  };
  const { data, error, isLoading, reload } = useAsyncData<SystemConfigItem[]>(
    () => systemConfigApi.list(params).then(({ data: body }) => body.data),
    JSON.stringify(params),
    LOAD_ERROR
  );

  const updateFilters = useCallback((next: Partial<SystemConfigFilters>) => {
    setFilters((previous) => ({ ...previous, ...next }));
  }, []);

  const saveValue = useCallback(
    async (config: SystemConfigItem, text: string): Promise<string | null> => {
      try {
        const { data: body } = await systemConfigApi.updateValue(config.id, fromFormValue(config, text));
        toast.success(body.message);
        reload();
        return null;
      } catch (saveError: unknown) {
        return getApiErrorMessage(saveError, "Không thể lưu tham số. Vui lòng thử lại.");
      }
    },
    [reload]
  );

  return { filters, updateFilters, items: data ?? [], error, isLoading, saveValue, reload };
}
