import { useCallback, useEffect, useRef, useState } from "react";
import { useAudioSource } from "@/features/music-library/hooks/useAudioSource";
import type { MediaFile } from "@/features/music-library/types/musicLibraryTypes";
import { claimPlayback, releasePlayback } from "@/features/music-library/utils/exclusivePlayback";

// Phát bản thu bằng HTMLAudioElement; bản thu chưa có url (đang xử lý) thì không phát được
export function useReferencePlayer(recording: MediaFile | undefined, rate = 1) {
  const source = useAudioSource(recording?.url, recording?.name ?? "");
  const src = source.playableUrl;
  const [isPlaying, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [loadedDuration, setLoadedDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!src) return;
    const audio = new Audio(src);
    audioRef.current = audio;
    const handleTime = () => setPosition(audio.currentTime);
    const handleMetadata = () => setLoadedDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const handleEnd = () => {
      setPlaying(false);
      setPosition(0);
    };
    // Video hoặc bản thu khác bắt đầu phát sẽ dừng bản này, nút phải về trạng thái "Phát"
    const handlePause = () => setPlaying(false);
    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("loadedmetadata", handleMetadata);
    audio.addEventListener("ended", handleEnd);
    audio.addEventListener("pause", handlePause);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTime);
      audio.removeEventListener("loadedmetadata", handleMetadata);
      audio.removeEventListener("ended", handleEnd);
      audio.removeEventListener("pause", handlePause);
      releasePlayback(audio);
      audioRef.current = null;
    };
  }, [src]);

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
    claimPlayback(audio);
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
    peaks: source.peaks,
    isLoading: source.isLoading,
    isAvailable: Boolean(src),
  };
}
