interface MetronomeWidgetProps {
  bpm: number;
  timeSignature: string;
  currentBeat: number;
  onBpmChange: (bpm: number) => void;
}

const MIN_BPM = 20;
const MAX_BPM = 240;
const BEATS = 4;

export function MetronomeWidget({
  bpm,
  timeSignature,
  currentBeat,
  onBpmChange,
}: MetronomeWidgetProps) {
  const beats = parseInt(timeSignature.split("/")[0] ?? "4", 10);

  return (
    <div
      className="flex shrink-0 flex-col gap-[9px] rounded-[18px] border border-bvc-border bg-white p-[12px_13px]"
      style={{ width: 138 }}
    >
      {/* Row 1: label + time sig */}
      <div className="flex items-baseline justify-between">
        <span className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-bvc-muted">
          Nhịp
        </span>
        <span className="font-bvc-mono text-[12px] text-bvc-muted">{timeSignature}</span>
      </div>

      {/* Row 2: − / BPM / + */}
      <div className="flex items-center justify-between gap-[6px]">
        <button
          type="button"
          aria-label="Giảm BPM"
          onClick={() => onBpmChange(Math.max(MIN_BPM, bpm - 1))}
          className="flex size-[30px] items-center justify-center rounded-[10px] border border-bvc-border-strong bg-bvc-surface text-[18px] leading-none text-bvc-ink"
        >
          −
        </button>

        <span className="font-bvc-mono text-[24px] font-semibold text-bvc-ink">{bpm}</span>

        <button
          type="button"
          aria-label="Tăng BPM"
          onClick={() => onBpmChange(Math.min(MAX_BPM, bpm + 1))}
          className="flex size-[30px] items-center justify-center rounded-[10px] border border-bvc-border-strong bg-bvc-surface text-[18px] leading-none text-bvc-ink"
        >
          +
        </button>
      </div>

      {/* Row 3: beat indicators */}
      <div
        className="grid gap-[5px]"
        style={{ gridTemplateColumns: `repeat(${Math.min(beats, BEATS)}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: Math.min(beats, BEATS) }).map((_, i) => (
          <span
            key={i}
            className="h-[6px] rounded-[3px]"
            style={{
              backgroundColor: i === currentBeat ? "var(--color-bvc-accent)" : "var(--color-bvc-border)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
