import {
  BPM_MAX,
  BPM_MIN,
  TEMPO_MAX_BEATS,
  TEMPO_MIN_INTERVALS,
  TEMPO_MIN_IOI_S,
  TEMPO_SMOOTHING,
  TEMPO_WINDOW_S,
} from "@/features/practice/constants/practiceConstants";
import type { PracticeSessionConfig } from "@/features/practice/types/practiceAudioTypes";
import { median } from "@/features/practice/utils/noteMath";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Độ dài nốt ngắn nhất của bài (theo phách), làm tròn về 1/4, 1/2 hoặc 1 phách
export function noteGridBeats(session: PracticeSessionConfig): number {
  const beatSec = 60 / session.targetBpm;
  const shortest = Math.min(...session.notes.map((note) => note.dur / beatSec));
  const grids = [0.25, 0.5, 1];
  return grids.reduce((best, grid) => (Math.abs(grid - shortest) < Math.abs(best - shortest) ? grid : best), 1);
}

export class TempoEstimator {
  private onsets: number[] = [];
  private estimate: number | null = null;
  private readonly targetBpm: number;
  private readonly gridBeats: number;

  constructor(targetBpm: number, gridBeats: number) {
    this.targetBpm = targetBpm;
    this.gridBeats = gridBeats;
  }

  addOnset(time: number): void {
    this.onsets.push(time);
  }

  update(now: number): number | null {
    this.onsets = this.onsets.filter((time) => time >= now - TEMPO_WINDOW_S);
    if (this.onsets.length === 0) {
      this.estimate = null;
      return null;
    }
    const refBpm = clamp(this.estimate ?? this.targetBpm, this.targetBpm * 0.67, this.targetBpm * 1.5);
    const refBeat = 60 / refBpm;
    const bpms: number[] = [];
    for (let i = 1; i < this.onsets.length; i++) {
      const ioi = this.onsets[i] - this.onsets[i - 1];
      if (ioi < TEMPO_MIN_IOI_S) continue;
      const beats = Math.round(ioi / refBeat / this.gridBeats) * this.gridBeats;
      if (beats < this.gridBeats || beats > TEMPO_MAX_BEATS) continue;
      bpms.push((60 * beats) / ioi);
    }
    if (bpms.length >= TEMPO_MIN_INTERVALS) {
      const next = clamp(median(bpms), BPM_MIN, BPM_MAX);
      this.estimate = this.estimate === null ? next : this.estimate + TEMPO_SMOOTHING * (next - this.estimate);
    }
    return this.estimate === null ? null : Math.round(this.estimate);
  }
}
