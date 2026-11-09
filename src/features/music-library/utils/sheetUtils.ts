import type { CategoryRef, SheetVersion } from "@/features/music-library/types/musicLibraryTypes";
import type { LecturerSheetMusic, LecturerSheetMusicList } from "@/features/music-library/types/lecturerTypes";

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

// assignmentId đi kèm khi học viên mở bài từ một bài tập, để bài nộp được tính cho bài tập đó
export function sheetViewerHref(songId: string, sheetId: string, assignmentId?: string) {
  const query = assignmentId ? `?assignmentId=${encodeURIComponent(assignmentId)}` : "";
  return `/library/${songId}/sheets/${sheetId}${query}`;
}

export function pickMainSheet<T extends SheetVersion>(sheets: T[]): T | undefined {
  return sheets.find((sheet) => sheet.isMain) ?? [...sheets].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

interface InstrumentCardOptions {
  assignedSheetId?: string | null;
  classInstrumentId?: string | null;
}

export function buildInstrumentCards<T extends SheetVersion>(sheets: T[], options: InstrumentCardOptions) {
  const assigned = sheets.find((sheet) => sheet.id === options.assignedSheetId);
  const priorityInstrumentId = assigned?.instrument.id ?? options.classInstrumentId ?? null;
  return groupSheetsByInstrument(sheets)
    .filter((group) => group.sheets.length > 0)
    .sort((a, b) => Number(b.instrument.id === priorityInstrumentId) - Number(a.instrument.id === priorityInstrumentId))
    .map(({ instrument, sheets: groupSheets }) => {
      const isAssigned = assigned?.instrument.id === instrument.id;
      const featured = (isAssigned ? assigned : pickMainSheet(groupSheets))!;
      return {
        instrument,
        featured,
        isFeaturedAssigned: isAssigned,
        secondary: groupSheets.filter((sheet) => sheet !== featured),
      };
    });
}

export function practiceHref(sheetId: string, assignmentId?: string) {
  const query = assignmentId ? `?assignmentId=${encodeURIComponent(assignmentId)}` : "";
  return `/practice/sheets/${sheetId}/record${query}`;
}

export interface LecturerInstrumentGroup {
  instrument: CategoryRef;
  sheets: LecturerSheetMusic[];
}

// Nhạc cụ của bài hát lấy từ bản nhạc: chỉ những nhạc cụ đã có bản mới thành nhóm
export function lecturerSheetGroups(list: LecturerSheetMusicList): LecturerInstrumentGroup[] {
  return list.groups.map((group) => ({ instrument: group.instrument, sheets: group.items }));
}
