import { PRACTICE_DEFAULTS, STRINGS } from "@/features/practice/constants/practiceConstants";
import type { MappedNote } from "@/features/practice/types/practiceTypes";

// Bản đồ nốt: lặp mẫu 4 ô nhịp phủ toàn bài ở BPM mục tiêu
export function buildNoteMap(bpm: number, len: number): MappedNote[] {
  const beat = 60 / bpm;
  const bars: [string, number][][] = [
    [
      ["Sol4", 1],
      ["La4", 1],
      ["Si4", 1],
      ["Rê5", 1],
    ],
    [
      ["Mi5", 1],
      ["Rê5", 1],
      ["Si4", 1],
      ["Sol4", 1],
    ],
    [
      ["La4", 1],
      ["Si4", 1],
      ["Đô5", 1],
      ["Si4", 1],
    ],
    [
      ["Sol4", 2],
      ["Rê5", 2],
    ],
  ];
  const notes: MappedNote[] = [];
  let t = 0;
  let bar = 0;
  while (t < len) {
    const pat = bars[bar % bars.length];
    for (const [name, beats] of pat) {
      if (t >= len) break;
      notes.push({ name, start: t, dur: beats * beat });
      t += beats * beat;
    }
    bar++;
  }
  return notes;
}

export const NOTE_MAP = buildNoteMap(PRACTICE_DEFAULTS.targetBpm, PRACTICE_DEFAULTS.pieceLen);

export function noteAt(t: number): MappedNote {
  for (let i = NOTE_MAP.length - 1; i >= 0; i--) {
    if (t >= NOTE_MAP[i].start) return NOTE_MAP[i];
  }
  return NOTE_MAP[0];
}

export function simCents(t: number): number {
  let c = 3.2 * Math.sin(t * 1.7) + 2.2 * Math.sin(t * 4.3 + 1);
  const k = Math.floor(t / 11);
  const ph = t - k * 11;
  if (ph > 8.4 && ph < 9.8) c += (k % 2 === 0 ? 26 : -24) * Math.sin((Math.PI * (ph - 8.4)) / 1.4);
  return Math.max(-45, Math.min(45, c));
}

export function simBpm(t: number): number {
  let b = PRACTICE_DEFAULTS.targetBpm + 1.8 * Math.sin(t * 0.9) + 1.2 * Math.sin(t * 2.3 + 2);
  const k = Math.floor(t / 17);
  const ph = t - k * 17;
  if (ph > 12 && ph < 14.5) b += (k % 2 === 0 ? 7 : -8) * Math.sin((Math.PI * (ph - 12)) / 2.5);
  return b;
}

// Dây được chọn trôi dần về đúng cao độ sau khoảng 4 giây
export function tuneCents(stringIndex: number, tuneStart: number, now: number): number {
  return STRINGS[stringIndex].off * Math.exp(-(now - tuneStart) / 4000) + 1.4 * Math.sin(now / 260);
}

export function staticBars(n: number, seed: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    out.push(Math.min(1, 0.28 + 0.6 * Math.abs(Math.sin(i * 0.7 + seed) * Math.cos(i * 0.23 + seed * 0.5))));
  }
  return out;
}
