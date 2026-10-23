import { Clock, Pause, Play, Volume1, Volume2, VolumeX } from "lucide-react";
import { Waveform } from "@/shared/components/bvc/Waveform";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/utils/cn";

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

function fmtTime(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

interface PlaybackBarProps {
  peaks: number[];
  playing: boolean;
  playPos: number;
  takeLen: number;
  volume: number;
  muted: boolean;
  rate: number;
  onTogglePlay: () => void;
  onSeek: (sec: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onRateChange: (rate: number) => void;
}

const ICON_BUTTON =
  "flex h-9 min-w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-bvc-muted transition-all hover:scale-110 hover:bg-bvc-surface hover:text-bvc-ink";

// Hàng phát lại: [phát] [sóng âm, chạm để tua] [loa] [tốc độ]
export function PlaybackBar({
  peaks,
  playing,
  playPos,
  takeLen,
  volume,
  muted,
  rate,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onRateChange,
}: PlaybackBarProps) {
  const playedRatio = takeLen > 0 ? playPos / takeLen : 0;
  const silent = muted || volume === 0;
  const VolumeIcon = silent ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="flex min-w-0 flex-1 basis-80 items-center gap-2">
      <button
        type="button"
        aria-label={playing ? "Tạm dừng" : "Phát bản thu"}
        onClick={onTogglePlay}
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-bvc-ink text-white transition-transform active:scale-95"
      >
        {playing ? (
          <Pause size={18} fill="currentColor" strokeWidth={0} />
        ) : (
          <Play size={18} fill="currentColor" strokeWidth={0} />
        )}
      </button>

      {/* Chiều cao thanh = độ to của từng đoạn; chạm vào sóng để tua */}
      <button
        type="button"
        aria-label="Tua bản thu"
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          if (rect.width > 0 && takeLen > 0) onSeek(((event.clientX - rect.left) / rect.width) * takeLen);
        }}
        className="flex min-w-0 flex-1 cursor-pointer flex-col gap-1 rounded-bvc-md border border-bvc-border bg-white px-3 pt-2 pb-1"
      >
        <Waveform
          height={44}
          bars={peaks.map((h, i) => ({
            h: Math.max(4, h * 100),
            color: i / peaks.length <= playedRatio ? "var(--color-bvc-accent)" : "var(--color-bvc-bar-strong)",
          }))}
        />
        <span className="text-left text-[11px] text-bvc-muted tabular-nums">
          {fmtTime(playPos)} / {fmtTime(takeLen)}
        </span>
      </button>

      {/* Loa: bấm để tắt/bật tiếng, rê chuột hoặc focus thì thanh âm lượng trượt ra */}
      <div className="group/volume flex shrink-0 items-center">
        <button
          type="button"
          aria-label={silent ? "Bật tiếng" : "Tắt tiếng"}
          onClick={onToggleMute}
          className={ICON_BUTTON}
        >
          <VolumeIcon size={19} strokeWidth={1.9} />
        </button>
        <input
          type="range"
          aria-label="Âm lượng"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={(event) => onVolumeChange(Number(event.target.value))}
          className="h-1 w-0 cursor-pointer accent-bvc-accent opacity-0 transition-all duration-200 group-focus-within/volume:w-16 group-focus-within/volume:opacity-100 group-hover/volume:w-16 group-hover/volume:opacity-100"
        />
      </div>

      {/* Đồng hồ: chọn tốc độ phát */}
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Tốc độ phát" className={cn(ICON_BUTTON, "gap-1 px-2")}>
          <Clock size={19} strokeWidth={1.9} />
          {rate !== 1 && <span className="text-xs font-semibold text-bvc-accent-text">{rate}×</span>}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-32 rounded-[12px] border-bvc-border bg-white p-1.5 shadow-level-1">
          {PLAYBACK_RATES.map((value) => (
            <DropdownMenuItem
              key={value}
              onClick={() => onRateChange(value)}
              className={cn(
                "cursor-pointer rounded-[8px] px-2.5 py-1.5 text-[13px] text-bvc-ink data-highlighted:bg-bvc-surface data-highlighted:text-bvc-ink",
                value === rate && "font-semibold text-bvc-accent"
              )}
            >
              {value === 1 ? "Bình thường" : `${value}×`}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
