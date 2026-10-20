import type { ReactNode } from "react";

interface StepperControlProps {
  value: ReactNode;
  decrementLabel: string;
  incrementLabel: string;
  decrementIcon: ReactNode;
  incrementIcon: ReactNode;
  onDecrement: () => void;
  onIncrement: () => void;
  canDecrement: boolean;
  canIncrement: boolean;
}

const stepButtonClass =
  "flex size-[38px] cursor-pointer items-center justify-center rounded-[10px] text-lg text-bvc-ink hover:bg-bvc-surface disabled:cursor-not-allowed disabled:text-bvc-faint";

export function StepperControl({
  value,
  decrementLabel,
  incrementLabel,
  decrementIcon,
  incrementIcon,
  onDecrement,
  onIncrement,
  canDecrement,
  canIncrement,
}: StepperControlProps) {
  return (
    <div className="flex items-center rounded-bvc-md border border-bvc-border bg-white p-[3px]">
      <button
        type="button"
        aria-label={decrementLabel}
        disabled={!canDecrement}
        onClick={onDecrement}
        className={stepButtonClass}
      >
        {decrementIcon}
      </button>
      <span aria-live="polite" className="min-w-[46px] text-center font-bvc-mono text-[13px] text-bvc-ink">
        {value}
      </span>
      <button
        type="button"
        aria-label={incrementLabel}
        disabled={!canIncrement}
        onClick={onIncrement}
        className={stepButtonClass}
      >
        {incrementIcon}
      </button>
    </div>
  );
}
