import { useState } from "react";
import { useApiQuery } from "@/features/classes/hooks/useApiQuery";
import { parseApiError, type ParsedApiError } from "@/features/classes/utils/mapApiErrors";
import { settingsApi } from "@/features/platform/api/settingsApi";
import { type GradingSettings, type GradingSettingsPayload } from "@/features/platform/types/settingsTypes";

export function useGradingSettings() {
  const { data, error, isLoading, reload, setData } = useApiQuery(
    "grading-settings",
    async () => (await settingsApi.getGradingSettings()).data.data
  );
  const [isSaving, setIsSaving] = useState(false);

  const save = async (
    payload: GradingSettingsPayload
  ): Promise<{ settings: GradingSettings; message: string } | { error: ParsedApiError }> => {
    setIsSaving(true);
    try {
      const { data: response } = await settingsApi.updateGradingSettings(payload);
      setData(response.data);
      return { settings: response.data, message: response.message };
    } catch (saveError) {
      return { error: parseApiError(saveError, "Lưu cấu hình chấm điểm thất bại. Vui lòng thử lại.") };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings: data,
    isLoading,
    error: error ? "Tải dữ liệu thất bại. Vui lòng thử lại." : null,
    reload,
    save,
    isSaving,
  };
}
