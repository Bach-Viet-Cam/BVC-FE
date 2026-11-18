import { type ListeningMode } from "@/features/ensemble/types/ensembleTypes";

/** Nhịp co giãn của thước thời gian: mỗi lần dài thêm 15 giây thì thước mới đổi tỉ lệ. */
const SPAN_STEP_SEC = 15;
const MIN_SPAN_SEC = 30;

export interface RulerTick {
  sec: number;
  major: boolean;
}

/** Độ dài thước hiển thị: vừa đủ chứa nội dung, làm tròn lên bội số 15 giây, không vượt giới hạn thu. */
export function pickTimelineSpan(contentSec: number, maxSec: number): number {
  const safe = Number.isFinite(contentSec) ? Math.max(0, contentSec) : 0;
  const stepped = Math.ceil(safe / SPAN_STEP_SEC) * SPAN_STEP_SEC;
  return Math.min(Math.max(maxSec, MIN_SPAN_SEC), Math.max(MIN_SPAN_SEC, stepped));
}

/** Vạch chia: càng dài càng thưa để nhãn không dính nhau. */
export function buildRulerTicks(spanSec: number): RulerTick[] {
  const minorEvery = spanSec <= 90 ? 1 : 5;
  const majorEvery = spanSec <= 60 ? 10 : spanSec <= 90 ? 15 : 30;
  const ticks: RulerTick[] = [];
  for (let sec = 0; sec <= spanSec; sec += minorEvery) {
    ticks.push({ sec, major: sec % majorEvery === 0 });
  }
  return ticks;
}

/** Gộp (hoặc giãn) dạng sóng về đúng `count` cột, lấy giá trị lớn nhất của mỗi nhóm. */
export function resamplePeaks(peaks: readonly number[], count: number): number[] {
  if (count <= 0 || peaks.length === 0) return [];
  const total = peaks.length;
  const result: number[] = [];
  for (let index = 0; index < count; index += 1) {
    const from = Math.floor((index * total) / count);
    const to = Math.max(from + 1, Math.floor(((index + 1) * total) / count));
    let loudest = 0;
    for (let cursor = from; cursor < Math.min(total, to); cursor += 1) {
      if (peaks[cursor] > loudest) loudest = peaks[cursor];
    }
    result.push(loudest);
  }
  return result;
}

/** Biên độ thô của micro (0..1) thành độ cao cột nhìn được: nâng tiếng nhỏ lên nhưng không vượt 1. */
export function levelToBar(rawPeak: number): number {
  return Math.min(1, Math.pow(Math.max(0, rawPeak), 0.6) * 1.6);
}

/** Tên ngắn cho nhãn làn: bỏ tiền tố "Đàn" và viết hoa chữ đầu. */
export function shortInstrumentName(name: string): string {
  const short = name.replace(/^đàn\s+/i, "").trim();
  return short ? short.charAt(0).toUpperCase() + short.slice(1) : name;
}

export const WAVE_BAR_WIDTH = 3;
export const WAVE_BAR_PITCH = 5;

/** Đường vẽ các cột sóng (SVG path) với cột tròn đầu, cao theo biên độ; rỗng nếu chưa đủ chỗ vẽ. */
export function buildWavePath(peaks: readonly number[], widthPx: number, heightPx: number): string {
  const count = Math.floor(widthPx / WAVE_BAR_PITCH);
  if (count < 1 || peaks.length === 0) return "";
  const mid = heightPx / 2;
  const maxHalf = mid - 8;
  let path = "";
  resamplePeaks(peaks, count).forEach((peak, index) => {
    const half = Math.max(1.5, Math.pow(Math.min(1, peak), 0.8) * maxHalf);
    const x = (index * WAVE_BAR_PITCH + WAVE_BAR_WIDTH / 2 + 1).toFixed(1);
    path += `M${x} ${(mid - half).toFixed(1)}V${(mid + half).toFixed(1)}`;
  });
  return path;
}

export const LISTENING_HINT: Record<ListeningMode, string> = {
  speaker: "Micro có thể thu lẫn tiếng các bè. Dùng tai nghe nếu muốn bản thu sạch hơn.",
  headphones: "Bản thu chỉ có tiếng đàn của bạn, không lẫn tiếng các bè.",
};

interface LabelOptions {
  pxPerSec: number;
  widthPx: number;
  playheadSec: number;
  /** Khoảng cách tối thiểu giữa hai nhãn liền nhau. */
  minGapPx: number;
  /** Chừa chỗ quanh đầu phát cho bong bóng thời gian. */
  playheadClearPx: number;
  labelWidthPx: number;
}

/** Chọn các mốc có nhãn: thưa dần theo bề rộng, không đè bong bóng đầu phát, không tràn mép phải. */
export function pickRulerLabels(ticks: readonly RulerTick[], options: LabelOptions): number[] {
  const { pxPerSec, widthPx, playheadSec, minGapPx, playheadClearPx, labelWidthPx } = options;
  const kept: number[] = [];
  let lastX = -Infinity;
  for (const { sec, major } of ticks) {
    if (!major) continue;
    const x = sec * pxPerSec;
    if (x - lastX < minGapPx) continue;
    lastX = x;
    if (Math.abs(sec - playheadSec) * pxPerSec <= playheadClearPx) continue;
    if (x + labelWidthPx >= widthPx) continue;
    kept.push(sec);
  }
  return kept;
}
