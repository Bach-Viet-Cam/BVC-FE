import { axiosClient } from "@/shared/api/axiosClient";
import type { ApiResponse } from "@/shared/types/commonTypes";
import type { EditableVisibility, MusicCategories } from "@/features/music-library/types/musicLibraryTypes";
import type {
  LecturerPiece,
  LecturerPiecePage,
  LecturerPieceQuery,
  LecturerSheetMusic,
  LecturerSheetMusicList,
  PieceMutationResult,
  PieceRequest,
  SheetFileSlot,
  SheetMusicCreateRequest,
  SheetMusicRequest,
} from "@/features/music-library/types/lecturerTypes";

export const lecturerApi = {
  // Danh mục đang hoạt động, dùng cho form và bộ lọc của giảng viên
  getFilters: () => axiosClient.get<ApiResponse<MusicCategories>>("/library/filters"),

  listPieces: (params: LecturerPieceQuery) =>
    axiosClient.get<ApiResponse<LecturerPiecePage>>("/lecturer/pieces", { params }),
  getPiece: (id: string) => axiosClient.get<ApiResponse<LecturerPiece>>(`/lecturer/pieces/${id}`),
  createPiece: (body: PieceRequest) => axiosClient.post<ApiResponse<PieceMutationResult>>("/lecturer/pieces", body),
  updatePiece: (id: string, body: PieceRequest) =>
    axiosClient.put<ApiResponse<PieceMutationResult>>(`/lecturer/pieces/${id}`, body),
  setPieceVisibility: (id: string, visibility: EditableVisibility) =>
    axiosClient.patch<ApiResponse<PieceMutationResult>>(`/lecturer/pieces/${id}/visibility`, { visibility }),

  listSheetMusic: (pieceId: string) =>
    axiosClient.get<ApiResponse<LecturerSheetMusicList>>(`/lecturer/pieces/${pieceId}/sheet-music`),
  createSheetMusic: (pieceId: string, body: SheetMusicCreateRequest) =>
    axiosClient.post<ApiResponse<LecturerSheetMusic>>(`/lecturer/pieces/${pieceId}/sheet-music`, body),
  updateSheetMusic: (id: string, body: Partial<SheetMusicRequest>) =>
    axiosClient.put<ApiResponse<LecturerSheetMusic>>(`/lecturer/sheet-music/${id}`, body),
  replaceSheetFile: (id: string, slot: SheetFileSlot, fileId: string) =>
    axiosClient.put<ApiResponse<LecturerSheetMusic>>(`/lecturer/sheet-music/${id}/files/${slot}`, { fileId }),
  setSheetVisibility: (id: string, visibility: EditableVisibility) =>
    axiosClient.patch<ApiResponse<LecturerSheetMusic>>(`/lecturer/sheet-music/${id}/visibility`, { visibility }),
};
