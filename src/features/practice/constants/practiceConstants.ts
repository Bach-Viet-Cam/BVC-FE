import type { NoteInfo, StringInfo, SubdivisionKey, TimeSignature } from "@/features/practice/types/practiceTypes";

export const TUNER_TOLERANCE_CENTS = 10;
export const TEMPO_TOLERANCE_PERCENT = 5;
export const COUNT_IN_BEATS = 4;
// Tiến trình xử lý: hỏi BE mỗi 1,5 giây cho đến khi nhận trạng thái cuối.
export const PROGRESS_POLL_MS = 1500;
export const PROGRESS_POLL_MAX_MS = 5000;
export const RESULT_REDIRECT_MS = 1500; // GBR-52
// MSG-17: mạng yếu khi effectiveType chậm, downlink thấp hoặc tốc độ tải lên thực tế thấp
export const WEAK_EFFECTIVE_TYPES = ["slow-2g", "2g", "3g"];
export const WEAK_DOWNLINK_MBPS = 1;
export const SLOW_UPLOAD_BYTES_PER_S = 50 * 1024;
export const SLOW_UPLOAD_GRACE_MS = 3000;
export const AUDIO_ACCEPT = ".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a";
export const FILE_FORMATS = ["mp3", "wav", "m4a"];
export const FILE_MAX_MB = 20;
export const FILE_MIN_S = 10;
export const FILE_MAX_S = 180;

export const BPM_MIN = 40;
export const BPM_MAX = 208;

// Giá trị mặc định khi bài nhạc chưa có tempo / độ dài từ BE
export const PRACTICE_DEFAULTS = {
  targetBpm: 96,
  pieceLen: 120,
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
  done: "Hoàn tất. Đang mở kết quả phân tích của bạn.", // MSG-21
  rejected: (reason: string) =>
    `Bản thu không đạt chất lượng: ${reason}. Lượt này không bị tính vào số lần nộp. Bạn có thể ghi âm hoặc tải file khác.`, // MSG-22
  failed: "Xử lý bản thu thất bại. File của bạn vẫn được giữ lại. Lượt này không bị tính vào số lần nộp.", // MSG-23
  retryWait: (seconds: number) => `Bạn có thể thử lại sau ${seconds} giây.`, // MSG-42
  exhausted:
    "Hệ thống vẫn chưa xử lý được sau 3 lần thử lại. File phân tích của bạn đã bị xóa khỏi máy chủ. Bạn có thể tải bản thu về và nộp lại sau; bản nộp mới sẽ tính vào số lần nộp.", // MSG-52
  leaveHint: "Bạn có thể rời màn hình này. Hệ thống vẫn xử lý và sẽ báo khi có kết quả.",
  submitFailed: "Chưa gửi được bản thu. Vui lòng kiểm tra kết nối rồi thử lại.",
  retryFailed: "Chưa thể xử lý lại bản thu. Vui lòng thử lại sau.",
  progressRetry: "Tạm thời chưa lấy được tiến trình. Hệ thống sẽ kiểm tra lại.",
  progressPaused: "Chưa nhận được kết quả. Nhấn kiểm tra lại để cập nhật tiến trình.",
  noFileToDownload: "Bản thu không còn trên thiết bị này nên chưa thể tải về.",
  noSubmission: "Bạn chưa gửi bản thu nào. Quay lại màn ghi âm để nộp bài.",
  chooseSheet: "Chọn bản nhạc (nhạc cụ) của bài trong thư viện để nộp bài và nhận phân tích.",
  analyzed: "Bản thu của bạn đã được phân tích xong. Nhấn để xem kết quả.", // MSG-43
  download: "Đã tải bản thu về máy.",
  refNote: "Đang phát nốt mẫu...",
  resultProcessing: "Bản thu đang được xử lý. Kết quả sẽ hiển thị khi phân tích hoàn tất.", // MSG-30
  pitchUnavailable: "Chưa có dữ liệu cao độ để hiển thị biểu đồ so sánh.", // MSG-26
  resultLoadFailed: "Tải kết quả phân tích thất bại. Vui lòng thử lại.", // MSG-09
  resultPartFailed: "Chưa tải được phần này. Vui lòng thử lại.",
  referencePlaybackFailed: "Phát bản thu mẫu thất bại. Vui lòng thử lại.", // MSG-09
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

// Số tick mỗi phách của từng kiểu chia nhỏ phách (metronome)
export const SUB_TICKS: Record<SubdivisionKey, number> = { white: 0.5, black: 1, half: 2, quarter: 4 };

export const STAGE_LABELS = ["Kiểm tra chất lượng", "Phân tích audio", "So sánh với bản mẫu", "Tổng hợp kết quả"];

export const STAGE_ACTIVE_LABELS = [
  "Đang kiểm tra chất lượng",
  "Đang phân tích audio của bạn",
  "Đang so sánh với bản mẫu của giảng viên",
  "Đang tổng hợp lại kết quả",
];

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

export const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

export const PITCH_MIN_CLARITY = 0.9;
export const PITCH_MIN_VOLUME_DB = -50;
export const PITCH_MEDIAN_SIZE = 5;
export const PITCH_JUMP_CENTS = 50;
export const PITCH_CONFIRM_FRAMES = 2;
export const TUNER_HOLD_S = 0.25;
export const TUNER_UI_TICK_MS = 150;
export const TUNER_NOTE_HYSTERESIS_CENTS = 75;

export const CLICK_LOOKAHEAD_S = 0.12;
export const CLICK_TICK_MS = 25;
export const CLICK_START_LEAD_S = 0.05;
export const CLICK_HISTORY_SIZE = 32;
export const BEAT_UI_TICK_MS = 40;
export const TUNER_STRING_HOLD_MS = 400; // giữ trong dung sai bấy lâu mới tính là dây đã đúng

export const ONSET_GATE_DB = -45;
export const ONSET_RISE_DB = 6;
export const ONSET_LOOKBACK_FRAMES = 4;
export const ONSET_STABLE_FRAMES = 3;
export const ONSET_SILENCE_FRAMES = 5;
export const ONSET_MIN_GAP_S = 0.09;
export const CLICK_WINDOW_BEFORE_S = 0.03;
export const CLICK_WINDOW_AFTER_S = 0.08;
export const TEMPO_WINDOW_S = 8;
export const TEMPO_MIN_INTERVALS = 4;
export const TEMPO_MIN_IOI_S = 0.1;
export const TEMPO_MAX_BEATS = 4;
export const TEMPO_SMOOTHING = 0.3;
export const TEMPO_UI_TICK_MS = 500;
