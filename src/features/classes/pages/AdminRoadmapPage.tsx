import { useState } from "react";
import { ListState } from "@/features/classes/components/ListState";
import { RoadmapEditor } from "@/features/classes/components/RoadmapEditor";
import { RoadmapInstrumentList } from "@/features/classes/components/RoadmapInstrumentList";
import { useAdminRoadmap } from "@/features/classes/hooks/useAdminRoadmap";
import { useAdminRoadmapList } from "@/features/classes/hooks/useAdminRoadmapList";
import { useSaveRoadmap } from "@/features/classes/hooks/useSaveRoadmap";
import { type ApiFieldError } from "@/features/classes/types/classTypes";
import { type SaveRoadmapPayload } from "@/features/classes/types/roadmapTypes";
import { AdminShell } from "@/shared/components/bvc/AdminShell";
import { toast } from "@/shared/components/ui/toast";

// UC-11 "Quản Lý Lộ Trình" (System Admin, desktop).
export function AdminRoadmapPage() {
  const [chosenInstrumentId, setChosenInstrumentId] = useState<string | null>(null);
  const list = useAdminRoadmapList();
  const selectedInstrumentId = chosenInstrumentId ?? list.items[0]?.instrument.id ?? null;
  const { roadmap, isLoading, error, reload } = useAdminRoadmap(selectedInstrumentId);
  const { saveRoadmap, isSaving } = useSaveRoadmap(selectedInstrumentId);

  const handleSave = async (payload: SaveRoadmapPayload): Promise<ApiFieldError[] | null> => {
    const result = await saveRoadmap(payload);
    if ("roadmap" in result) {
      toast.success(result.message);
      list.reload();
      reload();
      return null;
    }
    const weekFieldErrors = result.error.fieldErrors.filter((fieldError) => fieldError.field.startsWith("weeks."));
    if (weekFieldErrors.length === 0) toast.error(result.error.fieldErrors[0]?.message ?? result.error.message);
    return weekFieldErrors;
  };

  return (
    <AdminShell title="Quản lý lộ trình" subtitle="Lộ trình 6 tuần theo nhạc cụ · lưu tạo phiên bản mới">
      <div className="grid min-w-0 gap-[16px] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)]">
        <ListState isLoading={list.isLoading} error={list.error} isEmpty={false} emptyMessage="" onRetry={list.reload}>
          <RoadmapInstrumentList
            items={list.items}
            selectedInstrumentId={selectedInstrumentId}
            onSelect={setChosenInstrumentId}
          />
        </ListState>
        <div className="min-w-0">
          {roadmap && !isLoading && !error ? (
            <RoadmapEditor
              key={`${roadmap.instrument.id}:${roadmap.id ?? "template"}`}
              roadmap={roadmap}
              isSaving={isSaving}
              onSave={handleSave}
            />
          ) : (
            <ListState
              isLoading={isLoading}
              error={error}
              isEmpty={!selectedInstrumentId}
              emptyMessage="Chọn một nhạc cụ để xem lộ trình."
              onRetry={reload}
            >
              {null}
            </ListState>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
