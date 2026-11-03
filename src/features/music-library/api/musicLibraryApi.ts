import { axiosClient } from "@/shared/api/axiosClient";
import type { ApiResponse } from "@/shared/types/commonTypes";
import { LIBRARY_PAGE_SIZE } from "@/features/music-library/constants/musicLibraryConstants";
import { coverToneOf } from "@/features/music-library/utils/coverTone";
import type {
  BackendPage,
  CategoryRef,
  LibraryPieceCardDto,
  LibraryPieceDetailDto,
  LibrarySheet,
  LibrarySheetCardDto,
  LibrarySheetViewerDto,
  LibrarySongQuery,
  MediaFile,
  MusicCategories,
  MusicLibraryApi,
  PlayableMediaDto,
  SavedPieceDto,
  SavedSheetMusicDto,
  Song,
  TrendingPieceDto,
} from "@/features/music-library/types/musicLibraryTypes";

// Danh sách đã lưu hiển thị một lần, lấy tối đa số bản ghi BE cho phép mỗi trang
const SAVED_PAGE_SIZE = 100;

const unwrap = <T>(request: Promise<{ data: ApiResponse<T> }>) => request.then((response) => response.data.data);
const ignoreData = () => undefined;

const toLibraryParams = (query: LibrarySongQuery) => ({
  q: query.keyword || undefined,
  genreIds: query.genreId || undefined,
  // BE nhận danh sách dạng "a,b"
  instrumentIds: query.instrumentIds.length > 0 ? query.instrumentIds.join(",") : undefined,
  levelIds: query.levelId || undefined,
  sort: query.sort,
  page: query.page,
  pageSize: LIBRARY_PAGE_SIZE,
});

// BE trả media dạng { url, durationSec }; name chỉ dùng làm khoá ổn định cho trình phát
function toMediaFile(media: PlayableMediaDto | null, name: string): MediaFile | undefined {
  if (!media) return undefined;
  return { name, url: media.url ?? undefined, durationSec: media.durationSec ?? undefined };
}

function toSong(
  piece: Pick<LibraryPieceCardDto, "id" | "title" | "composer" | "coverUrl" | "genre"> &
    Partial<Pick<LibraryPieceCardDto, "instrumentCount" | "createdAt">>
): Song {
  const createdAt = piece.createdAt ?? "";
  return {
    id: piece.id,
    title: piece.title,
    composer: piece.composer ?? "",
    description: "",
    genre: piece.genre,
    instruments: [],
    instrumentCount: piece.instrumentCount ?? 0,
    coverUrl: piece.coverUrl ?? undefined,
    coverTone: coverToneOf(piece.id),
    visibility: "PUBLIC",
    createdAt,
    updatedAt: createdAt,
  };
}

interface SheetExtras {
  referenceRecording?: MediaFile;
  tutorialVideo?: MediaFile;
  sheetFile?: LibrarySheet["sheetFile"];
}

function toSheet(
  card: LibrarySheetCardDto,
  songId: string,
  instrument: CategoryRef,
  extras: SheetExtras = {}
): LibrarySheet {
  // Bản không phải bản chính chỉ có cờ hasReferenceAudio, đủ để hiện biểu tượng + thời lượng
  const flaggedRecording = card.hasReferenceAudio
    ? { name: `${card.id}-audio`, durationSec: card.durationSec ?? undefined }
    : undefined;
  return {
    id: card.id,
    songId,
    name: card.name,
    description: card.description ?? "",
    instrument,
    level: card.level,
    isMain: card.isMain,
    sheetFile: extras.sheetFile ?? { name: "", pageCount: 1, mimeType: "" },
    referenceRecording: extras.referenceRecording ?? flaggedRecording,
    tutorialVideo: extras.tutorialVideo,
    visibility: "PUBLIC",
    isSaved: card.isSaved,
    createdAt: "",
    updatedAt: "",
  };
}

function toSongDetail(detail: LibraryPieceDetailDto) {
  const sheets = detail.tabs.flatMap((tab) => {
    const main = tab.main
      ? [
          toSheet(tab.main, detail.id, tab.instrument, {
            referenceRecording: toMediaFile(tab.main.referenceAudio, `${tab.main.id}-audio`),
            tutorialVideo: toMediaFile(tab.main.tutorialVideo, `${tab.main.id}-video`),
          }),
        ]
      : [];
    return [...main, ...tab.others.map((sheet) => toSheet(sheet, detail.id, tab.instrument))];
  });
  return {
    ...toSong(detail),
    description: detail.description ?? "",
    instruments: detail.tabs.map((tab) => tab.instrument),
    instrumentCount: detail.tabs.length,
    isSaved: detail.isSaved,
    canPracticeEnsemble: detail.canPracticeEnsemble,
    defaultInstrumentId: detail.defaultInstrumentId,
    sheets,
  };
}

