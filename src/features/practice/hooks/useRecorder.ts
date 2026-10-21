import { useCallback, useEffect, useRef, useState } from "react";
import {
  COUNT_IN_BEATS,
  COUNT_IN_LEAD_S,
  PREVIEW_BAR_COUNT,
  RECORDING_FILE_NAME,
} from "@/features/practice/constants/practiceConstants";
import type { PracticeAudio } from "@/features/practice/hooks/usePracticeAudio";
import type {
  CaptureEndReason,
  CaptureMessage,
  CapturedTake,
  PracticeSessionConfig,
} from "@/features/practice/types/practiceAudioTypes";
import type { RecordState } from "@/features/practice/types/practiceTypes";
import { computePeaks, concatChunks, encodeRecording } from "@/features/practice/utils/wavPcm";
import { playClick } from "@/shared/utils/clickSound";

const TICK_MS = 60;
const PLAY_TICK_MS = 100;

interface UseRecorderOptions {
  audio: PracticeAudio;
  session: PracticeSessionConfig;
  timelineOffsetSec: number; // 0, hoặc pieceLenSec - DEMO_AUTO_STOP_TAIL_S khi bật cờ demo autoStop
  onAutoStop: () => void; // MSG-44
}

export function useRecorder({ audio, session, timelineOffsetSec, onAutoStop }: UseRecorderOptions) {
  const { ctx, ready, post, setCaptureHandler } = audio;
  const [rec, setRecState] = useState<RecordState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [countBeat, setCountBeat] = useState(0);
  const [take, setTake] = useState<CapturedTake | null>(null);
  const [recordStartTime, setRecordStartTime] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [playPos, setPlayPos] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRateState] = useState(1);

  const recRef = useRef<RecordState>("idle");
  const busyRef = useRef(false); // chặn bấm hai lần khi đang start/stop
  const chunks = useRef<Float32Array[]>([]);
  const countInNodes = useRef<OscillatorNode[]>([]);
  const timing = useRef({ countStart: 0, recordStart: 0 });
  const takeRef = useRef<CapturedTake | null>(null);
  const player = useRef<HTMLAudioElement | null>(null);
  const playbackPrefs = useRef({ volume: 1, muted: false, rate: 1 });
  const onAutoStopRef = useRef(onAutoStop);

  useEffect(() => {
    onAutoStopRef.current = onAutoStop;
  }, [onAutoStop]);

  const setRec = useCallback((next: RecordState) => {
    recRef.current = next;
    setRecState(next);
  }, []);

  const stopCountIn = useCallback(() => {
    countInNodes.current.forEach((node) => {
      try {
        node.stop();
      } catch {
        // đã dừng
      }
    });
    countInNodes.current = [];
  }, []);

  // GBR-51: huỷ bản nghe thử
  const releaseTake = useCallback(() => {
    player.current?.pause();
    player.current = null;
    if (takeRef.current) URL.revokeObjectURL(takeRef.current.url);
    takeRef.current = null;
    setTake(null);
    setPlaying(false);
    setPlayPos(0);
  }, []);

  const finishTake = useCallback(
    (reason: CaptureEndReason) => {
      busyRef.current = false;
      const samples = concatChunks(chunks.current);
      chunks.current = [];
      if (samples.length === 0) {
        setRec("idle");
        return;
      }
      const file = new File([encodeRecording(samples, ctx.sampleRate)], RECORDING_FILE_NAME, { type: "audio/wav" });
      const next: CapturedTake = {
        file,
        url: URL.createObjectURL(file),
        durationSec: samples.length / ctx.sampleRate,
        peaks: computePeaks(samples, PREVIEW_BAR_COUNT),
      };
      takeRef.current = next;
      setTake(next);
      setRec("preview");
      if (reason === "pieceEnd") onAutoStopRef.current(); // MSG-44
    },
    [ctx, setRec]
  );

  useEffect(() => {
    setCaptureHandler((message: CaptureMessage) => {
      const state = recRef.current;
      const capturing = state === "countin" || state === "recording";
      if (message.type === "pcm") {
        if (capturing) chunks.current.push(message.samples);
        return;
      }
      if (message.type === "captureEnded") {
        if (capturing) finishTake(message.reason);
        return;
      }
      // trackEnded (D10)
      if (state === "countin") {
        post({ type: "cancelCapture" });
        stopCountIn();
        chunks.current = [];
        busyRef.current = false;
        setRecordStartTime(null);
        setRec("idle");
      } else if (state === "recording") {
        post({ type: "cancelCapture" });
        finishTake("manual");
      }
    });
    return () => setCaptureHandler(null);
  }, [setCaptureHandler, finishTake, post, stopCountIn, setRec]);

  const start = useCallback(async () => {
    if (recRef.current !== "idle" || !ready || busyRef.current) return;
    busyRef.current = true;
    await ctx.resume();
    const beat = 60 / session.targetBpm;
    const countStart = ctx.currentTime + COUNT_IN_LEAD_S;
    const recordStart = countStart + COUNT_IN_BEATS * beat;
    const lengthSec = session.pieceLenSec - timelineOffsetSec;
    // Đếm vào luôn phát tiếng, không phụ thuộc nút click (UC Normal 6)
    countInNodes.current = Array.from({ length: COUNT_IN_BEATS }, (_, i) =>
      playClick(ctx, i === 0, countStart + i * beat)
    );
    chunks.current = [];
    timing.current = { countStart, recordStart };
    post({
      type: "startCapture",
      startFrame: Math.round(recordStart * ctx.sampleRate),
      stopFrame: Math.round((recordStart + lengthSec) * ctx.sampleRate),
    });
    setRecordStartTime(recordStart);
    setCountBeat(0);
    setElapsed(timelineOffsetSec);
    setRec("countin");
    busyRef.current = false;
  }, [ctx, ready, post, session, timelineOffsetSec, setRec]);

  const stop = useCallback(() => {
    if (recRef.current !== "recording" || busyRef.current) return;
    busyRef.current = true;
    post({ type: "stopCapture" }); // trạng thái đổi khi nhận captureEnded
  }, [post]);

  // Ghi âm lại / rời màn: huỷ mọi thứ, về chờ ghi (UC Step 8 → step 8)
  const reset = useCallback(() => {
    if (recRef.current === "countin" || recRef.current === "recording") post({ type: "cancelCapture" });
    stopCountIn();
    chunks.current = [];
    busyRef.current = false;
    releaseTake();
    setRecordStartTime(null);
    setElapsed(0);
    setCountBeat(0);
    setRec("idle");
  }, [post, stopCountIn, releaseTake, setRec]);

  // Đồng hồ giao diện: đọc ctx.currentTime, không dùng Date.now()
  useEffect(() => {
    if (rec !== "countin" && rec !== "recording") return;
    const beat = 60 / session.targetBpm;
    const timer = window.setInterval(() => {
      const now = ctx.currentTime;
      const { countStart, recordStart } = timing.current;
      if (recRef.current === "countin") {
        if (now >= recordStart) setRec("recording");
        else setCountBeat(Math.min(COUNT_IN_BEATS - 1, Math.max(0, Math.floor((now - countStart) / beat))));
        return;
      }
      setElapsed(Math.min(session.pieceLenSec, timelineOffsetSec + (now - recordStart)));
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [rec, ctx, session, timelineOffsetSec, setRec]);

  const ensurePlayer = useCallback((): HTMLAudioElement | null => {
    const current = takeRef.current;
    if (!current) return null;
    if (!player.current) {
      const element = new Audio(current.url);
      element.onended = () => {
        setPlaying(false);
        setPlayPos(0);
      };
      const prefs = playbackPrefs.current;
      element.volume = prefs.volume;
      element.muted = prefs.muted;
      element.playbackRate = prefs.rate;
      player.current = element;
    }
    return player.current;
  }, []);

  const togglePlay = useCallback(() => {
    const element = ensurePlayer();
    if (!element) return;
    if (element.paused) {
      void element.play();
      setPlaying(true);
    } else {
      element.pause();
      setPlaying(false);
    }
  }, [ensurePlayer]);

  const setVolume = useCallback((next: number) => {
    playbackPrefs.current.volume = next;
    playbackPrefs.current.muted = false;
    if (player.current) {
      player.current.volume = next;
      player.current.muted = false;
    }
    setVolumeState(next);
    setMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    const next = !playbackPrefs.current.muted;
    playbackPrefs.current.muted = next;
    if (player.current) player.current.muted = next;
    setMuted(next);
  }, []);

  const setRate = useCallback((next: number) => {
    playbackPrefs.current.rate = next;
    if (player.current) player.current.playbackRate = next;
    setRateState(next);
  }, []);

  // Tua bản nghe lại tới giây `sec`; giữ nguyên trạng thái đang phát hay tạm dừng
  const seek = useCallback(
    (sec: number) => {
      const element = ensurePlayer();
      const current = takeRef.current;
      if (!element || !current) return;
      const target = Math.max(0, Math.min(current.durationSec, sec));
      element.currentTime = target;
      setPlayPos(target);
    },
    [ensurePlayer]
  );

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setPlayPos(player.current?.currentTime ?? 0), PLAY_TICK_MS);
    return () => window.clearInterval(timer);
  }, [playing]);

  // Rời màn: thu hồi object URL (AudioContext do usePracticeAudio đóng)
  useEffect(
    () => () => {
      player.current?.pause();
      if (takeRef.current) URL.revokeObjectURL(takeRef.current.url);
    },
    []
  );

  return {
    rec,
    elapsed, // giây trên dòng thời gian của bài (đã cộng timelineOffsetSec)
    countBeat,
    take,
    takeLen: take?.durationSec ?? 0,
    playing,
    playPos,
    recordStartTime, // ctx.currentTime ứng với giây 0 của bản ghi; null khi idle
    start,
    stop,
    reset,
    togglePlay,
    seek,
    volume,
    muted,
    rate,
    setVolume,
    toggleMute,
    setRate,
  };
}
