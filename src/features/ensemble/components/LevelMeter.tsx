import { useRef } from "react";
import { useLevelMeter } from "@/features/ensemble/hooks/useLevelMeter";

interface LevelMeterProps {
  analyser: AnalyserNode | null;
  label: string;
}

// Vạch dọc 4px, tô từ đáy theo --level (0..1). Là thông tin thật nên vẫn chạy khi bật reduced-motion, không có transition.
export function LevelMeter({ analyser, label }: LevelMeterProps) {
  const meterRef = useRef<HTMLSpanElement | null>(null);
  useLevelMeter(analyser, meterRef);

  return (
    <span
      ref={meterRef}
      role="meter"
      aria-label={`Mức âm ${label}`}
      aria-valuemin={0}
      aria-valuemax={1}
      className="relative h-9 w-1 shrink-0 overflow-hidden rounded-full bg-bvc-surface"
    >
      <span
        aria-hidden
        className="absolute inset-0 origin-bottom bg-bvc-accent"
        style={{ transform: "scaleY(var(--level, 0))" }}
      />
    </span>
  );
}
