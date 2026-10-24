import { useCallback, useEffect, useMemo, useState } from "react";
import { TUNER_STRING_HOLD_MS, TUNER_TOLERANCE_CENTS } from "@/features/practice/constants/practiceConstants";
import type { PracticeAudio } from "@/features/practice/hooks/usePracticeAudio";
import { useLiveTuner } from "@/features/practice/hooks/useLiveTuner";
import { usePitchStream } from "@/features/practice/hooks/usePitchStream";

import type { StringInfo } from "@/features/practice/types/practiceTypes";

// Dải đo bao quanh các dây cần kiểm tra, chừa lề cho dây đang quá chùng hoặc quá căng.
// Chưa có dây (đang tải hoặc nhạc cụ chưa cấu hình) thì dùng dải rộng mặc định.
const DEFAULT_RANGE_HZ = { min: 80, max: 1200 };
const RANGE_MARGIN = { low: 0.8, high: 1.6 };

interface UseTunerOptions {
  audio: PracticeAudio;
  micDenied: boolean;
  // Dây chuẩn của nhạc cụ (instrument_tunes)
  strings: StringInfo[];
}

export function useTuner({ audio, micDenied, strings }: UseTunerOptions) {
  const [selected, setSelected] = useState(0);
  // Dây đã đúng, theo tên dây để giữ đúng khi danh sách tải lại
  const [tunedCodes, setTunedCodes] = useState<string[]>([]);
  const range = useMemo(
    () =>
      strings.length === 0
        ? DEFAULT_RANGE_HZ
        : {
            min: Math.min(...strings.map((item) => item.f)) * RANGE_MARGIN.low,
            max: Math.max(...strings.map((item) => item.f)) * RANGE_MARGIN.high,
          },
    [strings]
  );

  const active = !micDenied && audio.ready;
  const pitchStream = usePitchStream({
    audio,
    enabled: active,
    computePitch: active,
    fminHz: range.min,
    fmaxHz: range.max,
  });
  const reading = useLiveTuner({ subscribe: pitchStream.subscribe, active });

  const currentString: StringInfo | null = strings[Math.min(selected, strings.length - 1)] ?? null;
  // Cents so với dây đang chọn (khác tuner ở màn ghi âm, vốn so với nốt gần nhất)
  const cents =
    reading.detectedHz === null || !currentString ? 0 : 1200 * Math.log2(reading.detectedHz / currentString.f);
  const inTune = reading.live && currentString !== null && Math.abs(cents) <= TUNER_TOLERANCE_CENTS;
  const tuned = strings.map((item) => tunedCodes.includes(item.code));

  const pickString = useCallback(
    (index: number) => {
      setSelected(index);
      const code = strings[index]?.code;
      setTunedCodes((list) => list.filter((value) => value !== code));
    },
    [strings]
  );

  useEffect(() => {
    if (!inTune || !currentString) return;
    const code = currentString.code;
    const timer = window.setTimeout(() => {
      setTunedCodes((list) => (list.includes(code) ? list : [...list, code]));
    }, TUNER_STRING_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [inTune, currentString]);

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
