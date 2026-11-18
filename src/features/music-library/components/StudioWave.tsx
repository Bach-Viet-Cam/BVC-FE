import { useMemo } from "react";
import { WAVE_BAR_WIDTH, buildWavePath } from "@/features/music-library/utils/studioTimeline";

interface StudioWaveProps {
  peaks: readonly number[];
  /** Bề rộng thật của đoạn âm thanh trên thước, tính bằng px. */
  widthPx: number;
  heightPx: number;
  /** Phần chưa phát. */
  color: string;
  /** Phần đã phát. */
  playedColor: string;
  /** Vị trí đầu phát tính từ mép trái của đoạn âm thanh. */
  playedPx: number;
}

interface WaveLayerProps {
  path: string;
  widthPx: number;
  heightPx: number;
  color: string;
}

function WaveLayer({ path, widthPx, heightPx, color }: WaveLayerProps) {
  return (
    <svg width={widthPx} height={heightPx} className="absolute top-0 left-0" aria-hidden>
      {path ? (
        <path d={path} stroke={color} strokeWidth={WAVE_BAR_WIDTH} strokeLinecap="round" fill="none" />
      ) : (
        <line
          x1={2}
          x2={widthPx - 2}
          y1={heightPx / 2}
          y2={heightPx / 2}
          stroke={color}
          strokeWidth={2}
          strokeDasharray="1 6"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

// Sóng dạng cột tròn: nửa đã phát đậm, nửa chưa phát nhạt, cắt bằng một khung hẹp thay vì vẽ lại.
export function StudioWave({ peaks, widthPx, heightPx, color, playedColor, playedPx }: StudioWaveProps) {
  const path = useMemo(() => buildWavePath(peaks, widthPx, heightPx), [peaks, widthPx, heightPx]);
  if (widthPx <= 0) return null;
  const clampedPlayed = Math.max(0, Math.min(widthPx, playedPx));
  return (
    <div className="absolute inset-y-0 left-0" style={{ width: widthPx }}>
      <WaveLayer path={path} widthPx={widthPx} heightPx={heightPx} color={color} />
      <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: clampedPlayed }}>
        <WaveLayer path={path} widthPx={widthPx} heightPx={heightPx} color={playedColor} />
      </div>
    </div>
  );
}
