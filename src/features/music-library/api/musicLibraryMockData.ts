import type {
  CategoryRef,
  CoverTone,
  MediaFile,
  MusicCategories,
  SheetVersion,
  Song,
  Visibility,
} from "@/features/music-library/types/musicLibraryTypes";

export const MOCK_CATEGORIES: MusicCategories = {
  genres: [
    { id: "dan-ca-nam-bo", name: "Dân ca Nam Bộ" },
    { id: "dan-ca-bac-bo", name: "Dân ca Bắc Bộ" },
    { id: "quan-ho", name: "Quan họ Bắc Ninh" },
    { id: "nhac-le", name: "Nhạc lễ" },
  ],
  instruments: [
    { id: "dan-tranh", name: "Đàn tranh" },
    { id: "dan-bau", name: "Đàn bầu" },
    { id: "ty-ba", name: "Tỳ bà" },
    { id: "sao-truc", name: "Sáo trúc" },
    { id: "bo-go", name: "Bộ gõ" },
  ],
  levels: [
    { id: "co-ban", name: "Cơ bản" },
    { id: "trung-cap", name: "Trung cấp" },
    { id: "nang-cao", name: "Nâng cao" },
  ],
};

function pick(list: CategoryRef[], id: string): CategoryRef {
  const found = list.find((item) => item.id === id);
  if (!found) throw new Error(`Thiếu danh mục mock: ${id}`);
  return found;
}

export const genreOf = (id: string) => pick(MOCK_CATEGORIES.genres, id);
export const instrumentOf = (id: string) => pick(MOCK_CATEGORIES.instruments, id);
export const levelOf = (id: string) => pick(MOCK_CATEGORIES.levels, id);

interface SongSeed {
  id: string;
  title: string;
  composer?: string;
  description?: string;
  genreId: string;
  instrumentIds: string[];
  levelId: string;
  tone: CoverTone;
  visibility?: Visibility;
  createdAt: string;
  updatedAt: string;
}

function song(seed: SongSeed): Song {
  return {
    id: seed.id,
    title: seed.title,
    composer: seed.composer ?? "Dân gian",
    description: seed.description ?? "",
    genre: genreOf(seed.genreId),
    instruments: seed.instrumentIds.map(instrumentOf),
    level: levelOf(seed.levelId),
    coverTone: seed.tone,
    visibility: seed.visibility ?? "VISIBLE",
    createdAt: seed.createdAt,
    updatedAt: seed.updatedAt > seed.createdAt ? seed.updatedAt : seed.createdAt,
  };
}

