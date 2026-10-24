import { format, isSameDay, subDays } from "date-fns";
import { fmtTime } from "@/features/practice/utils/practiceFormat";
import type { PitchPoint, ResultHistory, ResultIssue } from "@/features/practice/types/practiceResultTypes";

export interface FeedbackPart {
  text: string;
  strong: boolean;
}

export interface SegmentSuggestion {
  id: string;
  label: string;
  start: number;
  end: number;
  dot: "star" | "orange" | "grey";
}

// "2 phút 41" như thiết kế; dưới một phút chỉ ghi giây
export function formatDurationLabel(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  if (minutes === 0) return `${rest} giây`;
  return rest === 0 ? `${minutes} phút` : `${minutes} phút ${String(rest).padStart(2, "0")}`;
}

export function formatAttemptTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (isSameDay(date, now)) return `Hôm nay ${format(date, "HH:mm")}`;
  if (isSameDay(date, subDays(now, 1))) return `Hôm qua ${format(date, "HH:mm")}`;
  return format(date, "dd/MM HH:mm");
}

export function growthLabel(history: ResultHistory): string {
  if (history.isFirstAttempt || history.deltaPercent === null) return "Lần đầu tiên";
  const delta = Math.round(history.deltaPercent);
  if (delta > 0) return `+${delta}% (Tăng trưởng)`;
  if (delta < 0) return `-${Math.abs(delta)}% (Giảm)`;
  return "Không đổi";
}

// Nhận xét AI là văn bản thuần: tách đoạn theo dòng trống (một đoạn dài thì gom 2 câu một đoạn),
// in đậm các mốc thời gian như "(0.0s - 4.0s)" để học viên dễ dò lại trên biểu đồ
const TIME_RANGE = /\(?\d+(?:[.,]\d+)?\s*s\s*-\s*\d+(?:[.,]\d+)?\s*s\)?/g;
const SENTENCES_PER_PARAGRAPH = 2;

export function feedbackParagraphs(text: string): FeedbackPart[][] {
  const blocks = text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
  const paragraphs = blocks.length > 1 ? blocks : groupSentences(text.trim());
  return paragraphs.map(highlightTimeRanges);
}

function groupSentences(text: string): string[] {
  // Chỉ ngắt câu trước chữ hoa, nên số thập phân như "0.0s" không bị cắt
  const sentences = text.split(/(?<=[.!?])\s+(?=\p{Lu})/u);
  const groups: string[] = [];
  for (let index = 0; index < sentences.length; index += SENTENCES_PER_PARAGRAPH) {
    groups.push(sentences.slice(index, index + SENTENCES_PER_PARAGRAPH).join(" "));
  }
  return groups;
}

function highlightTimeRanges(paragraph: string): FeedbackPart[] {
  const parts: FeedbackPart[] = [];
  let cursor = 0;
  for (const match of paragraph.matchAll(TIME_RANGE)) {
    const start = match.index ?? 0;
    if (start > cursor) parts.push({ text: paragraph.slice(cursor, start), strong: false });
    parts.push({ text: match[0], strong: true });
    cursor = start + match[0].length;
  }
  if (cursor < paragraph.length) parts.push({ text: paragraph.slice(cursor), strong: false });
  return parts;
}

export function issuesInRange(issues: ResultIssue[], start: number, end: number): ResultIssue[] {
  return issues.filter((issue) => issue.startSec < end && issue.endSec > start);
}

const rangeText = (start: number, end: number) => `${fmtTime(start)} - ${fmtTime(end)}`;

