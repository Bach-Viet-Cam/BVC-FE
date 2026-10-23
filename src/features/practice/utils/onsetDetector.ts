import {
  CLICK_WINDOW_BEFORE_S,
  ONSET_GATE_DB,
  ONSET_LOOKBACK_FRAMES,
  ONSET_MIN_GAP_S,
  ONSET_RISE_DB,
  ONSET_SILENCE_FRAMES,
  ONSET_STABLE_FRAMES,
} from "@/features/practice/constants/practiceConstants";
import type { PitchFrame } from "@/features/practice/types/practiceAudioTypes";
import { hzToMidiFloat } from "@/features/practice/utils/noteMath";
import { CLICK_ACCENT_HZ, CLICK_NORMAL_HZ } from "@/shared/utils/clickSound";

const CLICK_MIDIS = new Set([CLICK_NORMAL_HZ, CLICK_ACCENT_HZ].map((hz) => Math.round(hzToMidiFloat(hz))));

function inClickWindow(time: number, clickTimes: readonly number[], clickLag: number): boolean {
  return clickTimes.some((click) => time >= click - CLICK_WINDOW_BEFORE_S && time <= click + clickLag);
}

export class OnsetDetector {
  private dbHistory: number[] = [];
  private runMidi: number | null = null;
  private runStart = 0;
  private runLen = 0;
  private silentFrames = 0;
  private stableMidi: number | null = null;
  private lastOnset = -Infinity;
  private readonly hasPitch: boolean;

  constructor(hasPitch: boolean) {
    this.hasPitch = hasPitch;
  }

  // Trả về thời điểm onset (giây, đồng hồ AudioContext) hoặc null
  process(frame: PitchFrame, clickTimes: readonly number[], clickLag: number): number | null {
    const inClick = clickTimes.length > 0 && inClickWindow(frame.time, clickTimes, clickLag);
    const candidates: number[] = [];

    // A. năng lượng
    const db = 20 * Math.log10(Math.max(frame.hopRms, 1e-9));
    if (this.dbHistory.length === ONSET_LOOKBACK_FRAMES) {
      const rise = db - Math.min(...this.dbHistory);
      const dropForClick = inClick && this.hasPitch;
      if (db >= ONSET_GATE_DB && rise >= ONSET_RISE_DB && !dropForClick) candidates.push(frame.time);
    }
    this.dbHistory.push(db);
    if (this.dbHistory.length > ONSET_LOOKBACK_FRAMES) this.dbHistory.shift();

    // B. đổi cao độ
    if (this.hasPitch) {
      let midi = frame.hz === null ? null : Math.round(hzToMidiFloat(frame.hz));
      const isClickTone = midi !== null && inClick && CLICK_MIDIS.has(midi);
      if (isClickTone) midi = null;
      if (midi === null) {
        if (!isClickTone && ++this.silentFrames >= ONSET_SILENCE_FRAMES) this.stableMidi = null;
        this.runMidi = null;
        this.runLen = 0;
      } else {
        this.silentFrames = 0;
        if (midi === this.runMidi) this.runLen++;
        else {
          this.runMidi = midi;
          this.runStart = frame.time;
          this.runLen = 1;
        }
        if (this.runLen === ONSET_STABLE_FRAMES && this.runMidi !== this.stableMidi) {
          candidates.push(this.runStart);
          this.stableMidi = this.runMidi;
        }
      }
    }

    // D. gộp
    for (const time of candidates.sort((a, b) => a - b)) {
      if (Math.abs(time - this.lastOnset) < ONSET_MIN_GAP_S) continue;
      this.lastOnset = time;
      return time;
    }
    return null;
  }
}
