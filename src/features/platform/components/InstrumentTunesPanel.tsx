import { useMemo } from "react";
import { Music2 } from "lucide-react";
import { InstrumentTunesEditor } from "@/features/platform/components/InstrumentTunesEditor";
import { useInstruments } from "@/features/platform/hooks/useInstruments";
import { cn } from "@/shared/utils/cn";

export interface InstrumentTunesPanelProps {
  selectedInstrumentId: string | null;
  onSelectInstrument: (instrumentId: string) => void;
}

export function InstrumentTunesPanel({
  selectedInstrumentId,
  onSelectInstrument,
}: InstrumentTunesPanelProps) {
  const { items, isLoading, error, reload } = useInstruments();

  const effectiveInstrumentId = useMemo(() => {
    if (selectedInstrumentId && items.some((item) => item.id === selectedInstrumentId)) {
      return selectedInstrumentId;
    }
    return items[0]?.id ?? null;
  }, [selectedInstrumentId, items]);

  const selectedInstrument = useMemo(() => {
    return items.find((item) => item.id === effectiveInstrumentId) ?? null;
  }, [items, effectiveInstrumentId]);

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)]">
        <section className="flex flex-col gap-2 rounded-[18px] border border-bvc-border bg-white p-4 self-start shadow-none">
          <div className="flex items-center justify-between pb-2 border-b border-bvc-border">
            <div className="flex items-center gap-2">
              <Music2 size={16} className="text-bvc-ink" />
              <h2 className="text-[15px] font-extrabold tracking-[-0.01em] text-bvc-ink">Nhạc cụ</h2>
            </div>
            <span className="font-mono text-[12px] text-bvc-muted">{items.length}</span>
          </div>

          {isLoading && (
            <div className="py-8 text-center text-[13px] text-bvc-muted">
              Đang tải danh sách nhạc cụ...
            </div>
          )}

          {error && !isLoading && (
            <div className="py-6 text-center text-[12.5px] text-bvc-error">
              <p>{error}</p>
              <button
                type="button"
                onClick={reload}
                className="mt-2 text-[12px] font-semibold text-bvc-ink underline"
              >
                Thử lại
              </button>
            </div>
          )}

          {!isLoading && !error && items.length === 0 && (
            <div className="py-8 text-center text-[13px] text-bvc-muted">
              Chưa có nhạc cụ nào trong hệ thống.
            </div>
          )}

          {!isLoading && !error && items.length > 0 && (
            <div className="flex flex-col gap-1 max-h-[500px] overflow-y-auto pr-1">
              {items.map((item) => {
                const isSelected = item.id === effectiveInstrumentId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onSelectInstrument(item.id)}
                    className={cn(
                      "flex min-h-[44px] cursor-pointer items-center justify-between gap-2.5 rounded-[12px] px-3 py-2 text-left transition-colors",
                      isSelected
                        ? "bg-bvc-soft text-bvc-ink border border-bvc-border font-bold shadow-2xs"
                        : "text-bvc-ink hover:bg-bvc-surface/60"
                    )}
                  >
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[13.5px] font-semibold">{item.name}</span>
                      <span className="font-mono text-[11px] text-bvc-muted">{item.code}</span>
                    </div>

                    <span
                      className={cn(
                        "shrink-0 rounded-md border px-1.5 py-0.5 text-[11px] font-medium font-mono",
                        (item.tunesCount ?? 0) > 0
                          ? "border-bvc-border bg-bvc-surface text-bvc-ink"
                          : "border-dashed border-bvc-border text-bvc-muted"
                      )}
                    >
                      {(item.tunesCount ?? 0) > 0 ? `${item.tunesCount} dây` : "Chưa có dây"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <div className="min-w-0">
          <InstrumentTunesEditor
            instrument={selectedInstrument}
            onSaved={reload}
          />
        </div>
      </div>
  );
}
