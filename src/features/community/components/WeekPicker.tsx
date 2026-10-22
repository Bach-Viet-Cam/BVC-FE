import { cn } from "@/shared/utils/cn";

const PAST_WEEKS_SHOWN = 2;
const FUTURE_WEEKS_SHOWN = 8;
const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

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

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

// Weeks are Monday to Sunday in UTC+7 (as on the server). Each week is the UTC midnight of its Monday
// calendar date, so no browser-local date arithmetic is involved.
function isoDate(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function currentVietnamMonday(now: Date): Date {
  const shifted = new Date(now.getTime() + VIETNAM_OFFSET_MS);
  const today = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate());
  return new Date(today - ((shifted.getUTCDay() + 6) % 7) * DAY_MS);
}

function toOption(monday: Date, currentValue: string): WeekOption {
  const sunday = new Date(monday.getTime() + 6 * DAY_MS);
  const value = isoDate(monday);
  return {
    value,
    label: `${pad(monday.getUTCDate())}/${pad(monday.getUTCMonth() + 1)} - ${pad(sunday.getUTCDate())}/${pad(sunday.getUTCMonth() + 1)}/${sunday.getUTCFullYear()}`,
    isPast: value < currentValue,
  };
}

// Hand-built list of Monday-start weeks: the current week plus the next ones; earlier weeks are disabled.
export function WeekPicker({ id, value, onChange, hasError = false, now = new Date() }: WeekPickerProps) {
  const currentMonday = currentVietnamMonday(now);
  const currentValue = isoDate(currentMonday);
  const mondays = Array.from(
    { length: PAST_WEEKS_SHOWN + 1 + FUTURE_WEEKS_SHOWN },
    (_, index) => new Date(currentMonday.getTime() + (index - PAST_WEEKS_SHOWN) * WEEK_MS)
  );
  // A stored draft week may fall outside the window: still show it so the selection is visible.
  const hasStoredValue = /^d{4}-d{2}-d{2}$/.test(value) && !mondays.some((monday) => isoDate(monday) === value);
  const options = [...(hasStoredValue ? [new Date(`${value}T00:00:00Z`)] : []), ...mondays]
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
