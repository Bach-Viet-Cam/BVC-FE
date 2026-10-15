import type { PaginatedResponse } from "@/shared/types/commonTypes";
import {
  MOCK_CATEGORIES,
  MOCK_SAVED_SHEETS,
  MOCK_SAVED_SONGS,
  MOCK_SHEETS,
  MOCK_SONGS,
  genreOf,
  instrumentOf,
  levelOf,
} from "@/features/music-library/api/musicLibraryMockData";
import {
  LIBRARY_MESSAGES,
  LIBRARY_PAGE_SIZE,
  MANAGE_PAGE_SIZE,
} from "@/features/music-library/constants/musicLibraryConstants";
import type {
  CoverTone,
  EditableVisibility,
  LibrarySheet,
  LibrarySong,
  ManagedSong,
  MediaFile,
  MusicLibraryApi,
  SheetPayload,
  SheetVersion,
  Song,
  SongPayload,
} from "@/features/music-library/types/musicLibraryTypes";
import { readMediaDuration, readPageCount } from "@/features/music-library/utils/mediaUtils";
import { matchesKeyword, normalizeText } from "@/features/music-library/utils/searchUtils";

const songs: Song[] = structuredClone(MOCK_SONGS);
const sheets: SheetVersion[] = structuredClone(MOCK_SHEETS);
const savedSongs = new Map(MOCK_SAVED_SONGS.map((item) => [item.songId, item.savedAt]));
const savedSheets = new Map(MOCK_SAVED_SHEETS.map((item) => [item.sheetId, item.savedAt]));

const COVER_TONES: CoverTone[] = ["ink", "accent", "tint", "muted", "bar", "gold"];

function delay<T>(value: T, ms = 280): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms));
}

function fail(message: string): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), 200));
}

function now() {
  return new Date().toISOString();
}

function paginate<T>(items: T[], page: number, limit: number): PaginatedResponse<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    data: items.slice((safePage - 1) * limit, safePage * limit),
    total: items.length,
    page: safePage,
    limit,
    totalPages,
  };
}

function findSong(songId: string) {
  return songs.find((item) => item.id === songId);
}

function findSheet(sheetId: string) {
  return sheets.find((item) => item.id === sheetId);
}

function sheetsOfSong(songId: string) {
  return sheets.filter((item) => item.songId === songId);
}

function isSheetAvailable(sheet: SheetVersion) {
  const parent = findSong(sheet.songId);
  return sheet.visibility === "VISIBLE" && parent?.visibility === "VISIBLE";
}

function toManaged(song: Song): ManagedSong {
  const own = sheetsOfSong(song.id);
  return {
    ...song,
    sheetCount: own.length,
    visibleSheetCount: own.filter((item) => item.visibility === "VISIBLE").length,
  };
}

function toLibrarySong(song: Song): LibrarySong {
  return { ...song, isSaved: savedSongs.has(song.id) };
}

function toLibrarySheet(sheet: SheetVersion): LibrarySheet {
  return { ...sheet, isSaved: savedSheets.has(sheet.id) };
}

function sortSheets(list: SheetVersion[]) {
  return [...list].sort((a, b) => Number(b.isMain) - Number(a.isMain) || a.createdAt.localeCompare(b.createdAt));
}

function slugify(value: string) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueId(base: string, exists: (id: string) => boolean) {
  let id = base || "item";
  let counter = 2;
  while (exists(id)) id = `${base}-${counter++}`;
  return id;
}

async function toMediaFile(file: File): Promise<MediaFile> {
  return {
    name: file.name,
    sizeBytes: file.size,
    durationSec: await readMediaDuration(file),
    url: URL.createObjectURL(file),
  };
}

function applySongPayload(target: Song, payload: SongPayload) {
  target.title = payload.title.trim();
  target.composer = payload.composer.trim();
  target.description = payload.description.trim();
  target.genre = genreOf(payload.genreId);
  target.instruments = payload.instrumentIds.map(instrumentOf);
  target.level = levelOf(payload.levelId);
  if (payload.coverFile) target.coverUrl = URL.createObjectURL(payload.coverFile);
  else if (payload.removeCover) target.coverUrl = undefined;
  target.updatedAt = now();
}

function checkSheetRules(songId: string, payload: SheetPayload, editing?: SheetVersion): string | null {
  const siblings = sheetsOfSong(songId).filter((item) => item.id !== editing?.id);
  const hasRecording = Boolean(payload.referenceRecording || editing?.referenceRecording);
  if (payload.isMain && payload.visibility === "VISIBLE" && !hasRecording) {
    return LIBRARY_MESSAGES.mainNeedsRecording;
  }
  const name = normalizeText(payload.name);
  if (siblings.some((item) => normalizeText(item.name) === name)) {
    return "Tên bản đã tồn tại trong bài hát này.";
  }
  const sameInstrument = siblings.filter((item) => item.instrument.id === payload.instrumentId);
  if (payload.isMain && sameInstrument.some((item) => item.isMain)) {
    return "Mỗi bài, mỗi nhạc cụ chỉ có 1 bản chính.";
  }
  if (!payload.isMain && !sameInstrument.some((item) => item.isMain)) {
    return "Bản đầu tiên của nhạc cụ phải là bản chính.";
  }
  return null;
}

