import { useCallback, useState } from "react";
import { progressApi } from "@/features/classes/api/progressApi";
import {
  type ProgressParams,
  type ProgressResult,
  type ProgressSortKey,
  type ProgressStatus,
} from "@/features/classes/types/progressTypes";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { type SortDirection } from "@/shared/types/commonTypes";

export interface ProgressFilters {
  status?: ProgressStatus;
  q: string;
  sortBy: ProgressSortKey;
  sortDir: SortDirection;
}

const LOAD_ERROR = "Tải dữ liệu thất bại. Vui lòng thử lại.";

export function useStudentProgress() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProgressFilters>({ q: "", sortBy: "studentCode", sortDir: "asc" });

  const classes = useAsyncData(() => progressApi.listClasses().then(({ data }) => data.data), "classes", LOAD_ERROR);
  const classId = selectedClassId ?? classes.data?.[0]?.id ?? null;

  const params: ProgressParams = {
    status: filters.status,
    q: filters.q || undefined,
    sortBy: filters.sortBy,
    sortDir: filters.sortDir,
  };
  const progress = useAsyncData<ProgressResult | null>(
    () => (classId ? progressApi.getProgress(classId, params).then(({ data }) => data.data) : Promise.resolve(null)),
    JSON.stringify([classId, params]),
    LOAD_ERROR
  );

  const updateFilters = useCallback((next: Partial<ProgressFilters>) => {
    setFilters((previous) => ({ ...previous, ...next }));
  }, []);

  return {
    classes: classes.data ?? [],
    classId,
    setClassId: setSelectedClassId,
    filters,
    updateFilters,
    result: progress.data,
    isLoading: classes.isLoading || progress.isLoading,
    error: classes.error ?? progress.error,
  };
}
