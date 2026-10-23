import { useState } from "react";
import { progressApi } from "@/features/classes/api/progressApi";
import { useAsyncData } from "@/shared/hooks/useAsyncData";

const LOAD_ERROR = "Tải dữ liệu thất bại. Vui lòng thử lại.";

// Class picker of the progress screen; the board itself loads through useClassProgress.
export function useStudentProgress() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const classes = useAsyncData(() => progressApi.listClasses().then(({ data }) => data.data), "classes", LOAD_ERROR);

  return {
    classes: classes.data ?? [],
    classId: selectedClassId ?? classes.data?.[0]?.id ?? null,
    setClassId: setSelectedClassId,
    isLoading: classes.isLoading,
    error: classes.error,
    reload: classes.reload,
  };
}
