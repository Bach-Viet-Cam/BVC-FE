import { useState } from "react";
import { type WeeklyAverage } from "@/features/classes/types/progressTypes";
import { formatDateRange } from "@/features/classes/utils/classFormat";
import { formatPercent } from "@/features/classes/utils/assignmentFormat";

interface WeeklyAccuracyChartProps {
  weekly: WeeklyAverage[];
  minAccuracy: number;
}

const TITLE = "Độ chính xác trung bình theo tuần";
const WIDTH = 320;
const HEIGHT = 190;
const PADDING = { left: 34, right: 14, top: 14, bottom: 28 };
const PLOT_WIDTH = WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;
const Y_TICKS = [0, 50, 100];

const xOf = (index: number, count: number) => PADDING.left + (PLOT_WIDTH * (index + 0.5)) / count;
const yOf = (value: number) => PADDING.top + PLOT_HEIGHT * (1 - Math.min(Math.max(value, 0), 100) / 100);
const describeWeek = (week: WeeklyAverage) =>
  `W${week.week} · ${week.average === null ? "Chưa có dữ liệu" : formatPercent(week.average)}`;

// Consecutive weeks with data; an empty week breaks the line (spec §4).
function segmentsOf(weekly: WeeklyAverage[]): number[][] {
  const segments: number[][] = [];
  let current: number[] = [];
  weekly.forEach((week, index) => {
    if (week.average === null) {
      if (current.length > 1) segments.push(current);
      current = [];
    } else current.push(index);
  });
  if (current.length > 1) segments.push(current);
  return segments;
}

// Single series: no legend, the title names it. Hover / tap shows the week; the table is the accessible view.
export function WeeklyAccuracyChart({ weekly, minAccuracy }: WeeklyAccuracyChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const count = weekly.length;
  const thresholdY = yOf(minAccuracy);
  const ariaLabel = `${TITLE}: ${weekly.map(describeWeek).join(", ")}. Ngưỡng ${minAccuracy}%.`;
  const active = activeIndex === null ? null : weekly[activeIndex];

  return (
    <section className="flex flex-col gap-[8px] rounded-[18px] border border-bvc-border px-[14px] py-[13px]">
      <h2 className="m-0 text-[15px] font-bold">{TITLE}</h2>
      <div className="relative">
        <svg role="img" aria-label={ariaLabel} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="block h-auto w-full">
          {Y_TICKS.map((tick) => (
            <g key={tick}>
              <line
                x1={PADDING.left}
                x2={WIDTH - PADDING.right}
                y1={yOf(tick)}
                y2={yOf(tick)}
                className="stroke-bvc-border"
                strokeWidth={1}
              />
              <text
                x={PADDING.left - 6}
                y={yOf(tick)}
                dy="0.32em"
                textAnchor="end"
                className="fill-bvc-muted text-[10px]"
              >
                {tick}%
              </text>
            </g>
          ))}
          <line
            x1={PADDING.left}
            x2={WIDTH - PADDING.right}
            y1={thresholdY}
            y2={thresholdY}
            className="stroke-bvc-bar-strong"
            strokeWidth={1.5}
            strokeDasharray="5 4"
          />
          <text
            x={WIDTH - PADDING.right}
            y={thresholdY}
            dy={minAccuracy > 88 ? "1.1em" : "-0.45em"}
            textAnchor="end"
            className="fill-bvc-muted text-[10px]"
          >
            Ngưỡng {minAccuracy}%
          </text>
          {activeIndex !== null && (
            <line
              x1={xOf(activeIndex, count)}
              x2={xOf(activeIndex, count)}
              y1={PADDING.top}
              y2={PADDING.top + PLOT_HEIGHT}
              className="stroke-bvc-bar-strong"
              strokeWidth={1}
            />
          )}
          {segmentsOf(weekly).map((segment) => (
            <path
              key={segment[0]}
              data-testid="chart-segment"
              d={segment
                .map(
                  (index, order) =>
                    `${order === 0 ? "M" : "L"}${xOf(index, count)},${yOf(weekly[index].average as number)}`
                )
                .join(" ")}
              fill="none"
              className="stroke-bvc-ok"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          {weekly.map((week, index) =>
            week.average === null ? null : (
              <circle
                key={week.week}
                data-testid="chart-point"
                cx={xOf(index, count)}
                cy={yOf(week.average)}
                r={activeIndex === index ? 5.5 : 4.5}
                className="fill-bvc-ok stroke-white"
                strokeWidth={2}
              />
            )
          )}
          {weekly.map((week, index) => (
            <text
              key={week.week}
              x={xOf(index, count)}
              y={HEIGHT - 8}
              textAnchor="middle"
              className="fill-bvc-muted text-[11px]"
            >
              W{week.week}
            </text>
          ))}
          {weekly.map((week, index) => (
            <rect
              key={week.week}
              data-testid="chart-hit"
              x={PADDING.left + (PLOT_WIDTH * index) / count}
              y={0}
              width={PLOT_WIDTH / count}
              height={HEIGHT}
              fill="transparent"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </svg>
        {active && activeIndex !== null && (
          <div
            role="tooltip"
            className="pointer-events-none absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-[10px] border border-bvc-border bg-white px-[9px] py-[5px] text-[12px] text-bvc-ink shadow-sm"
            style={{ left: `${(xOf(activeIndex, count) / WIDTH) * 100}%` }}
          >
            {describeWeek(active)}
          </div>
        )}
      </div>
      <details className="text-[12.5px] text-bvc-muted">
        <summary className="cursor-pointer">Xem dạng bảng</summary>
        <table className="mt-[6px] w-full text-left text-bvc-ink">
          <thead>
            <tr className="text-bvc-muted">
              <th className="py-[3px] font-semibold">Tuần</th>
              <th className="py-[3px] font-semibold">Thời gian</th>
              <th className="py-[3px] text-right font-semibold">Độ chính xác TB</th>
            </tr>
          </thead>
          <tbody>
            {weekly.map((week) => (
              <tr key={week.week}>
                <td className="py-[3px]">W{week.week}</td>
                <td className="py-[3px]">{formatDateRange(week.startDate, week.endDate)}</td>
                <td className="py-[3px] text-right">{week.average === null ? "—" : formatPercent(week.average)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
