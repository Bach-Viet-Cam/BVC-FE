import { NOTES, SAMPLE } from "@/features/practice/constants/practiceConstants";
import { NOTE_MAP } from "@/features/practice/utils/practiceSimulation";
import type { PracticeSessionConfig } from "@/features/practice/types/practiceAudioTypes";

// Giá trị mặc định của bảng Instrument phía BE (prisma: fmin_hz, fmax_hz)
const DEFAULT_FMIN_HZ = 80;
const DEFAULT_FMAX_HZ = 2000;

function hzToNearestMidi(hz: number): number {
  return Math.round(69 + 12 * Math.log2(hz / 440));
}

// TODO(BE): thay bằng dữ liệu assignment + file phân tích (GBR-10, GBR-47, GBR-48) khi BE có API
// TODO(BE): TempoCard còn đọc SAMPLE.targetBpm; chuyển sang session.targetBpm khi BE trả dữ liệu thật
export function buildDemoSession(noPitch: boolean): PracticeSessionConfig {
  return {
    targetBpm: SAMPLE.targetBpm,
    beatsPerBar: 4,
    pieceLenSec: SAMPLE.pieceLen,
    hasPitch: !noPitch,
    fminHz: DEFAULT_FMIN_HZ,
    fmaxHz: DEFAULT_FMAX_HZ,
    notes: NOTE_MAP.map((note) => ({
      midi: hzToNearestMidi(NOTES[note.name].f),
      start: note.start,
      dur: note.dur,
    })),
  };
}
