import type { PaginatedData } from "@/shared/types/commonTypes";
import type { CategoryRef, EditableVisibility, Visibility } from "@/features/music-library/types/musicLibraryTypes";

export type Moderation = "NORMAL" | "ADMIN_HIDDEN";
export type SheetKind = "MAIN" | "LEVEL";
export type AnalysisStatus = "NONE" | "PROCESSING" | "READY" | "ERROR";

export type UploadKind = "COVER" | "SHEET" | "AUDIO" | "VIDEO";
export type SheetFileSlot = "sheet" | "audio" | "video";

export interface StoredFile {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  durationSec: number | null;
  pageCount: number | null;
  // null khi file chưa được xác nhận
  url: string | null;
}

export interface SystemMessage {
  code: string;
  message: string;
}

export interface LecturerPiece {
  id: string;
  title: string;
  composer: string | null;
  description: string | null;
  coverUrl: string | null;
  cover: StoredFile | null;
  genre: CategoryRef;
  level: CategoryRef;
  instruments: CategoryRef[];
  visibility: EditableVisibility;
  moderation: Moderation;
  effectiveVisibility: Visibility;
  moderationReason: string | null;
  canChangeVisibility: boolean;
  sheetMusicCount: number;
  publicSheetMusicCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LecturerPiecePage extends PaginatedData<LecturerPiece> {
  totalPages: number;
}

// Tạo / sửa / ẩn hiện bài hát; warning là MSG-46 khi công khai mà chưa có bản nhạc công khai
export interface PieceMutationResult {
  piece: LecturerPiece;
  warning: SystemMessage | null;
}

export interface LecturerPieceQuery {
  q?: string;
  genreId?: string;
  levelId?: string;
  instrumentId?: string;
  visibility?: Visibility | "ALL";
  page: number;
  pageSize: number;
}

export interface PieceRequest {
  title: string;
  composer: string | null;
  description: string | null;
  genreId: string;
  levelId: string;
  visibility?: EditableVisibility;
  // Khi sửa: bỏ trống giữ ảnh cũ, null gỡ ảnh
  coverFileId?: string | null;
}

export interface SheetAnalysis {
  status: AnalysisStatus;
  error: string | null;
  hasAnalysisFile: boolean;
  timeSignatureMissing: boolean;
}

export interface LecturerSheetMusic {
  id: string;
  pieceId: string;
  name: string;
  description: string | null;
  kind: SheetKind;
  isMain: boolean;
  instrument: CategoryRef;
  level: CategoryRef;
  durationSec: number | null;
  visibility: EditableVisibility;
  moderation: Moderation;
  effectiveVisibility: Visibility;
  canChangeVisibility: boolean;
  canPublish: boolean;
  files: Record<SheetFileSlot, StoredFile | null>;
  usesMainRecording: boolean;
  analysis: SheetAnalysis | null;
  createdAt: string;
  updatedAt: string;
}

export interface LecturerSheetGroup {
  instrument: CategoryRef;
  count: number;
  items: LecturerSheetMusic[];
}

export interface SheetInstrumentOption extends CategoryRef {
  hasMain: boolean;
  defaultKind: SheetKind;
}

export interface LecturerSheetMusicList {
  piece: Pick<LecturerPiece, "id" | "title" | "coverUrl">;
  total: number;
  groups: LecturerSheetGroup[];
  instrumentOptions: SheetInstrumentOption[];
}

export interface SheetMusicRequest {
  instrumentId: string;
  kind: SheetKind;
  name: string;
  levelId: string;
  description: string | null;
  visibility?: EditableVisibility;
}

export interface SheetMusicCreateRequest extends SheetMusicRequest {
  sheetFileId: string;
  referenceAudioId: string | null;
  tutorialVideoId: string | null;
}

export interface PresignRequest {
  kind: UploadKind;
  fileName: string;
  mimeType: string;
  size: number;
}

export interface PresignResult {
  fileId: string;
  uploadUrl: string;
  method: string;
  headers: Record<string, string>;
  expiresAt: string;
  maxSizeBytes: number;
}
