import type { PaginatedResponse } from "@/shared/types/commonTypes";

export type Visibility = "PUBLIC" | "HIDDEN" | "ADMIN_HIDDEN";
export type EditableVisibility = Exclude<Visibility, "ADMIN_HIDDEN">;

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
  // Danh sách thư viện chỉ có số nhạc cụ; trang chi tiết mới có tên từng nhạc cụ
  instruments: CategoryRef[];
  instrumentCount: number;
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
  // Cần ít nhất một bản chính công khai có bản thu mẫu
  canPracticeEnsemble: boolean;
  defaultInstrumentId: string | null;
}

export interface SheetPracticeState {
  isAvailable: boolean;
  reason: string | null;
}

export interface SheetViewerData {
  song: Pick<Song, "id" | "title" | "coverTone" | "coverUrl">;
  sheet: LibrarySheet;
  // Bản theo độ khó không có bản thu mẫu thì dùng bản thu của bản chính cùng nhạc cụ
  fallbackRecording?: MediaFile;
  practice: SheetPracticeState;
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

// Thư viện & danh sách đã lưu; API giảng viên nằm ở lecturerApi
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
}

// Dữ liệu thô BE trả về cho thư viện / đã lưu; musicLibraryApi chuyển sang các kiểu ở trên
export interface PlayableMediaDto {
  url: string | null;
  durationSec: number | null;
  mimeType: string;
  isFallback: boolean;
}

export interface MediaFileDto {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number | null;
  durationSec: number | null;
  pageCount: number | null;
  url: string | null;
}

export interface LibraryPieceCardDto {
  id: string;
  title: string;
  composer: string | null;
  coverUrl: string | null;
  genre: CategoryRef;
  level: CategoryRef;
  instrumentCount: number;
  isSaved: boolean;
  createdAt: string;
}

export interface LibrarySheetCardDto {
  id: string;
  name: string;
  description: string | null;
  isMain: boolean;
  level: CategoryRef;
  durationSec: number | null;
  hasReferenceAudio: boolean;
  hasTutorialVideo: boolean;
  isSaved: boolean;
}

export interface LibraryMainSheetDto extends LibrarySheetCardDto {
  referenceAudio: PlayableMediaDto | null;
  tutorialVideo: PlayableMediaDto | null;
}

export interface LibraryPieceTabDto {
  instrument: CategoryRef;
  sheetMusicCount: number;
  main: LibraryMainSheetDto | null;
  others: LibrarySheetCardDto[];
}

export interface LibraryPieceDetailDto extends LibraryPieceCardDto {
  description: string | null;
  canPracticeEnsemble: boolean;
  defaultInstrumentId: string | null;
  tabs: LibraryPieceTabDto[];
}

export interface LibrarySheetViewerDto {
  sheetMusic: LibrarySheetCardDto & { instrument: CategoryRef };
  piece: { id: string; title: string; coverUrl: string | null };
  sheetFile: MediaFileDto;
  referenceAudio: PlayableMediaDto | null;
  tutorialVideo: PlayableMediaDto | null;
  practice: SheetPracticeState;
}

export interface SavedPieceDto {
  savedAt: string;
  piece: Pick<LibraryPieceCardDto, "id" | "title" | "composer" | "coverUrl" | "genre" | "level">;
}

export interface SavedSheetMusicDto {
  savedAt: string;
  sheetMusic: Pick<LibrarySheetCardDto, "id" | "name" | "isMain" | "durationSec" | "level"> & {
    instrument: CategoryRef;
  };
  piece: { id: string; title: string; coverUrl: string | null };
}

export interface BackendPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
