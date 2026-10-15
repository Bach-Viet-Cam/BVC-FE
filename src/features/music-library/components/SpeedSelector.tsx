import { REFERENCE_SPEEDS } from "@/features/music-library/constants/musicLibraryConstants";
import { cn } from "@/shared/utils/cn";

interface SpeedSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function SpeedSelector({ value, onChange }: SpeedSelectorProps) {
  return (
    <div role="radiogroup" aria-label="Tốc độ phát" className="flex rounded-[11px] bg-bvc-surface p-1">
      {REFERENCE_SPEEDS.map((speed) => (
        <button
          key={speed}
          type="button"
          role="radio"
          aria-checked={speed === value}
          onClick={() => onChange(speed)}
          className={cn(
            "min-h-9 flex-1 cursor-pointer rounded-[9px] font-bvc-mono text-[13px]",
            speed === value ? "bg-bvc-ink font-semibold text-white" : "text-bvc-muted hover:text-bvc-ink"
          )}
        >
          {speed}×
        </button>
      ))}
    </div>
  );
}
