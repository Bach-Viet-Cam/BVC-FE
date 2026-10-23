import { RESULT_MOCK } from "@/features/practice/constants/resultsMockData";

const RING_SIZE = 96;
const RING_STROKE = 9;

const METRICS = [
  { key: "pitch", label: "Cao độ", color: "var(--color-bvc-ok)" },
  { key: "rhythm", label: "Nhịp / phách", color: "var(--color-bvc-warn)" },
  { key: "tempo", label: "Tempo", color: "var(--color-bvc-dot-warn)" },
] as const;

// Điểm tổng + ba chỉ số thành phần (cao độ, nhịp / phách, tempo)
export function ResultOverviewCard() {
  const { scores } = RESULT_MOCK;
  const radius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <section className="flex items-center gap-4 rounded-bvc-xl border border-bvc-border bg-white p-4 md:gap-6 md:rounded-[22px] md:p-5.5">
      <div className="relative shrink-0" style={{ width: RING_SIZE, height: RING_SIZE }}>
        <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90" aria-hidden>
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={radius}
            fill="none"
            stroke="var(--color-bvc-surface)"
            strokeWidth={RING_STROKE}
          />
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={radius}
            fill="none"
            stroke="var(--color-bvc-ok)"
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - scores.overall / 100)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bvc-display text-2xl leading-none font-extrabold tracking-tight text-bvc-ink">
            {scores.overall}
          </span>
          <span className="mt-1 px-1 text-center text-[8px] font-bold tracking-wider text-bvc-muted uppercase">
            Độ chính xác
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5">
        {METRICS.map((metric) => (
          <div key={metric.key}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-[13px] font-semibold text-bvc-muted">{metric.label}</span>
              <span className="text-sm font-bold text-bvc-ink">{scores[metric.key]}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-bvc-surface">
              <div
                className="h-full rounded-full"
                style={{ width: `${scores[metric.key]}%`, backgroundColor: metric.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
