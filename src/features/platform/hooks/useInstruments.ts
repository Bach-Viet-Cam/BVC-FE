import { useCallback, useState } from "react";
import { instrumentApi } from "@/features/platform/api/instrumentApi";
import {
  type InstrumentItem,
  type InstrumentListParams,
  type InstrumentSortKey,
  type InstrumentStatusFilter,
} from "@/features/platform/types/configTypes";
import { type InstrumentFormValues } from "@/features/platform/utils/validateInstrument";
import { toast } from "@/shared/components/ui/toast";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { type SortDirection } from "@/shared/types/commonTypes";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

export interface InstrumentFilters {
  q: string;
  status: InstrumentStatusFilter;
  sortBy: InstrumentSortKey;
  sortDir: SortDirection;
}

const INITIAL_FILTERS: InstrumentFilters = { q: "", status: "all", sortBy: "name", sortDir: "asc" };
const LOAD_ERROR = "Tải dữ liệu thất bại. Vui lòng thử lại.";

export function useInstruments() {
  const [filters, setFilters] = useState<InstrumentFilters>(INITIAL_FILTERS);
  const params: InstrumentListParams = {
    q: filters.q || undefined,
    status: filters.status,
    sortBy: filters.sortBy,
    sortDir: filters.sortDir,
  };
  const { data, error, isLoading, reload } = useAsyncData<InstrumentItem[]>(
    () => instrumentApi.list(params).then(({ data: body }) => body.data),
    JSON.stringify(params),
    LOAD_ERROR
  );

  const updateFilters = useCallback((next: Partial<InstrumentFilters>) => {
    setFilters((previous) => ({ ...previous, ...next }));
  }, []);

  const saveInstrument = useCallback(
    async (instrumentId: string | null, values: InstrumentFormValues): Promise<boolean> => {
      try {
        const description = values.description || undefined;
        const { data: body } = instrumentId
          ? await instrumentApi.update(instrumentId, { name: values.name, description: values.description || null })
          : await instrumentApi.create({ code: values.code, name: values.name, description });
        toast.success(body.message);
        reload();
        return true;
      } catch (saveError: unknown) {
        toast.error(getApiErrorMessage(saveError, "Không thể lưu nhạc cụ. Vui lòng thử lại."));
        return false;
      }
    },
    [reload]
  );

  const toggleActive = useCallback(
    async (instrument: InstrumentItem): Promise<void> => {
      try {
        const { data: body } = instrument.isActive
          ? await instrumentApi.deactivate(instrument.id)
          : await instrumentApi.activate(instrument.id);
        toast.success(body.message);
        reload();
      } catch (toggleError: unknown) {
        toast.error(getApiErrorMessage(toggleError, "Không thể cập nhật nhạc cụ. Vui lòng thử lại."));
      }
    },
    [reload]
  );

  return { filters, updateFilters, items: data ?? [], error, isLoading, reload, saveInstrument, toggleActive };
}
