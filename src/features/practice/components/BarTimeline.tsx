export type BarAccuracy = "ok" | "attention" | "bad";

interface BarTimelineProps {
  bars: { h: number; tone: BarAccuracy }[];
  rangeLabel: string;
}

const TONE_COLOR: Record<BarAccuracy, string> = {
  ok: "var(--color-bvc-ok)",
  attention: "var(--color-bvc-error)",
  bad: "var(--color-bvc-warn)",
};

const LEGEND: { tone: BarAccuracy; label: string }[] = [
  { tone: "ok", label: "Đạt" },
  { tone: "attention", label: "Cần chú ý" },
  { tone: "bad", label: "Sai nhiều" },
];

export function BarTimeline({ bars, rangeLabel }: BarTimelineProps) {
  return (
    <section className="flex flex-col gap-2.75 rounded-bvc-xl border border-bvc-border bg-white px-4 py-3.5 md:rounded-[22px] md:px-5.5 md:py-4.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-bold text-bvc-ink">Dòng thời gian theo ô nhịp</span>
        <span className="text-xs text-bvc-muted">{rangeLabel}</span>
      </div>

      <div className="flex h-[54px] items-end gap-0.5 md:h-37.5 md:gap-[3px]">
        {bars.map((bar, index) => (
          <span
            key={index}
            className="flex-1 rounded-[2px]"
            style={{ height: `${bar.h}%`, backgroundColor: TONE_COLOR[bar.tone] }}
          />
        ))}
      </div>

      <div className="flex gap-3.5">
        {LEGEND.map((item) => (
          <span key={item.tone} className="flex items-center gap-[5px] text-xs text-bvc-muted">
            <span className="size-2 rounded-[2px]" style={{ backgroundColor: TONE_COLOR[item.tone] }} />
            {item.label}
          </span>
        ))}
      </div>
    </section>
  );
}
