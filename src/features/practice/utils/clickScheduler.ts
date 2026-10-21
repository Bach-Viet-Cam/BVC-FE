import { CLICK_HISTORY_SIZE, CLICK_LOOKAHEAD_S, CLICK_TICK_MS } from "@/features/practice/constants/practiceConstants";
import { playClick } from "@/shared/utils/clickSound";

interface ClickSchedulerOptions {
  originTime: number; // ctx.currentTime của phách số 0
  bpm: number;
  beatsPerBar: number;
  ticksPerBeat?: number; // mặc định 1; 2 = móc đơn, 4 = móc kép, 0.5 = nốt trắng
  // true = nhấn, false = thường, null = bỏ qua tick này; mặc định nhấn phách đầu ô nhịp
  accentOf?: (tickIndex: number) => boolean | null;
}

interface ScheduledClick {
  node: OscillatorNode;
  time: number;
}

export function outputLatencyOf(ctx: AudioContext): number {
  return ctx.outputLatency || ctx.baseLatency || 0;
}

export class ClickScheduler {
  private nextIndex = 0;
  private timer: number | undefined;
  private scheduled: ScheduledClick[] = [];
  private history: number[] = [];
  private readonly ctx: AudioContext;
  private readonly options: ClickSchedulerOptions;

  constructor(ctx: AudioContext, options: ClickSchedulerOptions) {
    this.ctx = ctx;
    this.options = options;
  }

  get tickSec(): number {
    return 60 / this.options.bpm / (this.options.ticksPerBeat ?? 1);
  }

  start(): void {
    const { originTime } = this.options;
    // origin ở quá khứ: nhảy tới phách kế tiếp; origin ở tương lai: bắt đầu từ phách 0
    this.nextIndex = Math.max(0, Math.ceil((this.ctx.currentTime - originTime) / this.tickSec));
    this.tick();
    this.timer = window.setInterval(() => this.tick(), CLICK_TICK_MS);
  }

  stop(): void {
    window.clearInterval(this.timer);
    this.timer = undefined;
    const now = this.ctx.currentTime;
    for (const click of this.scheduled) {
      if (click.time <= now) continue;
      try {
        click.node.stop(); // huỷ click đã xếp lịch nhưng chưa phát
      } catch {
        // đã dừng
      }
    }
    this.scheduled = [];
  }

  recentClickTimes(): readonly number[] {
    return this.history;
  }

  private tick(): void {
    const { originTime, beatsPerBar, accentOf } = this.options;
    const horizon = this.ctx.currentTime + CLICK_LOOKAHEAD_S;
    for (;;) {
      const time = originTime + this.nextIndex * this.tickSec;
      if (time >= horizon) break;
      const accent = accentOf ? accentOf(this.nextIndex) : this.nextIndex % beatsPerBar === 0;
      this.nextIndex++;
      if (accent === null) continue;
      const node = playClick(this.ctx, accent, time);
      this.scheduled.push({ node, time });
      this.history.push(time);
      if (this.history.length > CLICK_HISTORY_SIZE) this.history.shift();
    }
    const keepAfter = this.ctx.currentTime - 1;
    this.scheduled = this.scheduled.filter((click) => click.time >= keepAfter);
  }
}
