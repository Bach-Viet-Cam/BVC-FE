import { ChevronDown, X } from "lucide-react";
import {
  Combobox,
  ComboboxClear,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@/shared/components/ui/combobox";
import { cn } from "@/shared/utils/cn";
import { matchesKeyword } from "@/shared/utils/searchUtils";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterComboboxProps {
  label: string;
  value: string;
  allValue: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

// Chip-shaped filter like FilterSelect, typed to search: for lists that grow (e.g. the lecturer's classes).
// Clearing the input or the selection goes back to "Tất cả".
export function FilterCombobox({ label, value, allValue, options, onChange }: FilterComboboxProps) {
  const selected = options.find((option) => option.value === value) ?? null;
  const isFiltered = value !== allValue && selected !== null;

  return (
    <Combobox<FilterOption>
      items={options}
      value={selected}
      onValueChange={(option) => onChange(option?.value ?? allValue)}
      itemToStringLabel={(option) => option.label}
      isItemEqualToValue={(option, current) => option.value === current.value}
      filter={(option, query) => matchesKeyword(query, [option.label])}
    >
      <span
        className={cn(
          "relative inline-flex min-h-[44px] w-[260px] max-w-full shrink-0 items-center rounded-[18px] border text-[13px]",
          isFiltered
            ? "border-bvc-ink bg-bvc-ink font-semibold text-white"
            : "border-bvc-border-strong bg-white text-bvc-ink"
        )}
      >
        <span className="shrink-0 pl-[12px]">{label}:</span>
        <ComboboxInput
          aria-label={label}
          placeholder="Tất cả"
          className={cn(
            "min-h-[44px] min-w-0 flex-1 bg-transparent pl-[6px] pr-[30px] outline-none",
            isFiltered ? "placeholder:text-white/70" : "placeholder:text-bvc-ink"
          )}
        />
        {isFiltered ? (
          <ComboboxClear
            aria-label={`Bỏ lọc ${label.toLowerCase()}`}
            className="absolute right-[8px] flex size-[22px] cursor-pointer items-center justify-center rounded-full hover:bg-white/15"
          >
            <X size={14} strokeWidth={1.9} aria-hidden="true" />
          </ComboboxClear>
        ) : (
          <ChevronDown
            size={14}
            strokeWidth={1.7}
            aria-hidden="true"
            className="pointer-events-none absolute right-[10px]"
          />
        )}
      </span>
      <ComboboxPopup
        emptyMessage={`Không tìm thấy ${label.toLowerCase()} phù hợp.`}
        // BVC surface: a visible edge so the list does not blend into the white page
        className="rounded-[14px] border-bvc-border-strong bg-white p-1.5 shadow-[0_12px_40px_rgba(18,63,51,0.18)]"
      >
        <ComboboxList>
          {(option: FilterOption) => (
            <ComboboxItem key={option.value} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxPopup>
    </Combobox>
  );
}
