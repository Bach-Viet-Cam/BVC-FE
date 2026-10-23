import { useCallback, useRef, useState } from "react";
import type { PointerEvent } from "react";

// Vị trí con trỏ trên biểu đồ SVG, quy về hệ tọa độ viewBox. Chuột: theo di chuột, rời đi thì ẩn.
// Cảm ứng: chạm hoặc kéo ngang để chọn, giữ nguyên khi nhấc tay (cuộn dọc vẫn hoạt động nhờ touch-action: pan-y).
export function useChartPointer(viewBoxWidth: number) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [x, setX] = useState<number | null>(null);

  const update = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      const box = svgRef.current?.getBoundingClientRect();
      if (!box || box.width === 0) return;
      setX(((event.clientX - box.left) / box.width) * viewBoxWidth);
    },
    [viewBoxWidth]
  );

  const pointerProps = {
    ref: svgRef,
    onPointerMove: update,
    onPointerDown: update,
    onPointerLeave: (event: PointerEvent<SVGSVGElement>) => {
      if (event.pointerType === "mouse") setX(null);
    },
    style: { touchAction: "pan-y" as const },
  };

  return { x, clear: () => setX(null), pointerProps };
}
