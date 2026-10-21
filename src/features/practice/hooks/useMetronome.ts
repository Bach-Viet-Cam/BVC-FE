import { useCallback, useEffect, useRef, useState } from "react";
import { BPM_MAX, BPM_MIN, SAMPLE, SIGS } from "@/features/practice/constants/practiceConstants";
import type { BeatAccent, SubdivisionKey } from "@/features/practice/types/practiceTypes";

const FRESH_ACCENTS: BeatAccent[] = ["strong", "soft", "soft", "soft", "soft", "soft"];

function clampBpm(value: number): number {
  return Math.max(BPM_MIN, Math.min(BPM_MAX, Math.round(value)));
}

export function useMetronome() {
  const [bpm, setBpmValue] = useState(SAMPLE.targetBpm);
  const [sigIndex, setSigIndex] = useState(2);
  const [accents, setAccents] = useState<BeatAccent[]>(FRESH_ACCENTS);
  const [subdivision, setSubdivision] = useState<SubdivisionKey>("black");
  const [vibrate, setVibrate] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const taps = useRef<number[]>([]);

  const beats = SIGS[sigIndex].beats;

  useEffect(() => {
    if (!playing) return;
    const start = Date.now();
    const timer = setInterval(() => {
      const beatMs = 60000 / bpm;
      setCurrentBeat(Math.floor((Date.now() - start) / beatMs) % beats);
    }, 40);
    return () => {
      clearInterval(timer);
      setCurrentBeat(0);
    };
  }, [playing, bpm, beats]);

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
    togglePlaying: () => setPlaying((value) => !value),
    currentBeat,
    tapTempo,
  };
}
