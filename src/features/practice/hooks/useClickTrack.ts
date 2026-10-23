import { useCallback, useEffect, useRef, useState } from "react";
import { BEAT_UI_TICK_MS, CLICK_START_LEAD_S, COUNT_IN_BEATS } from "@/features/practice/constants/practiceConstants";
import { ClickScheduler, outputLatencyOf } from "@/features/practice/utils/clickScheduler";

interface UseClickTrackOptions {
  ctx: AudioContext;
  enabled: boolean; // clickOn && mode === "record"
  bpm: number;
  beatsPerBar: number;
  gridOrigin: number | null; // recorder.recordStartTime
}

export function useClickTrack({ ctx, enabled, bpm, beatsPerBar, gridOrigin }: UseClickTrackOptions) {
  const [litBeat, setLitBeat] = useState(-1);
  const schedulerRef = useRef<ClickScheduler | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const origin = gridOrigin ?? ctx.currentTime + CLICK_START_LEAD_S;
    const beat = 60 / bpm;
    const scheduler = new ClickScheduler(ctx, { originTime: origin, bpm, beatsPerBar });
    scheduler.start();
    schedulerRef.current = scheduler;

    const timer = window.setInterval(() => {
      const heard = ctx.currentTime - outputLatencyOf(ctx);
      const index = Math.floor((heard - origin) / beat);
      setLitBeat(index >= 0 ? index % COUNT_IN_BEATS : -1);
    }, BEAT_UI_TICK_MS);

    return () => {
      scheduler.stop();
      schedulerRef.current = null;
      window.clearInterval(timer);
      setLitBeat(-1);
    };
  }, [ctx, enabled, bpm, beatsPerBar, gridOrigin]);

  // Bước 04 dùng để loại tiếng click lọt vào micro
  const getClickTimes = useCallback((): readonly number[] => schedulerRef.current?.recentClickTimes() ?? [], []);

  return { litBeat, getClickTimes };
}