export const MOCK_SONGS: Song[] = [
  song({
    id: "ly-ngua-o",
    title: "Lý ngựa ô",
    description: "Bản chuyển soạn cho nhạc cụ truyền thống dùng trong chương trình TRD301, phần độc tấu giữa kỳ.",
    genreId: "dan-ca-nam-bo",
    instrumentIds: ["dan-tranh", "dan-bau", "ty-ba", "sao-truc"],
    levelId: "trung-cap",
    tone: "ink",
    createdAt: "2026-09-01T08:00:00Z",
    updatedAt: "2026-09-12T08:00:00Z",
  }),
  song({
    id: "trong-com",
    title: "Trống cơm",
    description: "Bài dân ca quen thuộc, có phần bộ gõ giữ nhịp cho hòa tấu.",
    genreId: "dan-ca-bac-bo",
    instrumentIds: ["dan-tranh", "sao-truc", "bo-go"],
    levelId: "trung-cap",
    tone: "gold",
    createdAt: "2026-08-30T08:00:00Z",
    updatedAt: "2026-09-10T08:00:00Z",
  }),
  song({
    id: "luu-thuy-kim-tien",
    title: "Lưu thủy kim tiền",
    genreId: "nhac-le",
    instrumentIds: ["dan-tranh", "ty-ba"],
    levelId: "nang-cao",
    tone: "muted",
    visibility: "HIDDEN",
    createdAt: "2026-08-20T08:00:00Z",
    updatedAt: "2026-09-06T08:00:00Z",
  }),
  song({
    id: "beo-dat-may-troi",
    title: "Bèo dạt mây trôi",
    genreId: "dan-ca-bac-bo",
    instrumentIds: ["dan-tranh"],
    levelId: "co-ban",
    tone: "bar",
    visibility: "HIDDEN_BY_ADMIN",
    createdAt: "2026-08-18T08:00:00Z",
    updatedAt: "2026-09-15T08:00:00Z",
  }),
  song({
    id: "se-chi-luon-kim",
    title: "Se chỉ luồn kim",
    genreId: "quan-ho",
    instrumentIds: ["dan-tranh", "sao-truc"],
    levelId: "co-ban",
    tone: "accent",
    createdAt: "2026-08-25T08:00:00Z",
    updatedAt: "2026-09-02T08:00:00Z",
  }),
  song({
    id: "ly-cay-bong",
    title: "Lý cây bông",
    genreId: "dan-ca-nam-bo",
    instrumentIds: ["dan-tranh"],
    levelId: "trung-cap",
    tone: "accent",
    createdAt: "2026-09-14T08:00:00Z",
    updatedAt: "2026-08-29T08:00:00Z",
  }),
  song({
    id: "ru-con-nam-bo",
    title: "Ru con Nam Bộ",
    genreId: "dan-ca-nam-bo",
    instrumentIds: ["dan-bau", "dan-tranh", "sao-truc", "ty-ba"],
    levelId: "co-ban",
    tone: "tint",
    createdAt: "2026-09-13T08:00:00Z",
    updatedAt: "2026-08-28T08:00:00Z",
  }),
  song({
    id: "ly-chieu-chieu",
    title: "Lý chiều chiều",
    genreId: "dan-ca-nam-bo",
    instrumentIds: ["sao-truc"],
    levelId: "co-ban",
    tone: "muted",
    createdAt: "2026-09-11T08:00:00Z",
    updatedAt: "2026-08-27T08:00:00Z",
  }),
  song({
    id: "ly-con-sao",
    title: "Lý con sáo",
    genreId: "dan-ca-nam-bo",
    instrumentIds: ["dan-tranh", "sao-truc"],
    levelId: "co-ban",
    tone: "bar",
    createdAt: "2026-09-10T08:00:00Z",
    updatedAt: "2026-08-26T08:00:00Z",
  }),
  song({
    id: "co-la",
    title: "Cò lả",
    genreId: "dan-ca-bac-bo",
    instrumentIds: ["sao-truc", "dan-bau"],
    levelId: "co-ban",
    tone: "ink",
    createdAt: "2026-09-08T08:00:00Z",
    updatedAt: "2026-08-25T08:00:00Z",
  }),
  song({
    id: "nguoi-o-dung-ve",
    title: "Người ở đừng về",
    genreId: "quan-ho",
    instrumentIds: ["dan-bau", "dan-tranh"],
    levelId: "nang-cao",
    tone: "gold",
    createdAt: "2026-09-07T08:00:00Z",
    updatedAt: "2026-08-24T08:00:00Z",
  }),
  song({
    id: "hanh-van",
    title: "Hành vân",
    genreId: "nhac-le",
    instrumentIds: ["dan-tranh", "ty-ba"],
    levelId: "nang-cao",
    tone: "tint",
    createdAt: "2026-09-05T08:00:00Z",
    updatedAt: "2026-08-23T08:00:00Z",
  }),
  song({
    id: "ly-keo-chai",
    title: "Lý kéo chài",
    genreId: "dan-ca-nam-bo",
    instrumentIds: ["dan-bau"],
    levelId: "trung-cap",
    tone: "accent",
    createdAt: "2026-09-04T08:00:00Z",
    updatedAt: "2026-08-22T08:00:00Z",
  }),
  song({
    id: "di-cay",
    title: "Đi cấy",
    genreId: "dan-ca-bac-bo",
    instrumentIds: ["sao-truc", "bo-go"],
    levelId: "co-ban",
    tone: "muted",
    createdAt: "2026-09-03T08:00:00Z",
    updatedAt: "2026-08-21T08:00:00Z",
  }),
  song({
    id: "ly-cay-da",
    title: "Lý cây đa",
    genreId: "quan-ho",
    instrumentIds: ["dan-tranh"],
    levelId: "trung-cap",
    tone: "ink",
    createdAt: "2026-09-02T08:00:00Z",
    updatedAt: "2026-08-20T08:00:00Z",
  }),
];

interface SheetSeed {
  id: string;
  songId: string;
  name: string;
  description?: string;
  instrumentId: string;
  levelId: string;
  isMain: boolean;
  file: { name: string; sizeMb: number; pages?: number };
  recording?: { name: string; durationSec: number };
  video?: { name: string; durationSec: number };
  visibility?: Visibility;
  createdAt: string;
}

