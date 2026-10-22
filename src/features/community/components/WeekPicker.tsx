import { addWeeks, format, parseISO, startOfWeek } from "date-fns";
import { cn } from "@/shared/utils/cn";

const PAST_WEEKS_SHOWN = 2;
const FUTURE_WEEKS_SHOWN = 8;

interface WeekPickerProps {
  id: string;
  // Monday of the chosen week, yyyy-MM-dd ("" = none).
  value: string;
  onChange: (weekStart: string) => void;
  hasError?: boolean;
  // Injectable clock for tests.
  now?: Date;
}

interface WeekOption {
  value: string;
  label: string;
  isPast: boolean;
}

function toOption(monday: Date, currentValue: string): WeekOption {
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
  return {
    value: format(monday, "yyyy-MM-dd"),
    label: `${format(monday, "dd/MM")} - ${format(sunday, "dd/MM/yyyy")}`,
    isPast: format(monday, "yyyy-MM-dd") < currentValue,
  };
}

// Hand-built list of Monday-start weeks: the current week plus the next ones; earlier weeks are disabled.
export function WeekPicker({ id, value, onChange, hasError = false, now = new Date() }: WeekPickerProps) {
  const currentMonday = startOfWeek(now, { weekStartsOn: 1 });
  const currentValue = format(currentMonday, "yyyy-MM-dd");
  const mondays = Array.from({ length: PAST_WEEKS_SHOWN + 1 + FUTURE_WEEKS_SHOWN }, (_, index) =>
    addWeeks(currentMonday, index - PAST_WEEKS_SHOWN)
  );
  // A stored draft week may fall outside the window: still show it so the selection is visible.
  const hasStoredValue = value !== "" && !mondays.some((monday) => format(monday, "yyyy-MM-dd") === value);
  const options = [...(hasStoredValue ? [parseISO(value)] : []), ...mondays]
    .map((monday) => toOption(monday, currentValue))
    .sort((left, right) => left.value.localeCompare(right.value));

  return (
    <div
      id={id}
      role="radiogroup"
      aria-label="Tuần"
      aria-invalid={hasError}
      className="grid grid-cols-1 gap-[8px] min-[480px]:grid-cols-2"
    >
      {options.map((option) => {
        const isChecked = option.value === value;
        return (
          <label
            key={option.value}
            className={cn(
              "flex min-h-[44px] cursor-pointer items-center gap-[10px] rounded-[13px] border border-bvc-border-strong bg-white px-[13px] font-mono text-[13.5px] text-bvc-ink",
              isChecked && "border-bvc-ink bg-bvc-soft font-semibold",
              option.isPast && "cursor-not-allowed bg-bvc-soft text-bvc-muted"
            )}
          >
            <input
              type="radio"
              name={id}
              value={option.value}
              checked={isChecked}
              disabled={option.isPast}
              onChange={() => onChange(option.value)}
              className="size-[18px] accent-bvc-ink"
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
