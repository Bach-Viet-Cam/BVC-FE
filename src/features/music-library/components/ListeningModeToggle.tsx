import { Headphones, Speaker } from "lucide-react";
import { type ListeningMode } from "@/features/ensemble/types/ensembleTypes";
import { cn } from "@/shared/utils/cn";

interface ListeningModeToggleProps {
  value: ListeningMode;
  disabled?: boolean;
  onChange: (mode: ListeningMode) => void;
}

const OPTIONS: { value: ListeningMode; label: string; Icon: typeof Speaker }[] = [
  { value: "speaker", label: "Loa ngoài", Icon: Speaker },
  { value: "headphones", label: "Tai nghe", Icon: Headphones },
];

// Chọn cách nghe các bè lúc thu; quyết định bộ lọc micro dùng cho bản thu.
export function ListeningModeToggle({ value, disabled, onChange }: ListeningModeToggleProps) {
  return (
    <div role="radiogroup" aria-label="Cách nghe các bè" className="flex gap-1 rounded-full bg-bvc-soft p-1">
      {OPTIONS.map(({ value: option, label, Icon }) => {
        const isSelected = option === value;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onChange(option)}
            className={cn(
              "flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-[13.5px] font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              isSelected
                ? "bg-white font-semibold text-bvc-ink shadow-xs ring-1 ring-bvc-border-strong"
                : "text-bvc-muted hover:text-bvc-ink"
            )}
          >
            <Icon size={16} aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
