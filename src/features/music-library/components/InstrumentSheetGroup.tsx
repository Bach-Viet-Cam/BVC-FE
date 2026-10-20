import { Plus } from "lucide-react";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { ManagedSheetItem } from "@/features/music-library/components/ManagedSheetItem";
import type { LecturerSheetMusic, SheetFileSlot } from "@/features/music-library/types/lecturerTypes";
import type { CategoryRef } from "@/features/music-library/types/musicLibraryTypes";

interface InstrumentSheetGroupProps {
  instrument: CategoryRef;
  sheets: LecturerSheetMusic[];
  selectedSheetId?: string;
  busySheetId: string | null;
  onAdd: (instrumentId: string) => void;
  onEdit: (sheet: LecturerSheetMusic) => void;
  onReplaceFile: (sheet: LecturerSheetMusic, slot: SheetFileSlot, file: File) => void;
  onRequestVisibility: (sheet: LecturerSheetMusic, nextVisible: boolean) => void;
}

export function InstrumentSheetGroup({
  instrument,
  sheets,
  selectedSheetId,
  busySheetId,
  onAdd,
  ...itemHandlers
}: InstrumentSheetGroupProps) {
  const headingId = `instrument-${instrument.id}`;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3 border-b border-bvc-border pb-2">
        <h2 id={headingId} className="text-lg font-extrabold tracking-[-0.01em] text-bvc-ink">
          {instrument.name}
        </h2>
        <span className="font-bvc-mono text-[13px] text-bvc-muted">{sheets.length} bản</span>
      </div>

      {sheets.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-[18px] border border-dashed border-bvc-border-strong p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[13.5px] text-bvc-muted">
            Chưa có bản nào. Bản đầu tiên của nhạc cụ sẽ là bản chính.
          </span>
          <ActionButton variant="secondary" size="sm" onClick={() => onAdd(instrument.id)}>
            <Plus className="size-4" aria-hidden />
            Thêm bản chính
          </ActionButton>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {sheets.map((sheet) => (
            <ManagedSheetItem
              key={sheet.id}
              sheet={sheet}
              isSelected={sheet.id === selectedSheetId}
              isBusy={sheet.id === busySheetId}
              {...itemHandlers}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
