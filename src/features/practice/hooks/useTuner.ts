import { useCallback, useEffect, useState } from "react";
import { STRINGS, TUNER_STRING_HOLD_MS, TUNER_TOLERANCE_CENTS } from "@/features/practice/constants/practiceConstants";
import type { PracticeAudio } from "@/features/practice/hooks/usePracticeAudio";
import { useLiveTuner } from "@/features/practice/hooks/useLiveTuner";
import { usePitchStream } from "@/features/practice/hooks/usePitchStream";

// Dải đo bao quanh các dây cần kiểm tra, chừa lề cho dây đang quá chùng hoặc quá căng
const STRING_FMIN_HZ = Math.min(...STRINGS.map((item) => item.f)) * 0.8;
const STRING_FMAX_HZ = Math.max(...STRINGS.map((item) => item.f)) * 1.6;

interface UseTunerOptions {
  audio: PracticeAudio;
  micDenied: boolean;
}

export function useTuner({ audio, micDenied }: UseTunerOptions) {
  const [selected, setSelected] = useState(1);
  const [tuned, setTuned] = useState<boolean[]>(() => STRINGS.map(() => false));

  const active = !micDenied && audio.ready;
  const pitchStream = usePitchStream({
    audio,
    enabled: active,
    computePitch: active,
    fminHz: STRING_FMIN_HZ,
    fmaxHz: STRING_FMAX_HZ,
  });
  const reading = useLiveTuner({ subscribe: pitchStream.subscribe, active });

  const currentString = STRINGS[selected];
  // Cents so với dây đang chọn (khác tuner ở màn ghi âm, vốn so với nốt gần nhất)
  const cents = reading.detectedHz === null ? 0 : 1200 * Math.log2(reading.detectedHz / currentString.f);
  const inTune = reading.live && Math.abs(cents) <= TUNER_TOLERANCE_CENTS;

  const pickString = useCallback((index: number) => {
    setSelected(index);
    setTuned((list) => list.map((value, i) => (i === index ? false : value)));
  }, []);

  useEffect(() => {
    if (!inTune) return;
    const timer = window.setTimeout(() => {
      setTuned((list) => (list[selected] ? list : list.map((value, i) => (i === selected ? true : value))));
    }, TUNER_STRING_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [inTune, selected]);

  return {
    selected,
    tuned,
    live: reading.live,
    cents,
    hz: reading.detectedHz,
    note: reading.detectedNote,
    tunedCount: tuned.filter(Boolean).length,
    currentString,
    pickString,
  };
}
