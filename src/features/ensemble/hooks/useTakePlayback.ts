import { useCallback, useEffect, useRef, useState } from "react";
import { type EnsembleTake } from "@/features/ensemble/types/ensembleTypes";

const PLAY_TICK_MS = 100;

export interface Accompaniment {
  enabled: boolean;
  play: (positionSec: number, rate: number) => void;
  pause: () => void;
}

export function useTakePlayback(take: EnsembleTake | null, accompaniment: Accompaniment) {
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const accompanimentRef = useRef(accompaniment);
  const [playing, setPlaying] = useState(false);
  const [playPos, setPlayPos] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRateState] = useState(1);
  const prefsRef = useRef({ volume: 1, muted: false, rate: 1 });

  useEffect(() => {
    accompanimentRef.current = accompaniment;
  });

  // Mỗi bản thu mới → một <audio> mới; bỏ bản thu → dừng cả bè đi kèm.
  useEffect(() => {
    if (!take) return;
    const element = new Audio(take.url);
    element.volume = prefsRef.current.volume;
    element.muted = prefsRef.current.muted;
    element.playbackRate = prefsRef.current.rate;
    element.onended = () => {
      accompanimentRef.current.pause();
      setPlaying(false);
      setPlayPos(0);
    };
    playerRef.current = element;
    return () => {
      element.pause();
      playerRef.current = null;
      accompanimentRef.current.pause();
      setPlaying(false);
      setPlayPos(0);
    };
  }, [take]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setPlayPos(playerRef.current?.currentTime ?? 0), PLAY_TICK_MS);
    return () => window.clearInterval(timer);
  }, [playing]);

  const togglePlay = useCallback(() => {
    const element = playerRef.current;
    if (!element) return;
    if (element.paused) {
      void element.play();
      if (accompanimentRef.current.enabled) accompanimentRef.current.play(element.currentTime, element.playbackRate);
      setPlaying(true);
    } else {
      element.pause();
      accompanimentRef.current.pause();
      setPlaying(false);
    }
  }, []);

  const seek = useCallback(
    (sec: number) => {
      const element = playerRef.current;
      if (!element || !take) return;
      const target = Math.max(0, Math.min(take.durationSec, sec));
      element.currentTime = target;
      setPlayPos(target);
      if (!element.paused && accompanimentRef.current.enabled) accompanimentRef.current.play(target, element.playbackRate);
    },
    [take]
  );

  const setVolume = useCallback((next: number) => {
    prefsRef.current = { ...prefsRef.current, volume: next, muted: false };
    if (playerRef.current) {
      playerRef.current.volume = next;
      playerRef.current.muted = false;
    }
    setVolumeState(next);
    setMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    const next = !prefsRef.current.muted;
    prefsRef.current = { ...prefsRef.current, muted: next };
    if (playerRef.current) playerRef.current.muted = next;
    setMuted(next);
  }, []);

  const setRate = useCallback((next: number) => {
    prefsRef.current = { ...prefsRef.current, rate: next };
    const element = playerRef.current;
    if (element) {
      element.playbackRate = next;
      if (!element.paused && accompanimentRef.current.enabled) accompanimentRef.current.play(element.currentTime, next);
    }
    setRateState(next);
  }, []);

  /** Gọi khi bật/tắt "Nghe kèm các bè" giữa lúc đang phát. */
  const syncAccompaniment = useCallback((enabled: boolean) => {
    const element = playerRef.current;
    if (!element || element.paused) return;
    if (enabled) accompanimentRef.current.play(element.currentTime, element.playbackRate);
    else accompanimentRef.current.pause();
  }, []);

  return { playing, playPos, volume, muted, rate, togglePlay, seek, setVolume, toggleMute, setRate, syncAccompaniment };
}

export type TakePlayback = ReturnType<typeof useTakePlayback>;
