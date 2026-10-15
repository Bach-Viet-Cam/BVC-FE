import type { PaginatedResponse } from "@/shared/types/commonTypes";

export type Visibility = "VISIBLE" | "HIDDEN" | "HIDDEN_BY_ADMIN";
export type EditableVisibility = Exclude<Visibility, "HIDDEN_BY_ADMIN">;

export type CoverTone = "ink" | "accent" | "tint" | "muted" | "bar" | "gold";

export type LibrarySort = "newest" | "title_asc" | "title_desc";

export interface CategoryRef {
  id: string;
  name: string;
}

export interface MusicCategories {
  genres: CategoryRef[];
  instruments: CategoryRef[];
  levels: CategoryRef[];
}

export interface MediaFile {
  name: string;
  sizeBytes?: number;
  durationSec?: number;
  url?: string;
}

export interface SheetFile extends MediaFile {
  pageCount: number;
  mimeType: string;
}

export interface Song {
  id: string;
  title: string;
  composer: string;
  description: string;
  genre: CategoryRef;
  instruments: CategoryRef[];
  level: CategoryRef;
  coverUrl?: string;
  coverTone: CoverTone;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
}

export interface SheetVersion {
  id: string;
  songId: string;
  name: string;
  description: string;
  instrument: CategoryRef;
  level: CategoryRef;
  isMain: boolean;
  sheetFile: SheetFile;
  referenceRecording?: MediaFile;
  tutorialVideo?: MediaFile;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
}

export interface LibrarySong extends Song {
  isSaved: boolean;
}

export interface LibrarySheet extends SheetVersion {
  isSaved: boolean;
}

export interface LibrarySongDetail extends LibrarySong {
  sheets: LibrarySheet[];
}

export interface SheetViewerData {
  song: Song;
  sheet: LibrarySheet;
  // Bản theo độ khó không có bản thu mẫu thì dùng bản thu của bản chính cùng nhạc cụ
  fallbackRecording?: MediaFile;
}

export interface ManagedSong extends Song {
  sheetCount: number;
  visibleSheetCount: number;
}

export interface SongSheetsData {
  song: ManagedSong;
  sheets: SheetVersion[];
}

export interface SavedSong {
  song: Song;
  savedAt: string;
  isAvailable: boolean;
}

export interface SavedSheet {
  sheet: SheetVersion;
  song: Pick<Song, "id" | "title" | "coverTone" | "coverUrl">;
  savedAt: string;
  isAvailable: boolean;
}

export interface LibrarySongQuery {
  keyword: string;
  genreId: string;
  instrumentId: string;
  levelId: string;
  sort: LibrarySort;
  page: number;
}

export interface ManagedSongQuery {
  keyword: string;
  genreId: string;
  instrumentId: string;
  levelId: string;
  visibility: Visibility | "";
  page: number;
}

export interface SongPayload {
  title: string;
  composer: string;
  description: string;
  genreId: string;
  instrumentIds: string[];
  levelId: string;
  visibility: EditableVisibility;
  coverFile: File | null;
  removeCover: boolean;
}

export interface SheetPayload {
  name: string;
  description: string;
  instrumentId: string;
  levelId: string;
  isMain: boolean;
  visibility: EditableVisibility;
  sheetFile: File | null;
  referenceRecording: File | null;
  tutorialVideo: File | null;
}

export interface MusicLibraryApi {
  getCategories: () => Promise<MusicCategories>;
  listLibrarySongs: (query: LibrarySongQuery) => Promise<PaginatedResponse<LibrarySong>>;
  getLibrarySong: (songId: string) => Promise<LibrarySongDetail>;
  getSheetViewer: (songId: string, sheetId: string) => Promise<SheetViewerData>;
  saveSong: (songId: string) => Promise<void>;
  unsaveSong: (songId: string) => Promise<void>;
  saveSheet: (sheetId: string) => Promise<void>;
  unsaveSheet: (sheetId: string) => Promise<void>;
  listSavedSongs: () => Promise<SavedSong[]>;
  listSavedSheets: () => Promise<SavedSheet[]>;
  listMySongs: (query: ManagedSongQuery) => Promise<PaginatedResponse<ManagedSong>>;
  getMySong: (songId: string) => Promise<ManagedSong>;
  createSong: (payload: SongPayload) => Promise<ManagedSong>;
  updateSong: (songId: string, payload: SongPayload) => Promise<ManagedSong>;
  setSongVisibility: (songId: string, visibility: EditableVisibility) => Promise<ManagedSong>;
  getSongSheets: (songId: string) => Promise<SongSheetsData>;
  createSheet: (songId: string, payload: SheetPayload) => Promise<SheetVersion>;
  updateSheet: (sheetId: string, payload: SheetPayload) => Promise<SheetVersion>;
  setSheetVisibility: (sheetId: string, visibility: EditableVisibility) => Promise<SheetVersion>;
}
