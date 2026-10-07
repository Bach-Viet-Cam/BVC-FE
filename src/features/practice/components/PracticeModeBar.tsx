import { cn } from "@/shared/utils/cn";
import type { PracticeMode } from "@/features/practice/types/practiceTypes";

interface PracticeModeBarProps {
  mode: PracticeMode;
  onModeChange: (mode: PracticeMode) => void;
}

const MODES: { value: PracticeMode; label: string }[] = [
  { value: "full", label: "Toàn bài" },
  { value: "section", label: "Luyện đoạn" },
  { value: "slow", label: "Chậm 70%" },
  { value: "step", label: "Từng nốt" },
];

export function PracticeModeBar({ mode, onModeChange }: PracticeModeBarProps) {
  return (
    <div className="flex gap-[7px] overflow-x-auto px-[14px] pb-[2px]" style={{ scrollbarWidth: "none" }}>
      {MODES.map(({ value, label }) => {
        const isActive = mode === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onModeChange(value)}
            className={cn(
              "min-h-[36px] shrink-0 rounded-[12px] border px-[13px] text-[13.5px] cursor-pointer",
              isActive
                ? "border-bvc-accent bg-bvc-accent-tint font-bold text-bvc-accent-text"
                : "border-bvc-border-strong bg-white font-medium text-bvc-ink"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
