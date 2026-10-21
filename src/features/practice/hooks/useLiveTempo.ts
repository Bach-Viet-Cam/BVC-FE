import { useEffect, useRef, useState } from "react";
import { CLICK_WINDOW_AFTER_S, TEMPO_UI_TICK_MS } from "@/features/practice/constants/practiceConstants";
import type { PitchStream } from "@/features/practice/hooks/usePitchStream";
import { outputLatencyOf } from "@/features/practice/utils/clickScheduler";
import { OnsetDetector } from "@/features/practice/utils/onsetDetector";
import { TempoEstimator } from "@/features/practice/utils/tempoEstimator";

// Xấp xỉ độ dài cửa sổ phân tích (>= 2048 mẫu ở 44,1-48 kHz), khỏi truyền windowSize qua nhiều tầng
const ANALYSIS_WINDOW_S = 0.05;

interface UseLiveTempoOptions {
  ctx: AudioContext;
  subscribe: PitchStream["subscribe"];
  active: boolean; // đang ghi + micro sẵn sàng
  recordStartTime: number | null;
  targetBpm: number;
  gridBeats: number;
  hasPitch: boolean;
  clickOn: boolean;
  getClickTimes: () => readonly number[];
}

export function useLiveTempo({
  ctx,
  subscribe,
  active,
  recordStartTime,
  targetBpm,
  gridBeats,
  hasPitch,
  clickOn,
  getClickTimes,
}: UseLiveTempoOptions) {
  const [liveBpm, setLiveBpm] = useState<number | null>(null);
  const clickOnRef = useRef(clickOn);

  useEffect(() => {
    clickOnRef.current = clickOn; // đổi click giữa chừng không reset bộ đo
  }, [clickOn]);

  useEffect(() => {
    if (!active || recordStartTime === null) return;
    const detector = new OnsetDetector(hasPitch);
    const estimator = new TempoEstimator(targetBpm, gridBeats);
    let lastFrameTime = recordStartTime;

    const unsubscribe = subscribe((frame) => {
      lastFrameTime = frame.time;
      if (frame.time < recordStartTime) return;
      const clickTimes = clickOnRef.current ? getClickTimes() : [];
      const clickLag = CLICK_WINDOW_AFTER_S + outputLatencyOf(ctx) + ANALYSIS_WINDOW_S;
      const onset = detector.process(frame, clickTimes, clickLag);
      if (onset !== null && onset >= recordStartTime) estimator.addOnset(onset);
    });

    const timer = window.setInterval(() => setLiveBpm(estimator.update(lastFrameTime)), TEMPO_UI_TICK_MS);

    return () => {
      unsubscribe();
      window.clearInterval(timer);
      setLiveBpm(null);
    };
  }, [ctx, subscribe, active, recordStartTime, targetBpm, gridBeats, hasPitch, getClickTimes]);

  return { liveBpm };
}
