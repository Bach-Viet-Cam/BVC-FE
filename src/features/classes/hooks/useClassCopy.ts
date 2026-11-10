import { useCallback, useRef, useState } from "react";
import { classesApi } from "@/features/classes/api/classesApi";
import {
  type ApiFieldError,
  type ClassCopySource,
  type CopyAssignmentPayload,
  type CopyAssignmentRow,
} from "@/features/classes/types/classTypes";
import {
  type AssignmentContentPayload,
  type AssignmentSheetMusic,
} from "@/features/classes/types/teacherAssignmentTypes";
import {
  buildCopyAssignments,
  COPY_KIND_DUPLICATED,
  findKindConflicts,
  mapCopyErrors,
  toCopyRows,
} from "@/features/classes/utils/classCopy";
import { parseApiError } from "@/features/classes/utils/mapApiErrors";
import { toast } from "@/shared/components/ui/toast";

interface CopyState {
  source: ClassCopySource | null;
  rows: CopyAssignmentRow[];
}

const EMPTY: CopyState = { source: null, rows: [] };

const DUPLICATE_ERRORS: ReadonlySet<string> = new Set([COPY_KIND_DUPLICATED("SOLO"), COPY_KIND_DUPLICATED("ENSEMBLE")]);

// Applies an edit to one row (or all), then re-checks rows that carry a duplicate-kind error.
function refreshDuplicateErrors(list: CopyAssignmentRow[]): CopyAssignmentRow[] {
  const conflicts = findKindConflicts(list);
  return list.map((r) =>
    r.error && DUPLICATE_ERRORS.has(r.error) ? { ...r, error: conflicts.get(r.key) ?? null } : r
  );
}

// State of the "copy from an existing class" section of the create-class form.
export function useClassCopy() {
  const [state, setState] = useState<CopyState>(EMPTY);
  const [isLoading, setIsLoading] = useState(false);
  const { source, rows } = state;
  const requestId = useRef(0);

  const mapRows = useCallback((fn: (rows: CopyAssignmentRow[]) => CopyAssignmentRow[]) => {
    setState((prev) => ({ ...prev, rows: fn(prev.rows) }));
  }, []);

  const selectSource = useCallback(async (classId: string): Promise<boolean> => {
    const id = ++requestId.current;
    setIsLoading(true);
    try {
      const response = await classesApi.getCopySource(classId);
      if (id !== requestId.current) return false;
      const data = response.data.data;
      setState({ source: data, rows: toCopyRows(data) });
      return true;
    } catch (error) {
      if (id !== requestId.current) return false;
      toast.error(parseApiError(error, "Không thể tải thông tin lớp nguồn. Vui lòng thử lại.").message);
      return false;
    } finally {
      if (id === requestId.current) setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    requestId.current++;
    setIsLoading(false);
    setState(EMPTY);
  }, []);

  const toggle = useCallback(
    (key: string) =>
      mapRows((list) =>
        refreshDuplicateErrors(list.map((r) => (r.key === key ? { ...r, checked: !r.checked, error: null } : r)))
      ),
    [mapRows]
  );

  const toggleAll = useCallback(
    (checked: boolean) => mapRows((list) => refreshDuplicateErrors(list.map((r) => ({ ...r, checked, error: null })))),
    [mapRows]
  );

  const updateRow = useCallback(
    (key: string, content: AssignmentContentPayload, sheetMusic: AssignmentSheetMusic | null) =>
      mapRows((list) =>
        refreshDuplicateErrors(list.map((r) => (r.key === key ? { ...r, content, sheetMusic, error: null } : r)))
      ),
    [mapRows]
  );

  const validate = useCallback((): boolean => {
    const conflicts = findKindConflicts(rows);
    mapRows((list) => list.map((r) => ({ ...r, error: conflicts.get(r.key) ?? null })));
    return conflicts.size === 0;
  }, [rows, mapRows]);

  const applyServerErrors = useCallback(
    (fieldErrors: ApiFieldError[]): ApiFieldError[] => {
      const { rowErrors, rest } = mapCopyErrors(rows, fieldErrors);
      if (rowErrors.size > 0) {
        mapRows((list) => list.map((r) => (rowErrors.has(r.key) ? { ...r, error: rowErrors.get(r.key) ?? null } : r)));
      }
      return rest;
    },
    [rows, mapRows]
  );

  const payload = useCallback((): { sourceClassId: string; assignments: CopyAssignmentPayload[] } | null => {
    if (!source) return null;
    return { sourceClassId: source.id, assignments: buildCopyAssignments(rows) };
  }, [source, rows]);

  return {
    source,
    rows,
    isLoading,
    selectSource,
    clear,
    toggle,
    toggleAll,
    updateRow,
    validate,
    applyServerErrors,
    payload,
  };
}
