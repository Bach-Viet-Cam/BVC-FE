import { NOTES, PRACTICE_DEFAULTS } from "@/features/practice/constants/practiceConstants";
import { NOTE_MAP } from "@/features/practice/utils/practiceSimulation";
import type { PracticeSessionConfig } from "@/features/practice/types/practiceAudioTypes";

// Giá trị mặc định của bảng Instrument phía BE (prisma: fmin_hz, fmax_hz)
const DEFAULT_FMIN_HZ = 80;
const DEFAULT_FMAX_HZ = 2000;

function hzToNearestMidi(hz: number): number {
  return Math.round(69 + 12 * Math.log2(hz / 440));
}

// targetBpm lấy từ GET /practice/target-bpm (BPM bài tập của lớp hoặc mặc định 60).
// TODO(BE): độ dài bài và nốt kỳ vọng vẫn là dữ liệu mô phỏng (GBR-10, GBR-47, GBR-48)
export function buildDemoSession(
  noPitch: boolean,
  targetBpm: number = PRACTICE_DEFAULTS.targetBpm
): PracticeSessionConfig {
  return {
    targetBpm,
    beatsPerBar: 4,
    pieceLenSec: PRACTICE_DEFAULTS.pieceLen,
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
