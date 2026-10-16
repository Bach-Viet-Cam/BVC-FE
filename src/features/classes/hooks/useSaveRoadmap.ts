import { useState } from "react";
import { roadmapsApi } from "@/features/classes/api/roadmapsApi";
import { type RoadmapVersion, type SaveRoadmapPayload } from "@/features/classes/types/roadmapTypes";
import { type ParsedApiError, parseApiError } from "@/features/classes/utils/mapApiErrors";

type SaveRoadmapResult = { roadmap: RoadmapVersion; message: string } | { error: ParsedApiError };

export function useSaveRoadmap(instrumentId: string | null) {
  const [isSaving, setIsSaving] = useState(false);

  const saveRoadmap = async (payload: SaveRoadmapPayload): Promise<SaveRoadmapResult> => {
    setIsSaving(true);
    try {
      const { data } = await roadmapsApi.saveRoadmapVersion(instrumentId as string, payload);
      return { roadmap: data.data, message: data.message };
    } catch (error) {
      return { error: parseApiError(error, "Lưu lộ trình thất bại. Vui lòng thử lại.") };
    } finally {
      setIsSaving(false);
    }
  };

  return { saveRoadmap, isSaving };
}
