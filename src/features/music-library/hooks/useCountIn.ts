import { useCallback, useEffect, useRef, useState } from "react";
import { COUNT_IN_BEATS } from "@/features/practice/constants/practiceConstants";

/** Nhịp đếm cố định vì bản nhạc mới chưa có BPM: 60 BPM, mỗi tiếng đúng 1 giây. */
export const COUNT_IN_BPM = 60;
const CLICK_MS = 90;

function playClick(context: AudioContext, isAccent: boolean) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = isAccent ? 1046 : 784;
  const now = context.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.35, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + CLICK_MS / 1000);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + CLICK_MS / 1000 + 0.02);
}

// Đếm nhịp trước khi thu: phát từng tiếng "tách", đếm xong mới gọi onDone. Micro chưa mở nên tiếng đếm không lọt vào bản thu.
export function useCountIn() {
  const [beat, setBeat] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const contextRef = useRef<AudioContext | null>(null);

  const cancel = useCallback(() => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current = [];
    void contextRef.current?.close();
    contextRef.current = null;
    setBeat(null);
  }, []);

  const run = useCallback(
    (onDone: () => void) => {
      cancel();
      const context = new AudioContext();
      contextRef.current = context;
      const intervalMs = 60000 / COUNT_IN_BPM;
      for (let index = 0; index < COUNT_IN_BEATS; index += 1) {
        timersRef.current.push(
          window.setTimeout(() => {
            setBeat(index);
            playClick(context, index === 0);
          }, index * intervalMs)
        );
      }
      timersRef.current.push(
        window.setTimeout(() => {
          cancel();
          onDone();
        }, COUNT_IN_BEATS * intervalMs)
      );
    },
    [cancel]
  );

  useEffect(() => cancel, [cancel]);

  return { beat, run, cancel };
}
