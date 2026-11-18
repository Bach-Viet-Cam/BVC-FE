import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

const KEY_SEEK_SEC = 5;

interface UseTimelineScrubOptions {
  pxPerSec: number;
  spanSec: number;
  canSeek: boolean;
  positionSec: number;
  onSeek: (sec: number) => void;
}

// Chạm hoặc kéo trên dải sóng để tua: đầu phát chạy theo ngón tay, chỉ phát lại từ vị trí mới khi nhả ra.
export function useTimelineScrub({ pxPerSec, spanSec, canSeek, positionSec, onSeek }: UseTimelineScrubOptions) {
  const [scrubSec, setScrubSec] = useState<number | null>(null);
  const dragging = useRef(false);

  const clamp = (sec: number) => Math.max(0, Math.min(spanSec, sec));
  const secAt = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return pxPerSec > 0 ? clamp((event.clientX - rect.left) / pxPerSec) : 0;
  };

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (!canSeek) return;
    dragging.current = true;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* trình duyệt không hỗ trợ thì vẫn tua được bằng cú chạm */
    }
    setScrubSec(secAt(event));
  };
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (dragging.current) setScrubSec(secAt(event));
  };
  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    setScrubSec(null);
    onSeek(secAt(event));
  };
  const onPointerCancel = () => {
    dragging.current = false;
    setScrubSec(null);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!canSeek) return;
    if (event.key === "ArrowLeft") onSeek(clamp(positionSec - KEY_SEEK_SEC));
    else if (event.key === "ArrowRight") onSeek(clamp(positionSec + KEY_SEEK_SEC));
    else return;
    event.preventDefault();
  };

  return {
    shownSec: scrubSec ?? positionSec,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onKeyDown },
  };
}
