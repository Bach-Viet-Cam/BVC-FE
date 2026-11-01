import { Check, ChevronDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import type { SelectOption } from "@/shared/types/commonTypes";
import { cn } from "@/shared/utils/cn";

interface MultiFilterPillProps {
  label: string;
  values: string[];
  options: SelectOption[];
  onChange: (values: string[]) => void;
  size?: "sm" | "md";
}

function describeSelection(label: string, values: string[], options: SelectOption[]) {
  if (values.length === 0) return label;
  if (values.length === 1) return `${label}: ${options.find((option) => option.value === values[0])?.label ?? "1"}`;
  return `${label}: ${values.length} đã chọn`;
}

// Như FilterPill nhưng chọn được nhiều giá trị: bấm mở danh sách tick, đã chọn thì pill đậm kèm nút bỏ lọc
export function MultiFilterPill({ label, values, options, onChange, size = "md" }: MultiFilterPillProps) {
  const isActive = values.length > 0;
  const height = size === "sm" ? "min-h-9 text-[13px]" : "min-h-10 text-[13.5px]";

  const toggle = (value: string) =>
    onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);

  return (
    <span
      className={cn(
        // Pill thường nằm trong hàng overflow-x-auto: chừa 1px trên/dưới để mép cắt của hàng không ăn mất viền
        "my-px inline-flex shrink-0 items-center rounded-full whitespace-nowrap",
        isActive ? "bg-bvc-ink pr-1 font-semibold text-white" : "border border-bvc-border-strong bg-white text-bvc-ink",
        height
      )}
    >
      <Popover>
        <PopoverTrigger
          aria-label={`Lọc theo ${label}`}
          className={cn(
            "inline-flex h-full cursor-pointer items-center gap-1.5 rounded-full pl-4 outline-none",
            isActive ? "pr-1.5" : "pr-3 hover:text-bvc-ink"
          )}
        >
          {describeSelection(label, values, options)}
          {!isActive && <ChevronDown className="size-4 text-bvc-muted" aria-hidden />}
        </PopoverTrigger>
        <PopoverContent className="max-h-80 w-64 overflow-y-auto p-2">
          <div role="group" aria-label={label} className="flex flex-col">
            {options.map((option) => {
              const isChecked = values.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  role="checkbox"
                  aria-checked={isChecked}
                  onClick={() => toggle(option.value)}
                  className="flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left text-sm text-bvc-ink hover:bg-bvc-soft"
                >
                  <span
                    className={cn(
                      "flex size-4.5 shrink-0 items-center justify-center rounded border",
                      isChecked ? "border-bvc-ink bg-bvc-ink text-white" : "border-bvc-border-strong bg-white"
                    )}
                  >
                    {isChecked && <Check className="size-3" strokeWidth={3} aria-hidden />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
          {isActive && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mt-1 w-full cursor-pointer rounded-lg border-t border-bvc-border px-2.5 pt-2 pb-1 text-left text-[13px] font-semibold text-bvc-accent-text hover:underline"
            >
              Bỏ chọn tất cả
            </button>
          )}
        </PopoverContent>
      </Popover>
      {isActive && (
        <button
          type="button"
          aria-label={`Bỏ lọc ${label}`}
          onClick={() => onChange([])}
          className="flex size-8 cursor-pointer items-center justify-center rounded-full hover:bg-white/15"
        >
          <X className="size-4" />
        </button>
      )}
    </span>
  );
}