function sheet(seed: SheetSeed): SheetVersion {
  const recording: MediaFile | undefined = seed.recording && {
    name: seed.recording.name,
    durationSec: seed.recording.durationSec,
  };
  const video: MediaFile | undefined = seed.video && { name: seed.video.name, durationSec: seed.video.durationSec };
  return {
    id: seed.id,
    songId: seed.songId,
    name: seed.name,
    description: seed.description ?? "",
    instrument: instrumentOf(seed.instrumentId),
    level: levelOf(seed.levelId),
    isMain: seed.isMain,
    sheetFile: {
      name: seed.file.name,
      sizeBytes: Math.round(seed.file.sizeMb * 1024 * 1024),
      pageCount: seed.file.pages ?? 3,
      mimeType: "application/pdf",
    },
    referenceRecording: recording,
    tutorialVideo: video,
    visibility: seed.visibility ?? "VISIBLE",
    createdAt: seed.createdAt,
    updatedAt: seed.createdAt,
  };
}

// Bài phụ: mỗi nhạc cụ có 1 bản chính để thư viện đủ dữ liệu
function mainSheetsFor(songId: string, slug: string, instrumentIds: string[], levelId: string, durationSec: number) {
  return instrumentIds.map((instrumentId, index) =>
    sheet({
      id: `${songId}__${instrumentId}__main`,
      songId,
      name: `${instrumentOf(instrumentId).name} — bản chính`,
      description: "Bản gốc của giảng viên.",
      instrumentId,
      levelId,
      isMain: true,
      file: { name: `${slug}_${instrumentId}-chinh.pdf`, sizeMb: 1.2 + index * 0.4, pages: 2 },
      recording: { name: `${slug}_ref_${instrumentId}-chinh.wav`, durationSec: durationSec + index * 4 },
      createdAt: "2026-09-01T08:00:00Z",
    })
  );
}

export const MOCK_SHEETS: SheetVersion[] = [
  sheet({
    id: "lno-tranh-chinh",
    songId: "ly-ngua-o",
    name: "Đàn tranh — bản chính",
    description: "Bản gốc của giảng viên, dùng làm chuẩn cho AI.",
    instrumentId: "dan-tranh",
    levelId: "trung-cap",
    isMain: true,
    file: { name: "ly-ngua-o_dan-tranh-chinh.pdf", sizeMb: 3.4 },
    recording: { name: "ly-ngua-o_ref_dan-tranh-chinh.wav", durationSec: 174 },
    video: { name: "huong-dan_dan-tranh-chinh.mp4", durationSec: 372 },
    createdAt: "2026-09-02T08:00:00Z",
  }),
  sheet({
    id: "lno-tranh-co-ban",
    songId: "ly-ngua-o",
    name: "Đàn tranh — bản cơ bản",
    description: "Rút gọn cho sinh viên mới, bỏ đoạn luyến bar 25–32.",
    instrumentId: "dan-tranh",
    levelId: "co-ban",
    isMain: false,
    file: { name: "ly-ngua-o_dan-tranh-co-ban.pdf", sizeMb: 2.1, pages: 2 },
    recording: { name: "ly-ngua-o_ref_dan-tranh-co-ban.wav", durationSec: 151 },
    createdAt: "2026-09-04T08:00:00Z",
  }),
  sheet({
    id: "lno-tranh-nang-cao",
    songId: "ly-ngua-o",
    name: "Đàn tranh — bản nâng cao",
    description: "Thêm kỹ thuật vê và láy ở điệp khúc.",
    instrumentId: "dan-tranh",
    levelId: "nang-cao",
    isMain: false,
    file: { name: "ly-ngua-o_dan-tranh-nang-cao.pdf", sizeMb: 2.8 },
    video: { name: "huong-dan_dan-tranh-nang-cao.mp4", durationSec: 485 },
    visibility: "HIDDEN",
    createdAt: "2026-09-06T08:00:00Z",
  }),
  sheet({
    id: "lno-bau-chinh",
    songId: "ly-ngua-o",
    name: "Đàn bầu — bản chính",
    description: "Bản gốc của giảng viên, hai thế tay.",
    instrumentId: "dan-bau",
    levelId: "trung-cap",
    isMain: true,
    file: { name: "ly-ngua-o_dan-bau-chinh.pdf", sizeMb: 1.8 },
    recording: { name: "ly-ngua-o_ref_dan-bau-chinh.wav", durationSec: 178 },
    createdAt: "2026-09-03T08:00:00Z",
  }),
  sheet({
    id: "lno-sao-chinh",
    songId: "ly-ngua-o",
    name: "Sáo trúc — bản chính",
    description: "Đang hoàn thiện thế bấm đoạn điệp khúc.",
    instrumentId: "sao-truc",
    levelId: "co-ban",
    isMain: true,
    file: { name: "ly-ngua-o_sao-truc-chinh.pdf", sizeMb: 1.2 },
    visibility: "HIDDEN",
    createdAt: "2026-09-05T08:00:00Z",
  }),
  ...mainSheetsFor("trong-com", "trong-com", ["dan-tranh", "sao-truc", "bo-go"], "trung-cap", 142),
  sheet({
    id: "trong-com-sao-co-ban",
    songId: "trong-com",
    name: "Sáo trúc — bản cơ bản",
    instrumentId: "sao-truc",
    levelId: "co-ban",
    isMain: false,
    file: { name: "trong-com_sao-truc-co-ban.pdf", sizeMb: 0.9, pages: 1 },
    createdAt: "2026-09-08T08:00:00Z",
  }),
  ...mainSheetsFor("luu-thuy-kim-tien", "luu-thuy", ["dan-tranh", "ty-ba"], "nang-cao", 205),
  ...mainSheetsFor("beo-dat-may-troi", "beo-dat", ["dan-tranh"], "co-ban", 160),
  ...mainSheetsFor("se-chi-luon-kim", "se-chi", ["dan-tranh", "sao-truc"], "co-ban", 132),
  sheet({
    id: "se-chi-tranh-nang-cao",
    songId: "se-chi-luon-kim",
    name: "Đàn tranh — bản nâng cao",
    instrumentId: "dan-tranh",
    levelId: "nang-cao",
    isMain: false,
    file: { name: "se-chi_dan-tranh-nang-cao.pdf", sizeMb: 1.6 },
    createdAt: "2026-09-09T08:00:00Z",
  }),
  ...mainSheetsFor("ly-cay-bong", "ly-cay-bong", ["dan-tranh"], "trung-cap", 118),
  sheet({
    id: "ly-cay-bong-tranh-co-ban",
    songId: "ly-cay-bong",
    name: "Đàn tranh — bản cơ bản",
    instrumentId: "dan-tranh",
    levelId: "co-ban",
    isMain: false,
    file: { name: "ly-cay-bong_dan-tranh-co-ban.pdf", sizeMb: 1.1 },
    recording: { name: "ly-cay-bong_ref_dan-tranh-co-ban.wav", durationSec: 104 },
    createdAt: "2026-09-10T08:00:00Z",
  }),
  ...mainSheetsFor("ru-con-nam-bo", "ru-con", ["dan-bau", "dan-tranh", "sao-truc", "ty-ba"], "co-ban", 150),
  ...mainSheetsFor("ly-chieu-chieu", "ly-chieu-chieu", ["sao-truc"], "co-ban", 126),
  ...mainSheetsFor("ly-con-sao", "ly-con-sao", ["dan-tranh", "sao-truc"], "co-ban", 98),
  ...mainSheetsFor("co-la", "co-la", ["sao-truc", "dan-bau"], "co-ban", 110),
  ...mainSheetsFor("nguoi-o-dung-ve", "nguoi-o", ["dan-bau", "dan-tranh"], "nang-cao", 232),
  ...mainSheetsFor("hanh-van", "hanh-van", ["dan-tranh", "ty-ba"], "nang-cao", 248),
  ...mainSheetsFor("ly-keo-chai", "ly-keo-chai", ["dan-bau"], "trung-cap", 121),
  ...mainSheetsFor("di-cay", "di-cay", ["sao-truc", "bo-go"], "co-ban", 96),
  // "Lý cây đa" cố ý chưa có bản nhạc để thử cảnh báo bài công khai mà chưa có bản nhạc
];

