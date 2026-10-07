import type { TunerState } from "@/features/practice/types/practiceTypes";

interface TunerWidgetProps {
  state: TunerState;
}

function getPinColor(cents: number): string {
  if (Math.abs(cents) <= 5) return "var(--color-bvc-ok)";
  if (Math.abs(cents) <= 15) return "var(--color-bvc-warn)";
  return "var(--color-bvc-error)";
}

function getPinPosition(cents: number): string {
  // 0¢ = 50%, +50¢ = 100%, -50¢ = 0%
  const clamped = Math.max(-50, Math.min(50, cents));
  return `${50 + clamped}%`;
}

export function TunerWidget({ state }: TunerWidgetProps) {
  const { noteName, scientificNote, frequency, cents } = state;
  const direction = cents < 0 ? "hơi thấp" : cents > 0 ? "hơi cao" : "chuẩn";
  const offsetLabel = cents === 0 ? "chuẩn" : `${cents > 0 ? "+" : ""}${cents}¢ ${direction}`;

  return (
    <div className="flex flex-1 flex-col gap-[9px] rounded-[18px] border border-bvc-border bg-white p-[12px_13px]">
      {/* Row 1: label + offset */}
      <div className="flex items-baseline justify-between">
        <span className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-bvc-muted">
          Tuner
        </span>
        <span className="font-bvc-mono text-[12px] text-bvc-muted">{offsetLabel}</span>
      </div>

      {/* Row 2: note name + scientific */}
      <div className="flex items-baseline gap-[6px]">
        <span className="text-[32px] font-extrabold leading-none tracking-[-0.03em] text-bvc-ink">
          {noteName}
        </span>
        <span className="font-bvc-mono text-[14px] text-bvc-muted">
          {scientificNote} · {frequency.toFixed(1)} Hz
        </span>
      </div>

      {/* Row 3: pitch track */}
      <div className="relative h-[8px] rounded-full bg-bvc-border">
        {/* Center divider */}
        <span
          className="absolute top-[-3px] w-[2px] rounded-[1px] bg-bvc-bar"
          style={{ left: "50%", height: 14, transform: "translateX(-50%)" }}
        />
        {/* Indicator pin */}
        <span
          className="absolute top-[-4px] w-[4px] rounded-[2px]"
          style={{
            left: getPinPosition(cents),
            height: 16,
            transform: "translateX(-50%)",
            backgroundColor: getPinColor(cents),
          }}
        />
      </div>
    </div>
  );
}
