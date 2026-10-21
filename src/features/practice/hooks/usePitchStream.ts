import { useCallback, useEffect, useRef } from "react";
import { PitchDetector } from "pitchy";
import { PITCH_MIN_CLARITY, PITCH_MIN_VOLUME_DB } from "@/features/practice/constants/practiceConstants";
import type { PracticeAudio } from "@/features/practice/hooks/usePracticeAudio";
import type { PitchFrame } from "@/features/practice/types/practiceAudioTypes";

interface UsePitchStreamOptions {
  audio: PracticeAudio;
  enabled: boolean; // có ai cần khung không (tuner hoặc tempo)
  computePitch: boolean; // false thì chỉ chuyển hopRms, hz = null (nhạc cụ không cao độ)
  fminHz: number;
  fmaxHz: number;
}

export function usePitchStream({ audio, enabled, computePitch, fminHz, fmaxHz }: UsePitchStreamOptions) {
  const { ctx, ready, subscribeFrames } = audio;
  const listeners = useRef(new Set<(frame: PitchFrame) => void>());

  const subscribe = useCallback((listener: (frame: PitchFrame) => void) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !ready) return;
    let detector: PitchDetector<Float32Array> | null = null;
    return subscribeFrames((frame) => {
      let hz: number | null = null;
      let clarity = 0;
      if (computePitch) {
        if (!detector || detector.inputLength !== frame.samples.length) {
          detector = PitchDetector.forFloat32Array(frame.samples.length);
          detector.minVolumeDecibels = PITCH_MIN_VOLUME_DB;
        }
        const [pitch, pitchClarity] = detector.findPitch(frame.samples, ctx.sampleRate);
        clarity = pitchClarity;
        if (pitchClarity >= PITCH_MIN_CLARITY && pitch >= fminHz && pitch <= fmaxHz) hz = pitch;
      }
      const out: PitchFrame = { time: frame.endTime, hz, clarity, hopRms: frame.hopRms };
      listeners.current.forEach((listener) => listener(out));
    });
  }, [ctx, ready, subscribeFrames, enabled, computePitch, fminHz, fmaxHz]);

  return { subscribe };
}

export type PitchStream = ReturnType<typeof usePitchStream>;
