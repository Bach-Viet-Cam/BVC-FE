import type { ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { ACCURACY_RANGE_OPTIONS, DATE_PRESET_OPTIONS } from "@/features/practice/constants/submissionHistoryMockData";
import type {
  SubmissionAccuracyRange,
  SubmissionDatePreset,
  SubmissionFilter,
  SubmissionPieceOption,
} from "@/features/practice/types/submissionHistoryTypes";
import { cn } from "@/shared/utils/cn";

interface SubmissionFilterBarProps {
  filter: SubmissionFilter;
  pieceOptions: SubmissionPieceOption[];
  activeFilterCount: number;
  onPieceIds: (pieceIds: string[]) => void;
  onDatePreset: (preset: SubmissionDatePreset | null) => void;
  onToggleAccuracyRange: (range: SubmissionAccuracyRange) => void;
  onClear: () => void;
}

interface FilterDropdownProps {
  label: string;
  isActive: boolean;
  children: ReactNode;
}

// Nút chip mở danh sách chọn; sáng lên và hiện giá trị đang chọn khi có lọc
function FilterDropdown({ label, isActive, children }: FilterDropdownProps) {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border pr-2.5 pl-3 text-[13.5px]",
          isActive
            ? "border-bvc-accent bg-bvc-accent-tint font-bold text-bvc-accent-text"
            : "border-bvc-border-strong bg-white text-bvc-ink"
        )}
      >
        {label}
        <ChevronDown className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">{children}</PopoverContent>
    </Popover>
  );
}

interface OptionRowProps {
  label: string;
  checked: boolean;
  multiple: boolean;
  onSelect: () => void;
}

// Một dòng lựa chọn: ô tick khi chọn nhiều, dấu tick khi chọn một
function OptionRow({ label, checked, multiple, onSelect }: OptionRowProps) {
  return (
    <button
      type="button"
      role={multiple ? "checkbox" : "radio"}
      aria-checked={checked}
      onClick={onSelect}
      className="flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left text-sm text-bvc-ink hover:bg-bvc-soft"
    >
      <span
        className={cn(
          "flex size-4.5 shrink-0 items-center justify-center border",
          multiple ? "rounded" : "rounded-full",
          checked ? "border-bvc-ink bg-bvc-ink text-white" : "border-bvc-border-strong bg-white"
        )}
      >
        {checked && <Check className="size-3" strokeWidth={3} aria-hidden />}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}

// Bộ lọc nhanh: bài hát (chọn nhiều), ngày nộp (một mốc), accuracy (chọn nhiều khoảng)
export function SubmissionFilterBar({
  filter,
  pieceOptions,
  activeFilterCount,
  onPieceIds,
  onDatePreset,
  onToggleAccuracyRange,
  onClear,
}: SubmissionFilterBarProps) {
  const pieceLabel =
    filter.pieceIds.length === 0
      ? "Tên bài"
      : filter.pieceIds.length === 1
        ? (pieceOptions.find((option) => option.id === filter.pieceIds[0])?.title ?? "1 bài")
        : `${filter.pieceIds.length} bài`;
  const dateLabel = DATE_PRESET_OPTIONS.find((option) => option.value === filter.datePreset)?.label ?? "Ngày nộp";
  const accuracyLabel = filter.accuracyRanges.length === 0 ? "Accuracy" : `${filter.accuracyRanges.length} khoảng`;

  function togglePiece(id: string) {
    onPieceIds(
      filter.pieceIds.includes(id) ? filter.pieceIds.filter((value) => value !== id) : [...filter.pieceIds, id]
    );
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      <FilterDropdown label={pieceLabel} isActive={filter.pieceIds.length > 0}>
        {pieceOptions.map((option) => (
          <OptionRow
            key={option.id}
            label={option.title}
            multiple
            checked={filter.pieceIds.includes(option.id)}
            onSelect={() => togglePiece(option.id)}
          />
        ))}
      </FilterDropdown>

      <FilterDropdown label={dateLabel} isActive={filter.datePreset !== null}>
        {DATE_PRESET_OPTIONS.map((option) => (
          <OptionRow
            key={option.value}
            label={option.label}
            multiple={false}
            checked={filter.datePreset === option.value}
            onSelect={() => onDatePreset(option.value)}
          />
        ))}
      </FilterDropdown>

      <FilterDropdown label={accuracyLabel} isActive={filter.accuracyRanges.length > 0}>
        {ACCURACY_RANGE_OPTIONS.map((option) => (
          <OptionRow
            key={option.value}
            label={option.label}
            multiple
            checked={filter.accuracyRanges.includes(option.value)}
            onSelect={() => onToggleAccuracyRange(option.value)}
          />
        ))}
      </FilterDropdown>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="min-h-9 shrink-0 cursor-pointer px-1.5 text-[13.5px] font-bold text-bvc-ink"
        >
          Xóa
        </button>
      )}
    </div>
  );
}
