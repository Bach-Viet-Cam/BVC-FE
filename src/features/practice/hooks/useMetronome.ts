import { useCallback, useEffect, useRef, useState } from "react";
import {
  BEAT_UI_TICK_MS,
  BPM_MAX,
  BPM_MIN,
  CLICK_START_LEAD_S,
  PRACTICE_DEFAULTS,
  SIGS,
  SUB_TICKS,
} from "@/features/practice/constants/practiceConstants";
import type { BeatAccent, SubdivisionKey } from "@/features/practice/types/practiceTypes";
import { ClickScheduler, outputLatencyOf } from "@/features/practice/utils/clickScheduler";

const FRESH_ACCENTS: BeatAccent[] = ["strong", "soft", "soft", "soft", "soft", "soft"];

function clampBpm(value: number): number {
  return Math.max(BPM_MIN, Math.min(BPM_MAX, Math.round(value)));
}

export function useMetronome() {
  const [bpm, setBpmValue] = useState(PRACTICE_DEFAULTS.targetBpm);
  const [sigIndex, setSigIndex] = useState(2);
  const [accents, setAccents] = useState<BeatAccent[]>(FRESH_ACCENTS);
  const [subdivision, setSubdivision] = useState<SubdivisionKey>("black");
  const [vibrate, setVibrate] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [ctx, setCtx] = useState<AudioContext | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const taps = useRef<number[]>([]);

  const beats = SIGS[sigIndex].beats;

  const accentsRef = useRef(accents);
  const vibrateRef = useRef(vibrate);
  useEffect(() => {
    accentsRef.current = accents;
    vibrateRef.current = vibrate;
  }, [accents, vibrate]);

  // AudioContext riêng của metronome, tạo khi bấm phát lần đầu (cử chỉ người dùng) và đóng khi rời màn
  useEffect(
    () => () => {
      void ctxRef.current?.close();
    },
    []
  );

  useEffect(() => {
    if (!playing || !ctx) return;
    const origin = ctx.currentTime + CLICK_START_LEAD_S;
    const beatSec = 60 / bpm;
    const ticksPerBeat = SUB_TICKS[subdivision];
    const scheduler = new ClickScheduler(ctx, {
      originTime: origin,
      bpm,
      beatsPerBar: beats,
      ticksPerBeat,
      accentOf: (tick) => {
        if (!Number.isInteger(tick / ticksPerBeat)) return false; // tick chia nhỏ giữa hai phách
        const level = accentsRef.current[Math.floor(tick / ticksPerBeat) % beats];
        return level === "off" ? null : level === "strong";
      },
    });
    scheduler.start();

    let lastIndex = -1;
    const timer = window.setInterval(() => {
      const heard = ctx.currentTime - outputLatencyOf(ctx);
      const index = Math.floor((heard - origin) / beatSec);
      if (index < 0 || index === lastIndex) return;
      lastIndex = index;
      const beat = index % beats;
      setCurrentBeat(beat);
      if (vibrateRef.current && accentsRef.current[beat] === "strong") navigator.vibrate?.(20);
    }, BEAT_UI_TICK_MS);

    return () => {
      scheduler.stop();
      window.clearInterval(timer);
      setCurrentBeat(0);
    };
  }, [playing, ctx, bpm, beats, subdivision]);

  const togglePlaying = useCallback(() => {
    if (!playing && !ctxRef.current) {
      ctxRef.current = new AudioContext({ latencyHint: "interactive" });
      setCtx(ctxRef.current);
    }
    if (!playing) void ctxRef.current?.resume();
    setPlaying(!playing);
  }, [playing]);

  const setSig = useCallback((index: number) => {
    setSigIndex(index);
    setAccents(FRESH_ACCENTS);
  }, []);

  const cycleBeat = useCallback((index: number) => {
    setAccents((list) =>
      list.map((value, i) =>
        i === index ? (value === "strong" ? "soft" : value === "soft" ? "off" : "strong") : value
      )
    );
  }, []);

  // Giữ các lần chạm trong 2.5 giây gần nhất, tối đa 5 lần
  const tapTempo = useCallback(() => {
    const now = Date.now();
    const recent = [...taps.current.filter((t) => now - t < 2500), now].slice(-5);
    taps.current = recent;
    if (recent.length >= 2) {
      const avg = (recent[recent.length - 1] - recent[0]) / (recent.length - 1);
      setBpmValue(clampBpm(60000 / avg));
    }
  }, []);

  return {
    bpm,
    setBpm: (value: number) => setBpmValue(clampBpm(value)),
    sigIndex,
    setSig,
    beats,
    accents,
    cycleBeat,
    subdivision,
    setSubdivision,
    vibrate,
    toggleVibrate: () => setVibrate((value) => !value),
    playing,
    togglePlaying,
    currentBeat,
    tapTempo,
  };
}
