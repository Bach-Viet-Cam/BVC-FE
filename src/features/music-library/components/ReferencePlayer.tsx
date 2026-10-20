import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { WAVEFORM_BUCKETS } from "@/features/music-library/hooks/useAudioSource";
import { useReferencePlayer } from "@/features/music-library/hooks/useReferencePlayer";
import type { MediaFile } from "@/features/music-library/types/musicLibraryTypes";
import { formatDuration } from "@/features/music-library/utils/mediaUtils";

interface ReferencePlayerProps {
  recording: MediaFile;
  title: string;
  subtitle?: string;
  rate?: number;
  className?: string;
}

// Mỗi cột rộng 3px + khe 1px; số cột theo bề rộng khung để sóng luôn rõ ở mọi màn hình
const BAR_PITCH_PX = 4;
const MIN_BAR_HEIGHT = 0.08;

function useBarCount() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [barCount, setBarCount] = useState(WAVEFORM_BUCKETS / 2);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const fitting = Math.floor(entry.contentRect.width / BAR_PITCH_PX);
      setBarCount(Math.max(16, Math.min(WAVEFORM_BUCKETS, fitting)));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, barCount };
}

// Gộp các đỉnh liền nhau (lấy đỉnh lớn nhất) cho vừa số cột hiển thị
function toBars(peaks: number[], barCount: number) {
  return Array.from({ length: barCount }, (_, bar) => {
    const start = Math.floor((bar * peaks.length) / barCount);
    const end = Math.max(start + 1, Math.floor(((bar + 1) * peaks.length) / barCount));
    return Math.max(MIN_BAR_HEIGHT, ...peaks.slice(start, end));
  });
}

export function ReferencePlayer({ recording, title, subtitle, rate = 1, className }: ReferencePlayerProps) {
  const player = useReferencePlayer(recording, rate);
  const { ref, barCount } = useBarCount();
  const progress = player.duration ? player.position / player.duration : 0;
  // Chưa có hình sóng (đang tải / không giải mã được) thì vẽ các cột thấp đều làm khung
  const bars = player.peaks ? toBars(player.peaks, barCount) : Array<number>(barCount).fill(MIN_BAR_HEIGHT * 2);

  return (
    <div className={cn("flex flex-wrap items-center gap-x-3.5 gap-y-3 rounded-2xl bg-white px-4 py-3", className)}>
      <button
        type="button"
        onClick={player.toggle}
        disabled={!player.isAvailable}
        title={player.isLoading ? "Đang tải bản thu" : player.isAvailable ? undefined : "Bản thu đang được xử lý"}
        aria-label={player.isPlaying ? "Tạm dừng bản thu mẫu" : "Phát bản thu mẫu"}
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-bvc-accent text-white hover:bg-bvc-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {player.isPlaying ? (
          <Pause className="size-[18px]" fill="currentColor" />
        ) : (
          <Play className="size-[18px] translate-x-px" fill="currentColor" />
        )}
      </button>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:max-w-[210px] sm:flex-none sm:basis-[210px]">
        <span className="text-sm font-bold text-bvc-ink">{title}</span>
        {subtitle && <span className="truncate text-[12.5px] text-bvc-muted">{subtitle}</span>}
      </span>
      <span className="shrink-0 font-bvc-mono text-[13px] text-bvc-muted sm:order-last">
        {player.position > 0 && `${formatDuration(player.position)} / `}
        {formatDuration(player.duration)}
      </span>

      {/* Màn nhỏ: sóng xuống dòng riêng, rộng hết khung; màn lớn: nằm giữa tiêu đề và thời lượng */}
      <div
        ref={ref}
        className={cn(
          "relative flex h-11 basis-full items-center justify-between sm:min-w-0 sm:flex-1 sm:basis-0",
          player.isLoading && "animate-pulse"
        )}
      >
        {bars.map((height, index) => (
          <span
            key={index}
            aria-hidden
            className={cn(
              "w-[3px] rounded-full transition-colors",
              index / bars.length < progress ? "bg-bvc-accent" : "bg-bvc-bar-strong"
            )}
            style={{ height: `${height * 100}%` }}
          />
        ))}
        <input
          type="range"
          min={0}
          max={player.duration || 1}
          step={0.1}
          value={player.position}
          disabled={!player.isAvailable}
          onChange={(event) => player.seek(Number(event.target.value))}
          aria-label="Tua bản thu mẫu"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}
