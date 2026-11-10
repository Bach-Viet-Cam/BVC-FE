import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import { useApiQuery } from "@/shared/hooks/useApiQuery";

export type SheetMusicTarget = { classId: string } | { instrumentId: string };

function cacheKey(target: SheetMusicTarget): string | null {
  if ("classId" in target) return target.classId ? `class-sheet-music:${target.classId}` : null;
  return target.instrumentId ? `instrument-sheet-music:${target.instrumentId}` : null;
}

export function useClassSheetMusic(target: SheetMusicTarget) {
  const { data, isLoading } = useApiQuery(
    cacheKey(target),
    async () => (await assignmentsApi.listClassSheetMusic(target)).data.data
  );
  return { sheets: data ?? [], isLoading };
}
