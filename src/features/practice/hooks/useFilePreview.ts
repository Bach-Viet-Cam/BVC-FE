import { useCallback, useEffect, useRef, useState } from "react";

// Nghe thử file đã chọn; đổi file hoặc rời màn thì dừng và thu hồi object URL (GBR-51)
export function useFilePreview(file: File | null) {
  const player = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const element = new Audio(url);
    element.ontimeupdate = () => setPosition(element.currentTime);
    element.onended = () => {
      setPlaying(false);
      setPosition(0);
    };
    player.current = element;
    return () => {
      element.pause();
      player.current = null;
      URL.revokeObjectURL(url);
      setPlaying(false);
      setPosition(0);
    };
  }, [file]);

  const toggle = useCallback(() => {
    const element = player.current;
    if (!element) return;
    if (element.paused) {
      void element.play();
      setPlaying(true);
    } else {
      element.pause();
      setPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    player.current?.pause();
    setPlaying(false);
  }, []);

  return { playing, position, toggle, stop };
}