export const musicLibraryMockApi: MusicLibraryApi = {
  getCategories: () => delay(MOCK_CATEGORIES, 120),

  listLibrarySongs: (query) => {
    const visible = songs.filter(
      (item) =>
        item.visibility === "VISIBLE" &&
        matchesKeyword(query.keyword, [item.title, item.composer, item.description]) &&
        (!query.genreId || item.genre.id === query.genreId) &&
        (!query.instrumentId || item.instruments.some((instrument) => instrument.id === query.instrumentId)) &&
        (!query.levelId || item.level.id === query.levelId)
    );
    const sorted = [...visible].sort((a, b) => {
      if (query.sort === "title_asc") return a.title.localeCompare(b.title, "vi");
      if (query.sort === "title_desc") return b.title.localeCompare(a.title, "vi");
      return b.createdAt.localeCompare(a.createdAt);
    });
    return delay(paginate(sorted.map(toLibrarySong), query.page, LIBRARY_PAGE_SIZE));
  },

  getLibrarySong: (songId) => {
    const song = findSong(songId);
    if (!song || song.visibility !== "VISIBLE") return fail("Bài hát không tồn tại hoặc đã bị ẩn.");
    const visibleSheets = sortSheets(sheetsOfSong(songId).filter((item) => item.visibility === "VISIBLE"));
    return delay({ ...toLibrarySong(song), sheets: visibleSheets.map(toLibrarySheet) });
  },

  getSheetViewer: (songId, sheetId) => {
    const song = findSong(songId);
    const sheet = findSheet(sheetId);
    if (!song || !sheet || sheet.songId !== songId || !isSheetAvailable(sheet)) {
      return fail("Bản nhạc không tồn tại hoặc đã bị ẩn.");
    }
    const main = sheetsOfSong(songId).find((item) => item.isMain && item.instrument.id === sheet.instrument.id);
    const fallbackRecording = sheet.referenceRecording ? undefined : main?.referenceRecording;
    return delay({ song, sheet: toLibrarySheet(sheet), fallbackRecording });
  },

  saveSong: (songId) => {
    if (!findSong(songId)) return fail("Bài hát không tồn tại.");
    savedSongs.set(songId, now());
    return delay(undefined, 150);
  },

  unsaveSong: (songId) => {
    savedSongs.delete(songId);
    return delay(undefined, 150);
  },

  saveSheet: (sheetId) => {
    if (!findSheet(sheetId)) return fail("Bản nhạc không tồn tại.");
    savedSheets.set(sheetId, now());
    return delay(undefined, 150);
  },

  unsaveSheet: (sheetId) => {
    savedSheets.delete(sheetId);
    return delay(undefined, 150);
  },

  listSavedSongs: () => {
    const items = [...savedSongs.entries()]
      .map(([songId, savedAt]) => {
        const song = findSong(songId);
        return song ? { song, savedAt, isAvailable: song.visibility === "VISIBLE" } : null;
      })
      .filter((item) => item !== null)
      .sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    return delay(items);
  },

  listSavedSheets: () => {
    const items = [...savedSheets.entries()]
      .map(([sheetId, savedAt]) => {
        const sheet = findSheet(sheetId);
        const song = sheet && findSong(sheet.songId);
        if (!sheet || !song) return null;
        return {
          sheet,
          song: { id: song.id, title: song.title, coverTone: song.coverTone, coverUrl: song.coverUrl },
          savedAt,
          isAvailable: isSheetAvailable(sheet),
        };
      })
      .filter((item) => item !== null)
      .sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    return delay(items);
  },

  // Mock coi giảng viên đang đăng nhập là người tạo mọi bài trong store
  listMySongs: (query) => {
    const filtered = songs
      .filter(
        (item) =>
          matchesKeyword(query.keyword, [item.title, item.composer]) &&
          (!query.genreId || item.genre.id === query.genreId) &&
          (!query.instrumentId || item.instruments.some((instrument) => instrument.id === query.instrumentId)) &&
          (!query.levelId || item.level.id === query.levelId) &&
          (!query.visibility || item.visibility === query.visibility)
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return delay(paginate(filtered.map(toManaged), query.page, MANAGE_PAGE_SIZE));
  },

  getMySong: (songId) => {
    const song = findSong(songId);
    return song ? delay(toManaged(song)) : fail("Bài hát không tồn tại.");
  },

  createSong: (payload) => {
    const timestamp = now();
    const song: Song = {
      id: uniqueId(slugify(payload.title), (id) => Boolean(findSong(id))),
      title: "",
      composer: "",
      description: "",
      genre: genreOf(payload.genreId),
      instruments: [],
      level: levelOf(payload.levelId),
      coverTone: COVER_TONES[songs.length % COVER_TONES.length],
      visibility: payload.visibility,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    applySongPayload(song, payload);
    songs.unshift(song);
    return delay(toManaged(song));
  },

  updateSong: (songId, payload) => {
    const song = findSong(songId);
    if (!song) return fail("Bài hát không tồn tại.");
    applySongPayload(song, payload);
    if (song.visibility !== "HIDDEN_BY_ADMIN") song.visibility = payload.visibility;
    return delay(toManaged(song));
  },

  setSongVisibility: (songId, visibility: EditableVisibility) => {
    const song = findSong(songId);
    if (!song) return fail("Bài hát không tồn tại.");
    if (song.visibility === "HIDDEN_BY_ADMIN") return fail(LIBRARY_MESSAGES.hiddenByAdmin);
    song.visibility = visibility;
    song.updatedAt = now();
    return delay(toManaged(song), 180);
  },

  getSongSheets: (songId) => {
    const song = findSong(songId);
    if (!song) return fail("Bài hát không tồn tại.");
    return delay({ song: toManaged(song), sheets: sortSheets(sheetsOfSong(songId)) });
  },

  createSheet: async (songId, payload) => {
    const song = findSong(songId);
    if (!song) return fail("Bài hát không tồn tại.");
    const ruleError = checkSheetRules(songId, payload, undefined);
    if (ruleError) return fail(ruleError);
    if (!payload.sheetFile) return fail("Cần chọn file bản nhạc.");
    const timestamp = now();
    const sheet: SheetVersion = {
      id: uniqueId(`${songId}-${slugify(payload.name)}`, (id) => Boolean(findSheet(id))),
      songId,
      name: payload.name.trim(),
      description: payload.description.trim(),
      instrument: instrumentOf(payload.instrumentId),
      level: levelOf(payload.levelId),
      isMain: payload.isMain,
      sheetFile: {
        ...(await toMediaFile(payload.sheetFile)),
        pageCount: await readPageCount(payload.sheetFile),
        mimeType: payload.sheetFile.type,
      },
      referenceRecording: payload.referenceRecording ? await toMediaFile(payload.referenceRecording) : undefined,
      tutorialVideo: payload.tutorialVideo ? await toMediaFile(payload.tutorialVideo) : undefined,
      visibility: payload.visibility,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    sheets.push(sheet);
    song.updatedAt = timestamp;
    return delay(sheet);
  },

  updateSheet: async (sheetId, payload) => {
    const sheet = findSheet(sheetId);
    if (!sheet) return fail("Bản nhạc không tồn tại.");
    const ruleError = checkSheetRules(sheet.songId, payload, sheet);
    if (ruleError) return fail(ruleError);
    sheet.name = payload.name.trim();
    sheet.description = payload.description.trim();
    sheet.instrument = instrumentOf(payload.instrumentId);
    sheet.level = levelOf(payload.levelId);
    sheet.isMain = payload.isMain;
    if (payload.sheetFile) {
      sheet.sheetFile = {
        ...(await toMediaFile(payload.sheetFile)),
        pageCount: await readPageCount(payload.sheetFile),
        mimeType: payload.sheetFile.type,
      };
    }
    if (payload.referenceRecording) sheet.referenceRecording = await toMediaFile(payload.referenceRecording);
    if (payload.tutorialVideo) sheet.tutorialVideo = await toMediaFile(payload.tutorialVideo);
    if (sheet.visibility !== "HIDDEN_BY_ADMIN") sheet.visibility = payload.visibility;
    sheet.updatedAt = now();
    const song = findSong(sheet.songId);
    if (song) song.updatedAt = sheet.updatedAt;
    return delay(sheet);
  },

  setSheetVisibility: (sheetId, visibility) => {
    const sheet = findSheet(sheetId);
    if (!sheet) return fail("Bản nhạc không tồn tại.");
    if (sheet.visibility === "HIDDEN_BY_ADMIN") return fail(LIBRARY_MESSAGES.hiddenByAdmin);
    if (visibility === "VISIBLE" && sheet.isMain && !sheet.referenceRecording) {
      return fail(LIBRARY_MESSAGES.mainNeedsRecording);
    }
    sheet.visibility = visibility;
    sheet.updatedAt = now();
    return delay(sheet, 180);
  },
};
