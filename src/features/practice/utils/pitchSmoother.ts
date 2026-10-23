import {
  PITCH_CONFIRM_FRAMES,
  PITCH_JUMP_CENTS,
  PITCH_MEDIAN_SIZE,
} from "@/features/practice/constants/practiceConstants";
import { median } from "@/features/practice/utils/noteMath";

// Làm mượt MIDI số thực: median trượt + cần PITCH_CONFIRM_FRAMES khung đồng thuận mới đổi nốt
export class PitchSmoother {
  private history: number[] = [];
  private pending: number[] = [];

  push(midi: number): number {
    if (this.history.length === 0) {
      this.history.push(midi);
      return midi;
    }
    const current = median(this.history);
    if (Math.abs(midi - current) * 100 <= PITCH_JUMP_CENTS) {
      this.pending = [];
      this.history.push(midi);
      if (this.history.length > PITCH_MEDIAN_SIZE) this.history.shift();
      return median(this.history);
    }
    const last = this.pending[this.pending.length - 1];
    if (last !== undefined && Math.abs(midi - last) * 100 > PITCH_JUMP_CENTS) this.pending = [];
    this.pending.push(midi);
    if (this.pending.length >= PITCH_CONFIRM_FRAMES) {
      this.history = this.pending;
      this.pending = [];
      return median(this.history);
    }
    return current;
  }

  reset(): void {
    this.history = [];
    this.pending = [];
  }
}
