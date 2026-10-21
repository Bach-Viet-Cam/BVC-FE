import { ListState } from "@/features/classes/components/ListState";
import { type ApiFieldError } from "@/features/classes/types/classTypes";
import { GradingSettingsForm } from "@/features/platform/components/GradingSettingsForm";
import { useGradingSettings } from "@/features/platform/hooks/useGradingSettings";
import { type GradingSettingsPayload } from "@/features/platform/types/settingsTypes";
import { AdminShell } from "@/shared/components/bvc/AdminShell";
import { toast } from "@/shared/components/ui/toast";

// TODO(M06): move into the real system configuration screen.
export function GradingSettingsPage() {
  const { settings, isLoading, error, reload, save, isSaving } = useGradingSettings();

  const handleSubmit = async (payload: GradingSettingsPayload): Promise<ApiFieldError[] | null> => {
    const result = await save(payload);
    if ("settings" in result) {
      toast.success(result.message);
      return null;
    }
    if (result.error.fieldErrors.length === 0) toast.error(result.error.message);
    return result.error.fieldErrors;
  };

  return (
    <AdminShell title="Cấu hình chấm điểm" subtitle="Ngưỡng độ chính xác dùng để xếp trạng thái tiến độ của sinh viên">
      {settings ? (
        <GradingSettingsForm
          key={settings.updatedAt ?? "settings"}
          settings={settings}
          isSaving={isSaving}
          onSubmit={handleSubmit}
        />
      ) : (
        <div className="max-w-[560px]">
          <ListState isLoading={isLoading} error={error} isEmpty={false} emptyMessage="" onRetry={reload}>
            {null}
          </ListState>
        </div>
      )}
    </AdminShell>
  );
}
