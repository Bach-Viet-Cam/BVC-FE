import { assignmentApi } from "@/features/classes/api/assignmentApi";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { useViewerRole } from "@/shared/hooks/useViewerRole";

export function useAssignedSheetId(assignmentId?: string) {
  const enabled = useViewerRole() === "student" && Boolean(assignmentId);
  const { data } = useAsyncData<string | null>(
    () =>
      enabled
        ? assignmentApi.get(assignmentId!).then(({ data: body }) => body.data.sheetMusicId)
        : Promise.resolve(null),
    enabled ? `assignment-sheet:${assignmentId}` : "assignment-sheet:none",
    undefined,
    { cache: true }
  );
  return data;
}
