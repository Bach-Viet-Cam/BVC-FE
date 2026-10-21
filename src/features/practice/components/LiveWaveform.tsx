import { useEffect, useRef } from "react";
import { cn } from "@/shared/utils/cn";

const GRID_SIZE = 16;
const POINT_COUNT = 64;
const IDLE_AMPLITUDE = 0.1; // biên độ sóng nhẹ ở trạng thái chờ (tỉ lệ nửa chiều cao)
const IDLE_SPEED = 0.0012;
const SIGNAL_GAIN = 6; // tiếng micro thường nhỏ, khuếch đại để đường sóng thấy rõ

interface LiveWaveformProps {
  analyser: AnalyserNode | null;
  active: boolean; // true: bám theo tiếng micro (đang ghi); false: sóng nhẹ trôi chậm (chờ ghi)
  height?: number;
  className?: string;
}

// Đường sóng thời gian thực: đọc dạng sóng từ AnalyserNode, nền lưới; chờ ghi thì sóng nhẹ trôi chậm
export function LiveWaveform({ analyser, active, height = 120, className }: LiveWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const styles = getComputedStyle(canvas);
    const lineColor = styles.getPropertyValue("--color-bvc-accent").trim() || "#2f7a62";
    const gridColor = styles.getPropertyValue("--color-bvc-border").trim() || "#e5e5e5";
    const data = new Uint8Array(analyser?.fftSize ?? 0);
    const ys = new Float32Array(POINT_COUNT);
    let frame = 0;

    const draw = (time: number) => {
      const ratio = window.devicePixelRatio || 1;
      const { clientWidth: width, clientHeight: h } = canvas;
      if (canvas.width !== width * ratio || canvas.height !== h * ratio) {
        canvas.width = width * ratio;
        canvas.height = h * ratio;
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, h);

      context.strokeStyle = gridColor;
      context.globalAlpha = 0.5;
      context.lineWidth = 1;
      context.beginPath();
      for (let x = GRID_SIZE; x < width; x += GRID_SIZE) {
        context.moveTo(x, 0);
        context.lineTo(x, h);
      }
      for (let y = GRID_SIZE; y < h; y += GRID_SIZE) {
        context.moveTo(0, y);
        context.lineTo(width, y);
      }
      context.stroke();

      if (analyser && active) analyser.getByteTimeDomainData(data);
      for (let i = 0; i < POINT_COUNT; i++) {
        const t = i / (POINT_COUNT - 1);
        // Chờ ghi: sóng nhẹ trôi chậm; đang ghi: bám theo tiếng micro quanh trục ngang
        let signal = active ? 0 : IDLE_AMPLITUDE * Math.sin(t * Math.PI * 4 + time * IDLE_SPEED);
        if (active && data.length > 0) {
          const from = Math.floor(t * (data.length - 1));
          const to = Math.min(data.length, from + Math.ceil(data.length / POINT_COUNT));
          // Lấy mẫu lệch xa trục nhất trong đoạn để giữ biên độ, không bị triệt tiêu khi lấy trung bình
          let peak = 0;
          for (let k = from; k < to; k++) {
            const value = (data[k] - 128) / 128;
            if (Math.abs(value) > Math.abs(peak)) peak = value;
          }
          signal = peak * SIGNAL_GAIN;
        }
        const level = Math.max(-0.9, Math.min(0.9, signal));
        ys[i] = h / 2 - level * (h / 2);
      }

      context.globalAlpha = active ? 1 : 0.45;
      context.strokeStyle = lineColor;
      context.lineWidth = 2;
      context.lineJoin = "round";
      context.beginPath();
      const step = width / (POINT_COUNT - 1);
      context.moveTo(0, ys[0]);
      for (let i = 1; i < POINT_COUNT; i++) {
        const midX = (i - 0.5) * step;
        context.quadraticCurveTo((i - 1) * step, ys[i - 1], midX, (ys[i - 1] + ys[i]) / 2);
      }
      context.lineTo(width, ys[POINT_COUNT - 1]);
      context.stroke();

      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(frame);
  }, [analyser, active]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("w-full rounded-bvc-md border border-bvc-border bg-white", className)}
      style={{ height }}
    />
  );
}
