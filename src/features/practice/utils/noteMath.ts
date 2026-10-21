import type { ExpectedNote } from "@/features/practice/types/practiceAudioTypes";
import type { NoteInfo } from "@/features/practice/types/practiceTypes";

const VN_NAMES = ["Đô", "Đô#", "Rê", "Rê#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"];
const EN_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// MIDI dạng số thực: 69 = A4 = 440 Hz; phần thập phân × 100 = cents
export function hzToMidiFloat(hz: number): number {
  return 69 + 12 * Math.log2(hz / 440);
}

export function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function midiToNoteInfo(midi: number): NoteInfo {
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return { vn: VN_NAMES[pc], en: `${EN_NAMES[pc]}${octave}`, f: midiToHz(midi) };
}

// Nốt kỳ vọng tại thời điểm t (giây trên dòng thời gian bài); notes đã sắp theo start
export function noteAtTime(notes: ExpectedNote[], t: number): ExpectedNote {
  let lo = 0;
  let hi = notes.length - 1;
  let found = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (notes[mid].start <= t) {
      found = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return notes[found];
}

export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
