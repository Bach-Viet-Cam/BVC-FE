import type { CategoryRef, SheetVersion } from "@/features/music-library/types/musicLibraryTypes";

export interface InstrumentSheetGroup<T extends SheetVersion> {
  instrument: CategoryRef;
  sheets: T[];
}

// Bản chính đứng đầu nhóm, các bản theo độ khó theo thứ tự tạo
export function groupSheetsByInstrument<T extends SheetVersion>(
  sheets: T[],
  instrumentOrder: CategoryRef[] = []
): InstrumentSheetGroup<T>[] {
  const groups = new Map<string, InstrumentSheetGroup<T>>();
  instrumentOrder.forEach((instrument) => groups.set(instrument.id, { instrument, sheets: [] }));
  sheets.forEach((sheet) => {
    const group = groups.get(sheet.instrument.id) ?? { instrument: sheet.instrument, sheets: [] };
    group.sheets.push(sheet);
    groups.set(sheet.instrument.id, group);
  });
  return [...groups.values()].map((group) => ({
    ...group,
    sheets: [...group.sheets].sort(
      (a, b) => Number(b.isMain) - Number(a.isMain) || a.createdAt.localeCompare(b.createdAt)
    ),
  }));
}

export function sheetViewerHref(songId: string, sheetId: string) {
  return `/library/${songId}/sheets/${sheetId}`;
}
