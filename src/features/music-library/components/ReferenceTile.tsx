import type { ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import { ReferenceWaveform } from "@/features/music-library/components/ReferencePlayer";
import { useReferencePlayer } from "@/features/music-library/hooks/useReferencePlayer";
import type { MediaFile } from "@/features/music-library/types/musicLibraryTypes";
import { formatDuration } from "@/features/music-library/utils/mediaUtils";

interface ReferenceTileProps {
  title: string;
  subtitle?: string;
  recording?: MediaFile;
  badges?: ReactNode;
}

const LEAVES = [
  { x: 392, y: 6, r: 148 },
  { x: 384, y: 18, r: 128 },
  { x: 372, y: 30, r: 156 },
  { x: 362, y: 42, r: 122 },
  { x: 350, y: 54, r: 150 },
  { x: 340, y: 66, r: 118 },
  { x: 372, y: 4, r: 168 },
  { x: 356, y: 16, r: 140 },
];

function Scenery() {
  return (
    <>
      <svg
        aria-hidden
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-3/5 w-full"
      >
        <path
          d="M0 120 C 60 82 110 104 170 72 S 280 34 330 62 S 388 82 400 60 L400 200 L0 200Z"
          fill="rgb(47 122 98 / 0.07)"
        />
        <path d="M0 160 C 80 122 150 150 222 120 S 340 100 400 126 L400 200 L0 200Z" fill="rgb(47 122 98 / 0.09)" />
      </svg>
      <svg
        aria-hidden
        viewBox="326 -8 80 84"
        className="pointer-events-none absolute -top-1 right-0 -z-10 h-[64px] w-[62px]"
      >
        <path d="M398 -4 Q 372 28 336 74" stroke="rgb(47 122 98 / 0.45)" strokeWidth="1.6" fill="none" />
        <g fill="rgb(47 122 98 / 0.4)">
          {LEAVES.map((leaf) => (
            <path
              key={`${leaf.x}-${leaf.y}`}
              d="M0 0 Q 15 -4.5 34 0 Q 15 4.5 0 0Z"
              transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.r})`}
            />
          ))}
        </g>
      </svg>
    </>
  );
}

export function ReferenceTile({ title, subtitle, recording, badges }: ReferenceTileProps) {
  const caption = recording ? subtitle : [subtitle, "Chưa có bản thu mẫu"].filter(Boolean).join(" · ");
  const player = useReferencePlayer(recording, 1);

  return (
    <div className="relative isolate flex flex-col gap-3 overflow-hidden rounded-[24px] bg-linear-to-br from-bvc-ok-tint to-bvc-surface p-4 shadow-[0_10px_28px_-16px_rgb(18_63_51/0.45)]">
      <Scenery />
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {recording && (
            <button
              type="button"
              onClick={player.toggle}
              disabled={!player.isAvailable}
              aria-label={player.isPlaying ? "Tạm dừng bản thu mẫu" : "Phát bản thu mẫu"}
              className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-bvc-ink text-white shadow-md transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {player.isPlaying ? (
                <Pause className="size-4" fill="currentColor" />
              ) : (
                <Play className="size-4 translate-x-px" fill="currentColor" />
              )}
            </button>
          )}
          <div className="flex min-w-0 flex-col">
            <h3 className="truncate text-[16px] leading-tight font-semibold text-bvc-ink">{title}</h3>
            {caption && <span className="truncate text-[12.5px] text-bvc-ink/70">{caption}</span>}
          </div>
        </div>
        {badges && <div className="flex shrink-0 flex-wrap justify-end gap-1.5">{badges}</div>}
      </div>

      {recording && (
        <div className="flex items-center gap-3">
          <ReferenceWaveform player={player} className="h-10 min-w-0 flex-1" />
          <span className="shrink-0 font-bvc-mono text-[13px] text-bvc-ink">
            {player.position > 0 && `${formatDuration(player.position)} / `}
            {formatDuration(player.duration)}
          </span>
        </div>
      )}
    </div>
  );
}
