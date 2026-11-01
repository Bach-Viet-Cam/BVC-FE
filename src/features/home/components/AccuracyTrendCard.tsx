import type { ReactNode } from "react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { ChartTooltip } from "@/features/practice/components/ChartTooltip";
import { useChartPointer } from "@/features/practice/hooks/useChartPointer";
import { formatSubmittedAt } from "@/features/practice/utils/submissionHistory";
import type { DashboardModeProgress } from "@/features/home/types/homeTypes";
import { formatDelta, formatPercent } from "@/features/home/utils/homeFormat";
import { cn } from "@/shared/utils/cn";

interface AccuracyTrendCardProps {
  title: string;
  icon: ReactNode;
  progress: DashboardModeProgress;
  emptyText: string;
}

const CHART = { width: 300, height: 90, top: 10, bottom: 80, left: 6, right: 294 };

// Trục tung bắt đầu dưới điểm thấp nhất (làm tròn xuống bội 10) để đường không bị dẹt
const floorScore = (lowest: number) => Math.max(0, Math.min(50, Math.floor((lowest - 10) / 10) * 10));

interface DeltaBadgeProps {
  delta: number | null;
}

function DeltaBadge({ delta }: DeltaBadgeProps) {
  if (delta === null) return null;
  const Icon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-bold",
        delta > 0 ? "border-bvc-ok/25 bg-bvc-soft text-bvc-ok" : "border-bvc-border bg-bvc-soft text-bvc-muted"
      )}
    >
      <Icon className="size-3.5" strokeWidth={2.5} aria-hidden />
      {formatDelta(delta)}
    </span>
  );
}

// Điểm các lần đã phân tích gần nhất của một chế độ (độc tấu / hòa tấu), kèm mức thay đổi từ lần đầu đến lần cuối
export function AccuracyTrendCard({ title, icon, progress, emptyText }: AccuracyTrendCardProps) {
  const { x: pointerX, pointerProps } = useChartPointer(CHART.width);
  const { points } = progress;
  const minScore = points.length > 0 ? floorScore(Math.min(...points.map((point) => point.accuracy))) : 0;
  const xAt = (index: number) =>
    points.length === 1
      ? (CHART.left + CHART.right) / 2
      : CHART.left + (index * (CHART.right - CHART.left)) / (points.length - 1);
  const yAt = (score: number) => CHART.bottom - ((score - minScore) / (100 - minScore)) * (CHART.bottom - CHART.top);
  const plotted = points.map((point, index) => ({ ...point, x: xAt(index), y: yAt(point.accuracy) }));
  const line = plotted.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");
  const last = plotted[plotted.length - 1];
  const hover =
    pointerX === null || plotted.length === 0
      ? null
      : plotted.reduce((nearest, point) =>
          Math.abs(point.x - pointerX) < Math.abs(nearest.x - pointerX) ? point : nearest
        );

  return (
    <section className="flex flex-col gap-3 rounded-bvc-xl border border-bvc-border bg-white p-4 md:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-bvc-surface text-bvc-accent-text">
            {icon}
          </span>
          <div>
            <h3 className="text-[15px] font-bold text-bvc-ink">{title}</h3>
            <p className="text-[12px] text-bvc-muted">{progress.completed} lần đã chấm</p>
          </div>
        </div>
        <DeltaBadge delta={progress.deltaPercent} />
      </div>

      {plotted.length === 0 ? (
        <p className="rounded-xl bg-bvc-soft px-3 py-6 text-center text-[13px] text-bvc-muted">{emptyText}</p>
      ) : (
        <>
          <div className="flex items-baseline gap-4">
            <span className="flex flex-col">
              <span className="text-[11.5px] text-bvc-muted">Gần nhất</span>
              <span className="font-bvc-mono text-[24px] leading-tight font-semibold text-bvc-ink">
                {formatPercent(progress.latestAccuracy)}
              </span>
            </span>
            <span className="flex flex-col">
              <span className="text-[11.5px] text-bvc-muted">Trung bình</span>
              <span className="font-bvc-mono text-[16px] leading-tight font-semibold text-bvc-muted">
                {formatPercent(progress.averageAccuracy)}
              </span>
            </span>
          </div>
          <div className="relative">
            <svg
              {...pointerProps}
              viewBox={`0 0 ${CHART.width} ${CHART.height}`}
              fill="none"
              className="h-24 w-full cursor-crosshair overflow-visible"
              role="img"
              aria-label={`${title}: điểm ${plotted.length} lần gần nhất ${plotted.map((point) => formatPercent(point.accuracy)).join(", ")}`}
            >
              <line
                x1={CHART.left}
                y1={CHART.bottom}
                x2={CHART.right}
                y2={CHART.bottom}
                stroke="var(--color-bvc-border-strong)"
              />
              {plotted.length > 1 && (
                <path
                  d={line}
                  stroke="var(--color-bvc-ink)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              <circle cx={last.x} cy={last.y} r="4" fill="var(--color-bvc-ink)" stroke="#fff" strokeWidth="2" />
              {hover && (
                <g pointerEvents="none">
                  <line
                    x1={hover.x}
                    y1={CHART.top}
                    x2={hover.x}
                    y2={CHART.bottom}
                    stroke="var(--color-bvc-ink)"
                    strokeWidth="1"
                    strokeDasharray="3 2"
                  />
                  <circle cx={hover.x} cy={hover.y} r="5" fill="#fff" stroke="var(--color-bvc-ink)" strokeWidth="2" />
                </g>
              )}
            </svg>
            {hover && (
              <ChartTooltip percent={(hover.x / CHART.width) * 100}>
                <div className="font-bold">{formatPercent(hover.accuracy)}</div>
                <div className="text-bvc-muted">{formatSubmittedAt(hover.submittedAt)}</div>
              </ChartTooltip>
            )}
          </div>
          <p className="text-[11.5px] text-bvc-faint">
            {plotted.length > 1
              ? `${plotted.length} lần chấm gần nhất, mức thay đổi tính từ lần đầu đến lần cuối.`
              : "Cần thêm một lần chấm nữa để thấy mức tiến bộ."}
          </p>
        </>
      )}
    </section>
  );
}