// Gợi ý đoạn luyện: cửa sổ dồn nhiều lỗi nhất, đoạn lệch tempo đầu tiên, và đoạn khởi động đầu bài
export function segmentSuggestions(issues: ResultIssue[], durationSec: number): SegmentSuggestion[] {
  const suggestions: SegmentSuggestion[] = [];
  const windowSec = Math.min(15, Math.max(4, durationSec / 4));
  const worst = issues
    .map((issue) => {
      const start = issue.startSec;
      const end = Math.min(durationSec, start + windowSec);
      return { start, end, count: issuesInRange(issues, start, end).length };
    })
    .reduce<{ start: number; end: number; count: number } | null>(
      (best, item) => (!best || item.count > best.count ? item : best),
      null
    );
  if (worst) {
    suggestions.push({
      id: "worst",
      label: `Đoạn lỗi nhiều nhất: ${rangeText(worst.start, worst.end)}`,
      start: worst.start,
      end: worst.end,
      dot: "star",
    });
  }
  const tempo = issues.find(
    (issue) =>
      (issue.rhythmStatus === "fast" || issue.rhythmStatus === "slow") && (!worst || issue.startSec >= worst.end)
  );
  if (tempo) {
    suggestions.push({
      id: "tempo",
      label: `${rangeText(tempo.startSec, tempo.endSec)} (Lỗi tempo)`,
      start: tempo.startSec,
      end: tempo.endSec,
      dot: "orange",
    });
  }
  const warmupEnd = Math.min(durationSec, Math.max(10, durationSec / 4));
  suggestions.push({
    id: "warmup",
    label: `${rangeText(0, warmupEnd)} (Khởi động)`,
    start: 0,
    end: warmupEnd,
    dot: "grey",
  });
  return suggestions;
}

interface Coord {
  x: number;
  y: number;
}

// Đường SVG cong mềm đi qua đúng từng điểm (mỗi điểm là một mốc thời gian với một cao độ).
// Gặp khoảng lặng (null) thì nhấc bút để không nối qua chỗ trống.
export function buildLinePath(
  points: PitchPoint[],
  valueIndex: 1 | 2,
  xAt: (seconds: number) => number,
  yAt: (hz: number) => number
): string {
  return buildSeriesPath(
    points.map((point) => point[0]),
    points.map((point) => point[valueIndex]),
    xAt,
    yAt
  );
}

// Như buildLinePath cho một dãy giá trị bất kỳ theo thời gian (ví dụ độ lệch cent)
export function buildSeriesPath(
  times: number[],
  values: (number | null)[],
  xAt: (seconds: number) => number,
  yAt: (value: number) => number
): string {
  const runs: Coord[][] = [];
  let current: Coord[] = [];
  values.forEach((value, index) => {
    if (value === null) {
      if (current.length > 0) runs.push(current);
      current = [];
    } else {
      current.push({ x: xAt(times[index]), y: yAt(value) });
    }
  });
  if (current.length > 0) runs.push(current);
  return runs.map(monotonePath).join(" ");
}

// Spline bậc ba đơn điệu (Fritsch-Carlson): cong mềm nhưng không vọt quá điểm dữ liệu,
// nên nốt ngân vẫn phẳng và đường không tạo đỉnh giả trước / sau mỗi lần chuyển nốt
function monotonePath(coords: Coord[]): string {
  const format = (coord: Coord) => `${coord.x.toFixed(1)} ${coord.y.toFixed(1)}`;
  const commands = [`M${format(coords[0])}`];
  if (coords.length === 1) return commands[0];
  const slopes = coords.slice(1).map((coord, index) => (coord.y - coords[index].y) / (coord.x - coords[index].x || 1));
  const tangents = coords.map((_, index) => {
    if (index === 0) return slopes[0];
    if (index === coords.length - 1) return slopes[index - 1];
    const [before, after] = [slopes[index - 1], slopes[index]];
    return before * after <= 0 ? 0 : (before + after) / 2;
  });
  slopes.forEach((slope, index) => {
    if (slope === 0) {
      tangents[index] = 0;
      tangents[index + 1] = 0;
      return;
    }
    const startRatio = tangents[index] / slope;
    const endRatio = tangents[index + 1] / slope;
    const magnitude = startRatio * startRatio + endRatio * endRatio;
    if (magnitude > 9) {
      const scale = 3 / Math.sqrt(magnitude);
      tangents[index] = scale * startRatio * slope;
      tangents[index + 1] = scale * endRatio * slope;
    }
  });
  for (let index = 1; index < coords.length; index += 1) {
    const start = coords[index - 1];
    const end = coords[index];
    const third = (end.x - start.x) / 3;
    const firstControl = { x: start.x + third, y: start.y + tangents[index - 1] * third };
    const secondControl = { x: end.x - third, y: end.y - tangents[index] * third };
    commands.push(`C${format(firstControl)} ${format(secondControl)} ${format(end)}`);
  }
  return commands.join(" ");
}

