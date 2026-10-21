import { useEffect, useState } from "react";
import {
  TUNER_HOLD_S,
  TUNER_NOTE_HYSTERESIS_CENTS,
  TUNER_UI_TICK_MS,
} from "@/features/practice/constants/practiceConstants";
import type { PitchStream } from "@/features/practice/hooks/usePitchStream";
import type { NoteInfo } from "@/features/practice/types/practiceTypes";
import { hzToMidiFloat, midiToHz, midiToNoteInfo } from "@/features/practice/utils/noteMath";
import { PitchSmoother } from "@/features/practice/utils/pitchSmoother";

interface TunerReading {
  note: NoteInfo;
  hz: number;
  cents: number;
}

interface UseLiveTunerOptions {
  subscribe: PitchStream["subscribe"];
  active: boolean;
}

export function useLiveTuner({ subscribe, active }: UseLiveTunerOptions) {
  const [reading, setReading] = useState<TunerReading | null>(null);

  useEffect(() => {
    if (!active) return;
    const smoother = new PitchSmoother();
    let smoothedMidi: number | null = null;
    let lastValidAt = 0;
    let lastFrameAt = 0;
    let lockedMidi: number | null = null; // nốt đang hiển thị

    const unsubscribe = subscribe((frame) => {
      lastFrameAt = frame.time;
      if (frame.hz === null) return;
      smoothedMidi = smoother.push(hzToMidiFloat(frame.hz));
      lastValidAt = frame.time;
    });

    const timer = window.setInterval(() => {
      if (smoothedMidi === null || lastFrameAt - lastValidAt > TUNER_HOLD_S) {
        smoother.reset();
        smoothedMidi = null;
        lockedMidi = null;
        setReading((prev) => (prev === null ? prev : null));
        return;
      }
      // Giữ nốt cũ tới khi lệch quá ngưỡng, để kim không nhảy giữa hai nốt sát nhau (vd Sol thấp và Fa# cao)
      if (lockedMidi === null || Math.abs(smoothedMidi - lockedMidi) * 100 > TUNER_NOTE_HYSTERESIS_CENTS) {
        lockedMidi = Math.round(smoothedMidi);
      }
      const nearest = lockedMidi;
      const cents = (smoothedMidi - nearest) * 100; // có thể vượt ±50 trong vùng giữ nốt
      const hz = midiToHz(smoothedMidi);
      setReading((prev) =>
        prev && prev.note.en === midiToNoteInfo(nearest).en && Math.round(prev.cents) === Math.round(cents)
          ? prev
          : { note: midiToNoteInfo(nearest), hz, cents }
      );
    }, TUNER_UI_TICK_MS);

    return () => {
      unsubscribe();
      window.clearInterval(timer);
      setReading(null);
    };
  }, [subscribe, active]);

  return {
    live: active && reading !== null,
    detectedNote: active ? (reading?.note ?? null) : null,
    detectedHz: active ? (reading?.hz ?? null) : null,
    cents: active ? (reading?.cents ?? 0) : 0,
  };
}
