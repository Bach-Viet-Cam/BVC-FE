import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaFile } from "@/features/music-library/types/musicLibraryTypes";

// Phát bản thu bằng HTMLAudioElement; bản thu chưa có url (đang xử lý) thì không phát được
export function useReferencePlayer(recording: MediaFile | undefined, rate = 1) {
  const url = recording?.url;
  const [isPlaying, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [loadedDuration, setLoadedDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!url) return;
    const audio = new Audio(url);
    audioRef.current = audio;
    const handleTime = () => setPosition(audio.currentTime);
    const handleMetadata = () => setLoadedDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const handleEnd = () => {
      setPlaying(false);
      setPosition(0);
    };
    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("loadedmetadata", handleMetadata);
    audio.addEventListener("ended", handleEnd);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTime);
      audio.removeEventListener("loadedmetadata", handleMetadata);
      audio.removeEventListener("ended", handleEnd);
      audioRef.current = null;
    };
  }, [url]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setPlaying(false);
      return;
    }
    audio.playbackRate = rate;
    setPlaying(true);
    audio.play().catch(() => setPlaying(false));
  }, [isPlaying, rate]);

  const seek = useCallback((seconds: number) => {
    setPosition(seconds);
    if (audioRef.current) audioRef.current.currentTime = seconds;
  }, []);

  return {
    isPlaying,
    position,
    duration: recording?.durationSec || loadedDuration,
    toggle,
    seek,
    isAvailable: Boolean(url),
  };
}
