import { useEffect, useMemo, useState } from "react";
import { COUNT_IN_BEATS, TEMPO_TOLERANCE_PERCENT } from "@/features/practice/constants/practiceConstants";
import { type PracticeAudio } from "@/features/practice/hooks/usePracticeAudio";
import { useLiveTempo } from "@/features/practice/hooks/useLiveTempo";
import { type PitchStream } from "@/features/practice/hooks/usePitchStream";
import { type PracticeStatus } from "@/features/ensemble/types/ensembleTypes";

const BEAT_TICK_MS = 60;
// Hòa tấu không có bảng nốt kỳ vọng nên lưới onset dùng cả phách
const GRID_BEATS = 1;
const NO_CLICKS: readonly number[] = [];
const getNoClicks = () => NO_CLICKS;

interface Options {
  audio: PracticeAudio;
  pitchStream: PitchStream;
  status: PracticeStatus;
  /** Date.now() lúc bắt đầu thu; null khi không thu. */
  recordingStartedAt: number | null;
  countBeat: number;
  targetBpm: number;
  micDenied: boolean;
}

/** Đo nhịp trực tiếp khi hòa tấu bằng bộ đo của trang luyện tập riêng, dùng micro/AudioContext của practice. */
export function useEnsembleLiveTempo({
  audio,
  pitchStream,
  status,
  recordingStartedAt,
  countBeat,
  targetBpm,
  micDenied,
}: Options) {
  const { ctx } = audio;
  const isRecording = status === "recording";
  const [recordStart, setRecordStart] = useState<number | null>(null);
  const [recordingBeat, setRecordingBeat] = useState(-1);

  // Đổi mốc Date.now() của bộ thu sang đồng hồ AudioContext mà bộ đo nhịp dùng
  useEffect(() => {
    if (!isRecording || recordingStartedAt === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- đồng bộ mốc thời gian với trạng thái thu
      setRecordStart(null);
      return;
    }
    setRecordStart(ctx.currentTime - (Date.now() - recordingStartedAt) / 1000);
  }, [ctx, isRecording, recordingStartedAt]);

  useEffect(() => {
    if (recordStart === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- tắt đèn phách khi không thu
      setRecordingBeat(-1);
      return;
    }
    const timer = window.setInterval(() => {
      const beat = Math.floor(((ctx.currentTime - recordStart) * targetBpm) / 60);
      setRecordingBeat(beat >= 0 ? beat % COUNT_IN_BEATS : -1);
    }, BEAT_TICK_MS);
    return () => window.clearInterval(timer);
  }, [ctx, recordStart, targetBpm]);

  const tempo = useLiveTempo({
    ctx,
    subscribe: pitchStream.subscribe,
    active: isRecording && !micDenied && audio.ready,
    recordStartTime: recordStart,
    targetBpm,
    gridBeats: GRID_BEATS,
    hasPitch: true,
    clickOn: false,
    getClickTimes: getNoClicks,
  });
  const liveBpm = isRecording ? tempo.liveBpm : null;

  const bpmHint = useMemo(() => {
    if (status === "countIn") return "Đang đếm nhịp";
    if (!isRecording || liveBpm === null) return micDenied ? "" : "Đang lắng nghe";
    const diff = ((liveBpm - targetBpm) / targetBpm) * 100;
    if (Math.abs(diff) <= TEMPO_TOLERANCE_PERCENT) return "Đúng nhịp";
    return diff > 0 ? "Hơi nhanh" : "Hơi chậm";
  }, [status, isRecording, liveBpm, micDenied, targetBpm]);

  const hintTone = bpmHint === "Đúng nhịp" ? "ok" : bpmHint === "Hơi nhanh" || bpmHint === "Hơi chậm" ? "warn" : "idle";
  const litBeat = status === "countIn" ? countBeat : isRecording ? recordingBeat : -1;

  return { liveBpm, bpmHint, hintTone, litBeat } as const;
}

export type EnsembleLiveTempo = ReturnType<typeof useEnsembleLiveTempo>;
