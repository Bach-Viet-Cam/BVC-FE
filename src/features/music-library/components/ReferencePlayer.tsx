import { useMemo } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useReferencePlayer } from "@/features/music-library/hooks/useReferencePlayer";
import type { MediaFile } from "@/features/music-library/types/musicLibraryTypes";
import { formatDuration } from "@/features/music-library/utils/mediaUtils";

interface ReferencePlayerProps {
  recording: MediaFile;
  title: string;
  subtitle?: string;
  rate?: number;
  barCount?: number;
  className?: string;
}

// Sóng âm minh họa: chiều cao cột suy ra từ tên file để mỗi bản thu có hình riêng nhưng ổn định
function waveformHeights(seed: string, count: number) {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return Array.from({ length: count }, (_, index) => {
    hash = (hash * 1103515245 + 12345 + index) >>> 0;
    return 25 + (hash % 75);
  });
}

export function ReferencePlayer({
  recording,
  title,
  subtitle,
  rate = 1,
  barCount = 48,
  className,
}: ReferencePlayerProps) {
  const player = useReferencePlayer(recording, rate);
  const heights = useMemo(() => waveformHeights(recording.name, barCount), [recording.name, barCount]);
  const progress = player.duration ? player.position / player.duration : 0;

  return (
    <div className={cn("flex items-center gap-3.5 rounded-2xl bg-white px-4 py-3", className)}>
      <button
        type="button"
        onClick={player.toggle}
        aria-label={player.isPlaying ? "Tạm dừng bản thu mẫu" : "Phát bản thu mẫu"}
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-bvc-accent text-white hover:bg-bvc-accent/90"
      >
        {player.isPlaying ? (
          <Pause className="size-[18px]" fill="currentColor" />
        ) : (
          <Play className="size-[18px] translate-x-px" fill="currentColor" />
        )}
      </button>
      <span className="flex min-w-0 shrink flex-col gap-0.5 sm:max-w-[210px] sm:basis-[210px]">
        <span className="text-sm font-bold text-bvc-ink">{title}</span>
        {subtitle && <span className="truncate text-[12.5px] text-bvc-muted">{subtitle}</span>}
      </span>
      <span className="relative hidden h-8 min-w-0 flex-1 items-center justify-between gap-px overflow-hidden sm:flex">
        {heights.map((height, index) => (
          <span
            key={index}
            className={cn("w-0.5 rounded-[1px]", index / heights.length < progress ? "bg-bvc-ink" : "bg-bvc-bar")}
            style={{ height: `${height}%` }}
          />
        ))}
        <input
          type="range"
          min={0}
          max={player.duration || 1}
          step={1}
          value={Math.round(player.position)}
          onChange={(event) => player.seek(Number(event.target.value))}
          aria-label="Tua bản thu mẫu"
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </span>
      <span className="ml-auto shrink-0 font-bvc-mono text-[13px] text-bvc-muted">
        {player.position > 0 && `${formatDuration(player.position)} / `}
        {formatDuration(recording.durationSec)}
      </span>
    </div>
  );
}