export const MOCK_SAVED_SONGS: { songId: string; savedAt: string }[] = [
  { songId: "ly-ngua-o", savedAt: "2026-09-18T08:00:00Z" },
  { songId: "trong-com", savedAt: "2026-09-16T08:00:00Z" },
  { songId: "se-chi-luon-kim", savedAt: "2026-09-09T08:00:00Z" },
  { songId: "ru-con-nam-bo", savedAt: "2026-09-05T08:00:00Z" },
  { songId: "ly-chieu-chieu", savedAt: "2026-09-02T08:00:00Z" },
  { songId: "luu-thuy-kim-tien", savedAt: "2026-08-30T08:00:00Z" },
];

export const MOCK_SAVED_SHEETS: { sheetId: string; savedAt: string }[] = [
  { sheetId: "lno-tranh-chinh", savedAt: "2026-09-18T08:00:00Z" },
  { sheetId: "trong-com__sao-truc__main", savedAt: "2026-09-16T08:00:00Z" },
  { sheetId: "lno-bau-chinh", savedAt: "2026-09-09T08:00:00Z" },
  { sheetId: "lno-tranh-co-ban", savedAt: "2026-09-07T08:00:00Z" },
  { sheetId: "ly-chieu-chieu__sao-truc__main", savedAt: "2026-09-02T08:00:00Z" },
  { sheetId: "lno-tranh-nang-cao", savedAt: "2026-08-31T08:00:00Z" },
];
