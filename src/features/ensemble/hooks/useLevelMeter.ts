import { type RefObject, useEffect } from "react";

const LEVEL_GAIN = 4; // tín hiệu bè/micro thường nhỏ; khuếch đại để chuyển động thấy rõ
const DECAY = 0.86; // hạ dần để nhịp "thở" mượt, không giật

export function useLevelMeter(analyser: AnalyserNode | null, targetRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;
    if (!analyser) {
      element.style.setProperty("--level", "0");
      return;
    }
    const samples = new Uint8Array(analyser.fftSize);
    let smoothed = 0;
    let frame = 0;
    const tick = () => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const sample of samples) {
        const centered = (sample - 128) / 128;
        sum += centered * centered;
      }
      smoothed = Math.max(Math.sqrt(sum / samples.length) * LEVEL_GAIN, smoothed * DECAY);
      element.style.setProperty("--level", Math.min(1, smoothed).toFixed(3));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      element.style.setProperty("--level", "0");
    };
  }, [analyser, targetRef]);
}
