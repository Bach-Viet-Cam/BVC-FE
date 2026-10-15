import type {
  CoverTone,
  EditableVisibility,
  LibrarySort,
  Visibility,
} from "@/features/music-library/types/musicLibraryTypes";

export const LIBRARY_PAGE_SIZE = 12;
export const MANAGE_PAGE_SIZE = 20;
export const KEYWORD_MAX_LENGTH = 100;

export const LIBRARY_SORT_OPTIONS: { value: LibrarySort; label: string }[] = [
  { value: "newest", label: "Mới nhất" },
  { value: "title_asc", label: "Tên A→Z" },
  { value: "title_desc", label: "Tên Z→A" },
];

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  VISIBLE: "Công khai",
  HIDDEN: "Đã ẩn",
  HIDDEN_BY_ADMIN: "Admin đã ẩn",
};

export const EDITABLE_VISIBILITY_OPTIONS: { value: EditableVisibility; label: string }[] = [
  { value: "VISIBLE", label: "Công khai" },
  { value: "HIDDEN", label: "Đã ẩn" },
];

export const COVER_TONE_CLASSES: Record<CoverTone, { bg: string; fg: string }> = {
  ink: { bg: "bg-bvc-ink", fg: "text-white" },
  accent: { bg: "bg-bvc-accent", fg: "text-white" },
  tint: { bg: "bg-bvc-accent-tint", fg: "text-bvc-accent-text" },
  muted: { bg: "bg-bvc-muted", fg: "text-white" },
  bar: { bg: "bg-bvc-bar", fg: "text-bvc-accent-text" },
  gold: { bg: "bg-bvc-accent-text", fg: "text-white" },
};

export const MB = 1024 * 1024;

// Giới hạn dung lượng thực tế lấy từ cấu hình Admin (M06); tạm cố định phía FE
export const FILE_RULES = {
  cover: { accept: ".jpg,.jpeg,.png,.webp", mimeTypes: ["image/jpeg", "image/png", "image/webp"], maxBytes: 5 * MB },
  sheet: {
    accept: ".pdf,.png,.jpg,.jpeg",
    mimeTypes: ["application/pdf", "image/png", "image/jpeg"],
    maxBytes: 20 * MB,
  },
  recording: {
    accept: ".mp3,.wav,.m4a",
    mimeTypes: ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/wave", "audio/mp4", "audio/x-m4a", "audio/m4a"],
    maxBytes: 50 * MB,
  },
  video: { accept: ".mp4", mimeTypes: ["video/mp4"], maxBytes: 300 * MB },
} as const;

export const REFERENCE_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5] as const;
export const SHEET_ZOOM = { min: 50, max: 200, step: 10, initial: 100 } as const;

export const LIBRARY_MESSAGES = {
  noResult: "Không tìm thấy bài hát nào",
  noVisibleSheet: "Bài hát chưa có bản nhạc công khai nào. Sinh viên sẽ thấy bài nhưng chưa mở được bản nhạc.",
  hiddenByAdmin: "Admin đã ẩn nội dung này. Bạn không tự bật lại được.",
  guestSaveTitle: "Đăng nhập để lưu",
  guestSaveBody:
    "Bạn cần đăng nhập để lưu bài hát và bản nhạc vào danh sách của mình. Sau khi đăng nhập, hệ thống đưa bạn về đúng trang này.",
  unavailable: "Nội dung này đã bị ẩn nên không mở được. Bạn vẫn có thể bỏ lưu.",
  mainNeedsRecording: "Bản chính cần bản thu mẫu trước khi công khai",
} as const;
