import { useCallback, useEffect, useRef, useState } from "react";
import { REFERENCE_TONE } from "@/features/practice/constants/practiceConstants";

interface ToneVoice {
  oscillators: OscillatorNode[];
  gain: GainNode;
}

const COUNTDOWN_TICK_MS = 200;

// Phát nốt mẫu (cao độ chuẩn của một dây) trong REFERENCE_TONE.seconds giây bằng Web Audio:
// âm cơ bản dạng tam giác + bội âm bậc 2 nhỏ cho giống tiếng dây, lên / xuống âm lượng mềm để không bị "bụp".
// Bấm lại hoặc gọi stop() để dừng sớm; rời màn thì tự dừng.
export function useReferenceTone(ctx: AudioContext) {
  const voice = useRef<ToneVoice | null>(null);
  const countdown = useRef<number | null>(null);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [remainingSec, setRemainingSec] = useState(0);

  const clearCountdown = useCallback(() => {
    if (countdown.current !== null) window.clearInterval(countdown.current);
    countdown.current = null;
  }, []);

  const stop = useCallback(() => {
    const current = voice.current;
    voice.current = null;
    clearCountdown();
    setPlayingKey(null);
    setRemainingSec(0);
    if (!current) return;
    const now = ctx.currentTime;
    // Hạ âm lượng thật nhanh trước khi dừng để không nghe tiếng tách
    current.gain.gain.cancelScheduledValues(now);
    current.gain.gain.setTargetAtTime(0, now, 0.02);
    current.oscillators.forEach((oscillator) => {
      oscillator.onended = null;
      oscillator.stop(now + 0.1);
    });
  }, [ctx, clearCountdown]);

  const play = useCallback(
    (frequencyHz: number, key: string) => {
      stop();
      if (ctx.state === "suspended") void ctx.resume();
      const { seconds, volume, fadeInSec, fadeOutSec, overtoneLevel } = REFERENCE_TONE;
      const start = ctx.currentTime + 0.02;
      const end = start + seconds;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + fadeInSec);
      gain.gain.setValueAtTime(volume, end - fadeOutSec);
      gain.gain.linearRampToValueAtTime(0, end);
      gain.connect(ctx.destination);

      const fundamental = ctx.createOscillator();
      fundamental.type = "triangle";
      fundamental.frequency.value = frequencyHz;
      fundamental.connect(gain);

      const overtoneGain = ctx.createGain();
      overtoneGain.gain.value = overtoneLevel;
      overtoneGain.connect(gain);
      const overtone = ctx.createOscillator();
      overtone.type = "sine";
      overtone.frequency.value = frequencyHz * 2;
      overtone.connect(overtoneGain);

      const oscillators = [fundamental, overtone];
      oscillators.forEach((oscillator) => {
        oscillator.start(start);
        oscillator.stop(end);
      });
      fundamental.onended = () => {
        if (voice.current?.oscillators[0] !== fundamental) return;
        voice.current = null;
        clearCountdown();
        setPlayingKey(null);
        setRemainingSec(0);
      };
      voice.current = { oscillators, gain };

      setPlayingKey(key);
      setRemainingSec(seconds);
      countdown.current = window.setInterval(() => {
        setRemainingSec(Math.max(0, Math.ceil(end - ctx.currentTime)));
      }, COUNTDOWN_TICK_MS);
    },
    [ctx, stop, clearCountdown]
  );

  // Rời màn: dừng âm đang phát
  useEffect(() => () => stop(), [stop]);

  return { playingKey, remainingSec, play, stop };
}
