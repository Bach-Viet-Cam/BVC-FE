import { useCallback, useEffect, useRef, useState } from "react";
import { COUNT_IN_BEATS, SAMPLE } from "@/features/practice/constants/practiceConstants";
import type { RecordState } from "@/features/practice/types/practiceTypes";

interface UseRecorderOptions {
  // Bắt đầu gần cuối bài để xem hành vi tự dừng (MSG-44)
  autoStop: boolean;
  onAutoStop: () => void;
}

const TICK_MS = 60;

export function useRecorder({ autoStop, onAutoStop }: UseRecorderOptions) {
  const [rec, setRec] = useState<RecordState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [countBeat, setCountBeat] = useState(0);
  const [takeLen, setTakeLen] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [playPos, setPlayPos] = useState(0);

  const countStart = useRef(0);
  const recStart = useRef(0);
  const recOffset = useRef(0);
  const autoStopRef = useRef(onAutoStop);

  useEffect(() => {
    autoStopRef.current = onAutoStop;
  }, [onAutoStop]);

  const start = useCallback(() => {
    countStart.current = Date.now();
    recOffset.current = autoStop ? SAMPLE.pieceLen - 8 : 0;
    setCountBeat(0);
    setTakeLen(0);
    setElapsed(0);
    setPlaying(false);
    setPlayPos(0);
    setRec("countin");
  }, [autoStop]);

  const stop = useCallback(() => {
    setRec((current) => {
      if (current !== "recording") return current;
      const el = Math.min(SAMPLE.pieceLen, recOffset.current + (Date.now() - recStart.current) / 1000);
      setTakeLen(el);
      setPlaying(false);
      setPlayPos(0);
      return "preview";
    });
  }, []);

  // GBR-51: bỏ bản đang ghi, không hỏi lại
  const reset = useCallback(() => {
    setRec("idle");
    setTakeLen(0);
    setElapsed(0);
    setPlaying(false);
    setPlayPos(0);
  }, []);

  useEffect(() => {
    if (rec === "idle") return;

    const timer = setInterval(() => {
      const now = Date.now();

      if (rec === "countin") {
        const beatMs = 60000 / SAMPLE.targetBpm;
        const done = now - countStart.current;
        if (done >= COUNT_IN_BEATS * beatMs) {
          recStart.current = now;
          setRec("recording");
          setElapsed(recOffset.current);
        } else {
          setCountBeat(Math.floor(done / beatMs));
        }
        return;
      }

      if (rec === "recording") {
        const el = recOffset.current + (now - recStart.current) / 1000;
        if (el >= SAMPLE.pieceLen) {
          setTakeLen(SAMPLE.pieceLen);
          setElapsed(SAMPLE.pieceLen);
          setRec("preview");
          autoStopRef.current();
        } else {
          setElapsed(el);
        }
      }
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [rec]);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setPlayPos((pos) => {
        const next = pos + TICK_MS / 1000;
        if (next >= takeLen) {
          setPlaying(false);
          return 0;
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [playing, takeLen]);

  return {
    rec,
    elapsed,
    countBeat,
    takeLen,
    playing,
    playPos,
    start,
    stop,
    reset,
    togglePlay: () => setPlaying((value) => !value),
  };
}
