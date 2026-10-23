import { useEffect, useState } from "react";

// Google chỉ nhận width dạng số px trong khoảng 200-400, nên đo khung chứa để nút co giãn theo màn hình
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

export function useGoogleButtonWidth() {
  // Dùng callback ref vì khung chứa chỉ xuất hiện sau khi kiểm tra phiên đăng nhập xong
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(MAX_WIDTH);

  useEffect(() => {
    if (!container || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(([entry]) => {
      const nextWidth = Math.round(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, entry.contentRect.width)));
      setWidth((current) => (current === nextWidth ? current : nextWidth));
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [container]);

  return { containerRef: setContainer, width };
}
