import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaFile } from "@/features/music-library/types/musicLibraryTypes";

const TICK_MS = 250;

// File thật (có url) phát bằng HTMLAudioElement; dữ liệu mock chưa có file thì giả lập tiến trình
export function useReferencePlayer(recording: MediaFile | undefined, rate = 1) {
  const duration = recording?.durationSec ?? 0;
  const url = recording?.url;
  const [isPlaying, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const positionRef = useRef(0);

  useEffect(() => {
    if (!url) return;
    const audio = new Audio(url);
    audioRef.current = audio;
    const handleTime = () => setPosition(audio.currentTime);
    const handleEnd = () => {
      setPlaying(false);
      setPosition(0);
    };
    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("ended", handleEnd);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTime);
      audio.removeEventListener("ended", handleEnd);
      audioRef.current = null;
    };
  }, [url]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate]);

  useEffect(() => {
    if (!isPlaying || url || duration === 0) return;
    const timer = setInterval(() => {
      positionRef.current += (TICK_MS / 1000) * rate;
      if (positionRef.current >= duration) {
        positionRef.current = 0;
        setPlaying(false);
      }
      setPosition(positionRef.current);
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [isPlaying, url, duration, rate]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) audio.pause();
      else {
        audio.playbackRate = rate;
        audio.play().catch(() => setPlaying(false));
      }
    }
    setPlaying(!isPlaying);
  }, [isPlaying, rate]);

  const seek = useCallback((seconds: number) => {
    positionRef.current = seconds;
    setPosition(seconds);
    if (audioRef.current) audioRef.current.currentTime = seconds;
  }, []);

  return { isPlaying, position, duration, toggle, seek, isAvailable: Boolean(recording) };
}
