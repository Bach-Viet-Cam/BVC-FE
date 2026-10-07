import { cn } from "@/shared/utils/cn";

interface Chip {
  value: string;
  label: string;
}

interface FilterChipsProps {
  chips: Chip[];
  active: string;
  onChange: (value: string) => void;
}

export function FilterChips({ chips, active, onChange }: FilterChipsProps) {
  return (
    <div
      className="flex gap-[7px] overflow-x-auto px-[14px] pb-[2px]"
      style={{ scrollbarWidth: "none" }}
    >
      {chips.map(({ value, label }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={cn(
              "min-h-[34px] shrink-0 cursor-pointer rounded-[11px] border px-[12px] text-[13px]",
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
