import { ChevronDown, X } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { SelectOption } from "@/shared/types/commonTypes";

interface FilterPillProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  size?: "sm" | "md";
}

// Chưa chọn: pill viền + select gốc (dùng tốt trên mobile). Đã chọn: pill đậm kèm nút bỏ lọc.
export function FilterPill({ label, value, options, onChange, size = "md" }: FilterPillProps) {
  const selected = options.find((option) => option.value === value);
  const height = size === "sm" ? "min-h-9 text-[13px]" : "min-h-10 text-[13.5px]";
  // Pill thường nằm trong hàng overflow-x-auto: chừa 1px trên/dưới để mép cắt của hàng không ăn mất viền
  const clipGap = "my-px";

  if (selected) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-bvc-ink pr-1 pl-4 font-semibold whitespace-nowrap text-white",
          clipGap,
          height
        )}
      >
        {label}: {selected.label}
        <button
          type="button"
          aria-label={`Bỏ lọc ${selected.label}`}
          onClick={() => onChange("")}
          className="flex size-8 cursor-pointer items-center justify-center rounded-full hover:bg-white/15"
        >
          <X className="size-4" />
        </button>
      </span>
    );
  }

  return (
    <span className={cn("relative inline-flex shrink-0 items-center", clipGap, height)}>
      <select
        aria-label={`Lọc theo ${label}`}
        value=""
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-full cursor-pointer appearance-none [-webkit-appearance:none] rounded-full border border-bvc-border-strong bg-white pr-8 pl-4 text-bvc-ink",
          "outline-none hover:border-bvc-bar-strong focus-visible:border-bvc-bar-strong",
          height
        )}
      >
        <option value="" disabled>
          {label}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 size-4 text-bvc-muted" aria-hidden />
    </span>
  );
}
