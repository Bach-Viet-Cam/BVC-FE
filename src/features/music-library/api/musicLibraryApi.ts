import { axiosClient } from "@/shared/api/axiosClient";
import type { ApiResponse, PaginatedResponse } from "@/shared/types/commonTypes";
import { musicLibraryMockApi } from "@/features/music-library/api/musicLibraryMockApi";
import type {
  LibrarySong,
  LibrarySongDetail,
  ManagedSong,
  MusicCategories,
  MusicLibraryApi,
  SavedSheet,
  SavedSong,
  SheetPayload,
  SheetVersion,
  SheetViewerData,
  SongPayload,
  SongSheetsData,
} from "@/features/music-library/types/musicLibraryTypes";

// Endpoint tạm theo spec UC-05 → UC-08, cần chốt lại với BE trước khi tắt mock
function toSongForm(payload: SongPayload) {
  const form = new FormData();
  form.append("title", payload.title);
  form.append("composer", payload.composer);
  form.append("description", payload.description);
  form.append("genreId", payload.genreId);
  payload.instrumentIds.forEach((id) => form.append("instrumentIds", id));
  form.append("levelId", payload.levelId);
  form.append("visibility", payload.visibility);
  form.append("removeCover", String(payload.removeCover));
  if (payload.coverFile) form.append("cover", payload.coverFile);
  return form;
}

function toSheetForm(payload: SheetPayload) {
  const form = new FormData();
  form.append("name", payload.name);
  form.append("description", payload.description);
  form.append("instrumentId", payload.instrumentId);
  form.append("levelId", payload.levelId);
  form.append("isMain", String(payload.isMain));
  form.append("visibility", payload.visibility);
  if (payload.sheetFile) form.append("sheetFile", payload.sheetFile);
  if (payload.referenceRecording) form.append("referenceRecording", payload.referenceRecording);
  if (payload.tutorialVideo) form.append("tutorialVideo", payload.tutorialVideo);
  return form;
}

const unwrap = <T>(request: Promise<{ data: ApiResponse<T> }>) => request.then((response) => response.data.data);

export const musicLibraryHttpApi: MusicLibraryApi = {
  getCategories: () =>
    unwrap(axiosClient.get<ApiResponse<MusicCategories>>("/music-categories", { params: { active: true } })),
  listLibrarySongs: (query) =>
    unwrap(axiosClient.get<ApiResponse<PaginatedResponse<LibrarySong>>>("/library/songs", { params: query })),
  getLibrarySong: (songId) => unwrap(axiosClient.get<ApiResponse<LibrarySongDetail>>(`/library/songs/${songId}`)),
  getSheetViewer: (songId, sheetId) =>
    unwrap(axiosClient.get<ApiResponse<SheetViewerData>>(`/library/songs/${songId}/sheets/${sheetId}`)),
  saveSong: (songId) => unwrap(axiosClient.put<ApiResponse<void>>(`/me/saved/songs/${songId}`)),
  unsaveSong: (songId) => unwrap(axiosClient.delete<ApiResponse<void>>(`/me/saved/songs/${songId}`)),
  saveSheet: (sheetId) => unwrap(axiosClient.put<ApiResponse<void>>(`/me/saved/sheets/${sheetId}`)),
  unsaveSheet: (sheetId) => unwrap(axiosClient.delete<ApiResponse<void>>(`/me/saved/sheets/${sheetId}`)),
  listSavedSongs: () => unwrap(axiosClient.get<ApiResponse<SavedSong[]>>("/me/saved/songs")),
  listSavedSheets: () => unwrap(axiosClient.get<ApiResponse<SavedSheet[]>>("/me/saved/sheets")),
  listMySongs: (query) =>
    unwrap(axiosClient.get<ApiResponse<PaginatedResponse<ManagedSong>>>("/teacher/songs", { params: query })),
  getMySong: (songId) => unwrap(axiosClient.get<ApiResponse<ManagedSong>>(`/teacher/songs/${songId}`)),
  createSong: (payload) => unwrap(axiosClient.post<ApiResponse<ManagedSong>>("/teacher/songs", toSongForm(payload))),
  updateSong: (songId, payload) =>
    unwrap(axiosClient.put<ApiResponse<ManagedSong>>(`/teacher/songs/${songId}`, toSongForm(payload))),
  setSongVisibility: (songId, visibility) =>
    unwrap(axiosClient.patch<ApiResponse<ManagedSong>>(`/teacher/songs/${songId}/visibility`, { visibility })),
  getSongSheets: (songId) => unwrap(axiosClient.get<ApiResponse<SongSheetsData>>(`/teacher/songs/${songId}/sheets`)),
  createSheet: (songId, payload) =>
    unwrap(axiosClient.post<ApiResponse<SheetVersion>>(`/teacher/songs/${songId}/sheets`, toSheetForm(payload))),
  updateSheet: (sheetId, payload) =>
    unwrap(axiosClient.put<ApiResponse<SheetVersion>>(`/teacher/sheets/${sheetId}`, toSheetForm(payload))),
  setSheetVisibility: (sheetId, visibility) =>
    unwrap(axiosClient.patch<ApiResponse<SheetVersion>>(`/teacher/sheets/${sheetId}/visibility`, { visibility })),
};

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== "false";

export const musicLibraryApi: MusicLibraryApi = USE_MOCK ? musicLibraryMockApi : musicLibraryHttpApi;
