import { Plus, X } from "lucide-react";
import type { SelectOption } from "@/shared/types/commonTypes";

interface InstrumentPickerProps {
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  hasError?: boolean;
}

export function InstrumentPicker({ options, value, onChange, hasError }: InstrumentPickerProps) {
  const selected = value
    .map((id) => options.find((option) => option.value === id))
    .filter((option) => option !== undefined);
  const remaining = options.filter((option) => !value.includes(option.value));

  return (
    <div className="flex flex-wrap gap-1.5" aria-invalid={hasError || undefined}>
      {selected.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-label={`Bỏ ${option.label}`}
          onClick={() => onChange(value.filter((id) => id !== option.value))}
          className="inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-[10px] bg-bvc-surface px-2.5 text-[13px] text-bvc-ink hover:bg-bvc-border"
        >
          {option.label}
          <X className="size-3.5" aria-hidden />
        </button>
      ))}
      {remaining.length > 0 && (
        <span className="relative inline-flex">
          <select
            aria-label="Thêm nhạc cụ"
            value=""
            onChange={(event) => event.target.value && onChange([...value, event.target.value])}
            className="min-h-[34px] cursor-pointer appearance-none rounded-[10px] border border-dashed border-bvc-bar-strong bg-white pr-2.5 pl-7 text-[13px] text-bvc-ink hover:border-bvc-ink"
          >
            <option value="" disabled>
              thêm nhạc cụ
            </option>
            {remaining.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Plus
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-bvc-ink"
            aria-hidden
          />
        </span>
      )}
    </div>
  );
}
