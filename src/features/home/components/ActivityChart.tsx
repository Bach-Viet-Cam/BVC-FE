import { useState } from "react";
import { ChartTooltip } from "@/features/practice/components/ChartTooltip";
import type { DashboardDay } from "@/features/home/types/homeTypes";
import { formatDayLong, formatDayShort, formatPercent } from "@/features/home/utils/homeFormat";

interface ActivityChartProps {
  days: DashboardDay[];
}

const CHART = { width: 320, height: 150, top: 18, bottom: 122, left: 8, right: 312 };
const BAR_WIDTH = 22;

// Số lượt nộp mỗi ngày trong 7 ngày gần nhất (một chuỗi số liệu, cột hôm nay đậm hơn để định vị)
export function ActivityChart({ days }: ActivityChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const maxCount = Math.max(1, ...days.map((day) => day.submitted));
  const slot = (CHART.right - CHART.left) / days.length;
  const plotHeight = CHART.bottom - CHART.top;
  const total = days.reduce((sum, day) => sum + day.submitted, 0);
  const todayIndex = days.length - 1;
  const hover = hoverIndex === null ? null : days[hoverIndex];

  return (
    <section className="flex flex-col gap-3 rounded-bvc-xl border border-bvc-border bg-white p-4 md:p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[15px] font-bold text-bvc-ink">Lượt nộp 7 ngày qua</h3>
        <span className="font-bvc-mono text-[13px] text-bvc-muted">Tổng {total}</span>
      </div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${CHART.width} ${CHART.height}`}
          className="h-40 w-full overflow-visible"
          role="img"
          aria-label={`Lượt nộp 7 ngày qua: ${days.map((day) => `${formatDayShort(day.date)} ${day.submitted}`).join(", ")}`}
          onPointerLeave={(event) => event.pointerType === "mouse" && setHoverIndex(null)}
        >
          <line
            x1={CHART.left}
            y1={CHART.bottom}
            x2={CHART.right}
            y2={CHART.bottom}
            stroke="var(--color-bvc-border-strong)"
          />
          {days.map((day, index) => {
            const centerX = CHART.left + slot * index + slot / 2;
            const barHeight = day.submitted === 0 ? 0 : Math.max(4, (day.submitted / maxCount) * plotHeight);
            const isToday = index === todayIndex;
            const isHover = index === hoverIndex;
            return (
              <g key={day.date}>
                {barHeight > 0 && (
                  // Bo 4px ở đầu cột, đáy vuông nằm trên trục
                  <path
                    d={`M${centerX - BAR_WIDTH / 2} ${CHART.bottom} V${CHART.bottom - barHeight + 4} q0 -4 4 -4 H${centerX + BAR_WIDTH / 2 - 4} q4 0 4 4 V${CHART.bottom} Z`}
                    fill={isToday || isHover ? "var(--color-bvc-ink)" : "var(--color-bvc-bar-strong)"}
                  />
                )}
                {isToday && day.submitted > 0 && (
                  <text
                    x={centerX}
                    y={CHART.bottom - barHeight - 6}
                    fontSize="10"
                    fontWeight="700"
                    textAnchor="middle"
                    fill="var(--color-bvc-ink)"
                  >
                    {day.submitted}
                  </text>
                )}
                <text
                  x={centerX}
                  y={CHART.bottom + 16}
                  fontSize="10"
                  fontWeight={isToday ? 800 : 600}
                  textAnchor="middle"
                  fill={isToday ? "var(--color-bvc-ink)" : "var(--color-bvc-muted)"}
                >
                  {isToday ? "Hôm nay" : formatDayShort(day.date)}
                </text>
                {/* Vùng bắt hover phủ cả cột, rộng hơn thanh để dễ chạm */}
                <rect
                  x={CHART.left + slot * index}
                  y={CHART.top - 10}
                  width={slot}
                  height={CHART.bottom - CHART.top + 30}
                  fill="transparent"
                  className="cursor-pointer"
                  onPointerEnter={() => setHoverIndex(index)}
                  onPointerDown={() => setHoverIndex(index)}
                />
              </g>
            );
          })}
        </svg>
        {hover && hoverIndex !== null && (
          <ChartTooltip percent={((CHART.left + slot * hoverIndex + slot / 2) / CHART.width) * 100}>
            <div className="font-bold">{formatDayLong(hover.date)}</div>
            <div>{hover.submitted} lượt nộp</div>
            <div className="text-bvc-muted">Điểm TB: {formatPercent(hover.averageAccuracy)}</div>
          </ChartTooltip>
        )}
      </div>
    </section>
  );
}
