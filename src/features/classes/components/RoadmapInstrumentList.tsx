import { StatusLabel } from "@/features/classes/components/StatusLabel";
import { type AdminRoadmapListItem } from "@/features/classes/types/roadmapTypes";
import { formatDate } from "@/shared/utils/formatDate";
import { cn } from "@/shared/utils/cn";

interface RoadmapInstrumentListProps {
  items: AdminRoadmapListItem[];
  selectedInstrumentId: string | null;
  onSelect: (instrumentId: string) => void;
}

export function RoadmapInstrumentList({ items, selectedInstrumentId, onSelect }: RoadmapInstrumentListProps) {
  return (
    <section className="flex flex-col gap-[12px] self-start rounded-[18px] border border-bvc-border p-[16px]">
      <h2 className="m-0 text-[15px] font-extrabold tracking-[-0.01em]">Nhạc cụ</h2>
      {items.length === 0 && <span className="text-[13px] text-bvc-muted">Chưa có nhạc cụ đang hoạt động.</span>}
      {items.map((item) => {
        const isSelected = item.instrument.id === selectedInstrumentId;
        return (
          <button
            key={item.instrument.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(item.instrument.id)}
            className={cn(
              "flex min-h-[44px] cursor-pointer items-center gap-[10px] rounded-[13px] border-t border-bvc-border px-[10px] py-[10px] text-left",
              isSelected && "bg-bvc-soft"
            )}
          >
            <span className="grow text-[14px] font-semibold">{item.instrument.name}</span>
            <StatusLabel
              tone={item.latestVersion ? "ok" : "warn"}
              label={
                item.latestVersion
                  ? `Phiên bản v${item.latestVersion.version} · ${formatDate(item.latestVersion.createdAt)}`
                  : "Chưa có lộ trình"
              }
            />
          </button>
        );
      })}
    </section>
  );
}
