import type {
  NoteInfo,
  RecordingFile,
  StringInfo,
  SubdivisionKey,
  TimeSignature,
} from "@/features/practice/types/practiceTypes";

export const TUNER_TOLERANCE_CENTS = 10;
export const TEMPO_TOLERANCE_PERCENT = 5;
export const COUNT_IN_BEATS = 4;
export const STAGE_SECONDS = 2.5;
export const RETRY_DELAY_FIRST_S = 5;
export const RETRY_DELAY_LATER_S = 10;
export const MAX_RETRIES = 3;
export const FILE_FORMATS = ["mp3", "wav", "m4a"];
export const FILE_MAX_MB = 20;
export const FILE_MIN_S = 10;
export const FILE_MAX_S = 180;

export const BPM_MIN = 40;
export const BPM_MAX = 208;

export const SAMPLE = {
  piece: "Lý ngựa ô - Đàn Nhị",
  className: "Lớp Violin K18A",
  instrument: "Violin",
  lesson: "Bài 3",
  deadline: "28/10/2026",
  targetBpm: 96,
  pieceLen: 120,
  submissionsLeft: 3,
  files: [
    { name: "ban-thu-bai-1.m4a", fmt: "m4a", mb: 3.2, dur: 118 },
    { name: "ban-thu-bai-2.mp3", fmt: "mp3", mb: 4.1, dur: 127 },
  ] as RecordingFile[],
};

export const MSG = {
  expired: "Bạn không thể nộp bài vì đã quá hạn hoặc đã dùng hết số lần nộp.", // MSG-16
  mic: "Cần cho phép truy cập micro để dùng tính năng này.", // MSG-10
  micPopup: "Cần cho phép truy cập micro. Vui lòng bật quyền micro trong cài đặt trình duyệt rồi thử lại.", // MSG-10
  format: "Định dạng file không được hỗ trợ. Vui lòng chọn file có định dạng MP3, WAV, M4A.", // MSG-13
  size: "File vượt quá dung lượng tối đa 20 MB.", // MSG-14
  duration: "Thời lượng bản thu phải nằm trong khoảng từ 00:10 đến 03:00.", // MSG-15
  weak: "Kết nối mạng yếu, quá trình tải lên có thể chậm hoặc thất bại.", // MSG-17
  busy: "Bản nộp trước đang được xử lý. Vui lòng đợi hoàn tất rồi nộp bản mới.", // GBR-49
  sent: "Đã gửi bản thu. Hệ thống đang xử lý.", // MSG-18
  autoStop: "Bản thu đã tự động dừng ở cuối bài.", // MSG-44
  retrying: "Đang xử lý lại bản thu...", // MSG-24
  analyzed: "Bản thu của bạn đã được phân tích xong. Nhấn để xem kết quả.", // MSG-43
  download: "Đã tải bản thu về máy.",
  refNote: "Đang phát nốt mẫu...",
};

export const NOTES: Record<string, NoteInfo> = {
  Sol4: { vn: "Sol", en: "G4", f: 392.0 },
  La4: { vn: "La", en: "A4", f: 440.0 },
  Si4: { vn: "Si", en: "B4", f: 493.88 },
  Đô5: { vn: "Đô", en: "C5", f: 523.25 },
  Rê5: { vn: "Rê", en: "D5", f: 587.33 },
  Mi5: { vn: "Mi", en: "E5", f: 659.25 },
};

// Các dây cần kiểm tra của nhạc cụ trong bài tập (violin)
export const STRINGS: StringInfo[] = [
  { code: "Dây 4", vn: "Sol", en: "G3", f: 196.0, off: -6 },
  { code: "Dây 3", vn: "Rê", en: "D4", f: 293.66, off: -18 },
  { code: "Dây 2", vn: "La", en: "A4", f: 440.0, off: 16 },
  { code: "Dây 1", vn: "Mi", en: "E5", f: 659.25, off: -24 },
];

export const SIGS: TimeSignature[] = [
  { label: "2/4", beats: 2 },
  { label: "3/4", beats: 3 },
  { label: "4/4", beats: 4 },
  { label: "6/8", beats: 6 },
];

export const SUBS: Record<SubdivisionKey, string> = {
  white: "Nốt trắng · 2 phách",
  black: "Nốt đen · 1 phách",
  half: "Móc đơn · 1/2 phách",
  quarter: "Móc kép · 1/4 phách",
};

export const STAGE_LABELS = ["Kiểm tra chất lượng", "Phân tích audio", "So sánh với bản mẫu", "Tổng hợp kết quả"];

export const STAGE_ACTIVE_LABELS = [
  "Đang kiểm tra chất lượng",
  "Đang phân tích audio của bạn",
  "Đang so sánh với bản mẫu của giảng viên",
  "Đang tổng hợp lại kết quả",
];

export const REJECT_REASON = "Âm lượng quá nhỏ"; // GBR-12

export const AUDIO_HOP_SIZE = 512;
export const COUNT_IN_LEAD_S = 0.15; // khoảng đệm trước phách đếm đầu tiên
export const RECORDING_FILE_NAME = "ban-thu-vua-ghi.wav";
export const PREVIEW_BAR_COUNT = 80;
export const DEMO_AUTO_STOP_TAIL_S = 12;
export const MAX_WAV_SAMPLE_RATE = 48000;
export const MIC_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
  channelCount: 1,
};