// Làm mượt cao độ để vẽ: trung bình có trọng số Gauss theo nốt (thang MIDI) trong từng đoạn liền nhau,
// không trộn qua khoảng lặng. Bước chuyển nốt thành dốc mềm thay vì bậc thang; dữ liệu gốc không đổi.
export function smoothRuns(points: PitchPoint[], valueIndex: 1 | 2, sigmaPoints: number): PitchPoint[] {
  const smoothed = points.map((point) => [...point] as PitchPoint);
  if (sigmaPoints <= 0) return smoothed;
  const radius = Math.ceil(sigmaPoints * 3);
  const toMidi = (hz: number) => 69 + 12 * Math.log2(hz / 440);
  points.forEach((point, index) => {
    if (point[valueIndex] === null) return;
    let weightSum = 0;
    let midiSum = 0;
    for (const direction of [-1, 1]) {
      for (let offset = direction === -1 ? 0 : 1; offset <= radius; offset += 1) {
        const neighbor = points[index + direction * offset]?.[valueIndex];
        if (neighbor === null || neighbor === undefined) break;
        const weight = Math.exp(-(offset * offset) / (2 * sigmaPoints * sigmaPoints));
        weightSum += weight;
        midiSum += weight * toMidi(neighbor);
      }
    }
    smoothed[index][valueIndex] = 440 * 2 ** ((midiSum / weightSum - 69) / 12);
  });
  return smoothed;
}

// Đoạn có cao độ quá ngắn (dưới minRun điểm liền nhau) thường là tạp âm hoặc pyin bắt nhầm quãng tám: bỏ khi vẽ
export function dropShortRuns(points: PitchPoint[], valueIndex: 1 | 2, minRun: number): PitchPoint[] {
  const kept = points.map((point) => [...point] as PitchPoint);
  let runStart = -1;
  for (let index = 0; index <= kept.length; index += 1) {
    const isVoiced = index < kept.length && kept[index][valueIndex] !== null;
    if (isVoiced && runStart < 0) runStart = index;
    if (!isVoiced && runStart >= 0) {
      if (index - runStart < minRun)
        for (let short = runStart; short < index; short += 1) kept[short][valueIndex] = null;
      runStart = -1;
    }
  }
  return kept;
}

// Khoảng cao độ của trục tung theo bách phân vị, để vài điểm lạc (bắt nhầm quãng tám) không kéo giãn cả biểu đồ.
// Thêm nửa cung mỗi đầu cho đường không chạm mép.
export function robustHzRange(points: PitchPoint[], trimRatio: number): { minHz: number; maxHz: number } | null {
  const values = points
    .flatMap(([, teacher, student]) => [teacher, student])
    .filter((hz): hz is number => hz !== null)
    .sort((first, second) => first - second);
  if (values.length === 0) return null;
  const at = (ratio: number) =>
    values[Math.min(values.length - 1, Math.max(0, Math.round(ratio * (values.length - 1))))];
  const semitone = 2 ** (1 / 12);
  return { minHz: at(trimRatio) / semitone, maxHz: at(1 - trimRatio) * semitone };
}

export function nearestPoint(points: PitchPoint[], seconds: number): PitchPoint | null {
  return points.reduce<PitchPoint | null>(
    (closest, point) => (!closest || Math.abs(point[0] - seconds) < Math.abs(closest[0] - seconds) ? point : closest),
    null
  );
}
