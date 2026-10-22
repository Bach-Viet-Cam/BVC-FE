import { useCallback, useEffect, useRef, useState } from "react";
import { STRINGS, TUNER_TOLERANCE_CENTS } from "@/features/practice/constants/practiceConstants";
import { tuneCents } from "@/features/practice/utils/practiceSimulation";

export function useTuner(micDenied: boolean) {
  const [selected, setSelected] = useState(1);
  const [tuned, setTuned] = useState<boolean[]>([true, false, false, false]);
  const [cents, setCents] = useState(0);
  const tuneStart = useRef(0);

  const pickString = useCallback((index: number) => {
    setSelected(index);
    tuneStart.current = Date.now();
    setTuned((list) => list.map((value, i) => (i === index ? false : value)));
  }, []);

  useEffect(() => {
    if (micDenied) return;
    if (tuneStart.current === 0) tuneStart.current = Date.now();
    const timer = setInterval(() => {
      const value = tuneCents(selected, tuneStart.current, Date.now());
      setCents(value);
      if (Math.abs(value) <= TUNER_TOLERANCE_CENTS) {
        setTuned((list) => (list[selected] ? list : list.map((v, i) => (i === selected ? true : v))));
      }
    }, 60);
    return () => clearInterval(timer);
  }, [selected, micDenied]);

  return {
    selected,
    tuned,
    cents: micDenied ? 0 : cents,
    tunedCount: tuned.filter(Boolean).length,
    currentString: STRINGS[selected],
    pickString,
  };
}
