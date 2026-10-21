import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface FilterSelectProps {
  label: string;
  value: string;
  allValue: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

// Chip-shaped filter from the UI/ list designs; dark once a value other than "Tất cả" is chosen.
export function FilterSelect({ label, value, allValue, options, onChange }: FilterSelectProps) {
  const isFiltered = value !== allValue;
  return (
    <span
      className={cn(
        "relative inline-flex min-h-[44px] shrink-0 items-center rounded-[18px] border text-[13px]",
        isFiltered
          ? "border-bvc-ink bg-bvc-ink font-semibold text-white"
          : "border-bvc-border-strong bg-white text-bvc-ink"
      )}
    >
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[44px] cursor-pointer appearance-none bg-transparent pl-[12px] pr-[28px] outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-bvc-ink">
            {`${label}: ${option.label}`}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        strokeWidth={1.7}
        aria-hidden="true"
        className="pointer-events-none absolute right-[10px]"
      />
    </span>
  );
}
