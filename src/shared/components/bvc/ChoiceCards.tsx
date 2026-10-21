import { cn } from "@/shared/utils/cn";

interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface ChoiceCardsProps<T extends string> {
  name: string;
  label: string;
  value: T;
  options: ChoiceOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
}

export function ChoiceCards<T extends string>({
  name,
  label,
  value,
  options,
  onChange,
  disabled,
}: ChoiceCardsProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-2">
      {options.map((option) => {
        const isDisabled = disabled || option.disabled;
        const isChecked = option.value === value;
        return (
          <label
            key={option.value}
            className={cn(
              "flex min-h-[46px] flex-1 items-center gap-2.5 rounded-[13px] px-[13px] text-sm",
              isChecked
                ? "border-2 border-bvc-ink font-semibold text-bvc-ink"
                : "border border-bvc-border-strong text-bvc-ink",
              isDisabled && !isChecked && "border-bvc-border bg-bvc-surface text-bvc-muted",
              isDisabled ? "cursor-not-allowed" : "cursor-pointer"
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={isChecked}
              disabled={isDisabled}
              onChange={() => onChange(option.value)}
              className="m-0 accent-bvc-ink"
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
