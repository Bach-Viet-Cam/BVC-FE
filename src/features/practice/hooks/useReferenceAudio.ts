import { useCallback, useEffect, useRef, useState } from "react";
import { PREVIEW_BAR_COUNT } from "@/features/practice/constants/practiceConstants";
import { computePeaks } from "@/features/practice/utils/wavPcm";

const PLAY_TICK_MS = 100;
// Dạng sóng phẳng khi chưa giải mã được file (vẫn phát được, chỉ thiếu hình sóng)
const FLAT_PEAKS = Array.from({ length: PREVIEW_BAR_COUNT }, () => 0.35);

// Phát bản thu mẫu của bản nhạc: phát / dừng, tua, âm lượng, tốc độ, kèm dạng sóng giải mã từ file.
// Gắn key theo url ở component dùng hook để đổi bài thì trạng thái làm lại từ đầu.
export function useReferenceAudio(url: string) {
  const player = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [playPos, setPlayPos] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRateState] = useState(1);
  const [peaks, setPeaks] = useState<number[]>(FLAT_PEAKS);
  const [error, setError] = useState(false);

  useEffect(() => {
    const element = new Audio();
    element.preload = "metadata";
    element.onloadedmetadata = () => setDuration(Number.isFinite(element.duration) ? element.duration : 0);
    element.onended = () => {
      setPlaying(false);
      setPlayPos(0);
    };
    element.onerror = () => {
      setPlaying(false);
      setError(true);
    };
    element.src = url;
    player.current = element;
    return () => {
      element.pause();
      element.removeAttribute("src");
      player.current = null;
    };
  }, [url]);

  // Giải mã file để vẽ dạng sóng; lỗi (mạng, CORS, định dạng) chỉ làm mất hình sóng, không chặn việc nghe
  useEffect(() => {
    const controller = new AbortController();
    let context: AudioContext | null = null;
    fetch(url, { signal: controller.signal })
      .then((response) => (response.ok ? response.arrayBuffer() : Promise.reject(new Error(String(response.status)))))
      .then((buffer) => {
        context = new AudioContext();
        return context.decodeAudioData(buffer);
      })
      .then((decoded) => {
        if (!controller.signal.aborted) setPeaks(computePeaks(decoded.getChannelData(0), PREVIEW_BAR_COUNT));
      })
      .catch(() => undefined)
      .finally(() => void context?.close());
    return () => controller.abort();
  }, [url]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setPlayPos(player.current?.currentTime ?? 0), PLAY_TICK_MS);
    return () => window.clearInterval(timer);
  }, [playing]);

  const togglePlay = useCallback(() => {
    const element = player.current;
    if (!element) return;
    if (element.paused) {
      setError(false);
      element
        .play()
        .then(() => setPlaying(true))
        .catch(() => {
          setPlaying(false);
          setError(true);
        });
    } else {
      element.pause();
      setPlaying(false);
    }
  }, []);

  const seek = useCallback(
    (sec: number) => {
      const element = player.current;
      if (!element) return;
      const target = Math.max(0, Math.min(duration || element.duration || 0, sec));
      element.currentTime = target;
      setPlayPos(target);
    },
    [duration]
  );

  const setVolume = useCallback((next: number) => {
    if (player.current) {
      player.current.volume = next;
      player.current.muted = false;
    }
    setVolumeState(next);
    setMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((current) => {
      if (player.current) player.current.muted = !current;
      return !current;
    });
  }, []);

  const setRate = useCallback((next: number) => {
    if (player.current) player.current.playbackRate = next;
    setRateState(next);
  }, []);

  return {
    playing,
    playPos,
    duration,
    volume,
    muted,
    rate,
    peaks,
    error,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    setRate,
  };
}
