import { useCallback, useEffect, useRef, useState } from "react";

export function usePartsPreview(duration: number, play: (position: number, rate: number) => void, pause: () => void) {
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const clock = useRef({ position: 0, startedAt: 0, playing: false });
  const stop = useCallback(() => {
    pause();
    clock.current.playing = false;
    setPlaying(false);
  }, [pause]);
  const seek = useCallback(
    (value: number) => {
      const target = Math.max(0, Math.min(duration, value));
      clock.current.position = target;
      clock.current.startedAt = performance.now();
      setPosition(target);
      if (clock.current.playing) play(target, 1);
    },
    [duration, play]
  );
  const toggle = useCallback(() => {
    if (clock.current.playing) {
      clock.current.position = Math.min(
        duration,
        clock.current.position + (performance.now() - clock.current.startedAt) / 1000
      );
      setPosition(clock.current.position);
      stop();
    } else {
      const target = clock.current.position >= duration ? 0 : clock.current.position;
      clock.current = { position: target, startedAt: performance.now(), playing: true };
      setPosition(target);
      play(target, 1);
      setPlaying(true);
    }
  }, [duration, play, stop]);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const next = Math.min(duration, clock.current.position + (performance.now() - clock.current.startedAt) / 1000);
      setPosition(next);
      if (next >= duration) {
        clock.current.position = duration;
        stop();
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [duration, playing, stop]);
  useEffect(() => () => pause(), [pause]);
  return { position, playing, toggle, seek, stop };
}
