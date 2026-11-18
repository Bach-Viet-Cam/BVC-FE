import { useEffect, useState } from "react";
import { levelToBar } from "@/features/music-library/utils/studioTimeline";

const SAMPLE_MS = 100;

interface LevelSnapshot {
  levels: number[];
  seconds: number;
}

const EMPTY: LevelSnapshot = { levels: [], seconds: 0 };

/** Gom độ to của micro mỗi 100 ms trong lúc thu để vẽ làn bản thu "mọc" dần theo thời gian. */
export function useRecordingLevels(analyser: AnalyserNode | null, active: boolean): LevelSnapshot {
  const [snapshot, setSnapshot] = useState<LevelSnapshot>(EMPTY);

  useEffect(() => {
    if (!active) return;
    const startedAt = performance.now();
    const levels: number[] = [];
    const buffer = new Uint8Array(analyser?.fftSize ?? 0);

    const timer = window.setInterval(() => {
      let peak = 0;
      if (analyser) {
        analyser.getByteTimeDomainData(buffer);
        for (const sample of buffer) peak = Math.max(peak, Math.abs(sample - 128) / 128);
      }
      levels.push(levelToBar(peak));
      setSnapshot({ levels: levels.slice(), seconds: (performance.now() - startedAt) / 1000 });
    }, SAMPLE_MS);

    return () => {
      window.clearInterval(timer);
      setSnapshot(EMPTY);
    };
  }, [analyser, active]);

  return active ? snapshot : EMPTY;
}