function toSheetViewer(viewer: LibrarySheetViewerDto) {
  const { sheetMusic, piece, sheetFile, referenceAudio } = viewer;
  const recording = toMediaFile(referenceAudio, `${sheetMusic.id}-audio`);
  const isFallback = Boolean(referenceAudio?.isFallback);
  return {
    song: { id: piece.id, title: piece.title, coverUrl: piece.coverUrl ?? undefined, coverTone: coverToneOf(piece.id) },
    sheet: toSheet(sheetMusic, piece.id, sheetMusic.instrument, {
      referenceRecording: isFallback ? undefined : recording,
      tutorialVideo: toMediaFile(viewer.tutorialVideo, `${sheetMusic.id}-video`),
      sheetFile: {
        name: sheetFile.name,
        mimeType: sheetFile.mimeType,
        pageCount: sheetFile.pageCount ?? 1,
        sizeBytes: sheetFile.sizeBytes ?? undefined,
        url: sheetFile.url ?? undefined,
      },
    }),
    fallbackRecording: isFallback ? recording : undefined,
    practice: viewer.practice,
  };
}

const listSaved = <T>(type: "PIECE" | "SHEET_MUSIC") =>
  unwrap(axiosClient.get<ApiResponse<BackendPage<T>>>("/me/saved", { params: { type, pageSize: SAVED_PAGE_SIZE } }));

export const musicLibraryApi: MusicLibraryApi = {
  getCategories: () => unwrap(axiosClient.get<ApiResponse<MusicCategories>>("/library/filters")),
  listLibrarySongs: (query) =>
    unwrap(
      axiosClient.get<ApiResponse<BackendPage<LibraryPieceCardDto>>>("/library/pieces", {
        params: toLibraryParams(query),
      })
    ).then((page) => ({
      data: page.items.map((piece) => ({ ...toSong(piece), isSaved: piece.isSaved })),
      total: page.total,
      page: page.page,
      limit: page.pageSize,
      totalPages: page.totalPages,
    })),
  listTrendingSongs: () =>
    unwrap(
      axiosClient.get<ApiResponse<{ weekStart: string; items: TrendingPieceDto[] }>>("/library/pieces/trending")
    ).then(({ weekStart, items }) => ({
      weekStart,
      items: items.map((piece) => ({
        ...toSong(piece),
        description: piece.description ?? "",
        isSaved: piece.isSaved,
        weeklySubmissionCount: piece.weeklySubmissionCount,
      })),
    })),
  getLibrarySong: (songId) =>
    unwrap(axiosClient.get<ApiResponse<LibraryPieceDetailDto>>(`/library/pieces/${songId}`)).then(toSongDetail),
  getSheetViewer: (_songId, sheetId) =>
    unwrap(axiosClient.get<ApiResponse<LibrarySheetViewerDto>>(`/library/sheet-music/${sheetId}`)).then(toSheetViewer),
  saveSong: (songId) => axiosClient.put(`/me/saved/pieces/${songId}`).then(ignoreData),
  unsaveSong: (songId) => axiosClient.delete(`/me/saved/pieces/${songId}`).then(ignoreData),
  saveSheet: (sheetId) => axiosClient.put(`/me/saved/sheet-music/${sheetId}`).then(ignoreData),
  unsaveSheet: (sheetId) => axiosClient.delete(`/me/saved/sheet-music/${sheetId}`).then(ignoreData),
  listSavedSongs: () =>
    listSaved<SavedPieceDto>("PIECE").then((page) =>
      page.items.map((item) => ({ song: toSong(item.piece), savedAt: item.savedAt, isAvailable: true }))
    ),
  listSavedSheets: () =>
    listSaved<SavedSheetMusicDto>("SHEET_MUSIC").then((page) =>
      page.items.map((item) => ({
        sheet: toSheet(
          { ...item.sheetMusic, description: null, hasReferenceAudio: false, hasTutorialVideo: false, isSaved: true },
          item.piece.id,
          item.sheetMusic.instrument
        ),
        song: {
          id: item.piece.id,
          title: item.piece.title,
          coverUrl: item.piece.coverUrl ?? undefined,
          coverTone: coverToneOf(item.piece.id),
        },
        savedAt: item.savedAt,
        isAvailable: true,
      }))
    ),
};
