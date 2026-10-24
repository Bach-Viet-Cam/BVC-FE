import { TrendingDown, TrendingUp } from "lucide-react";
import { ChartTooltip } from "@/features/practice/components/ChartTooltip";
import { useChartPointer } from "@/features/practice/hooks/useChartPointer";
import type { ResultHistory } from "@/features/practice/types/practiceResultTypes";
import { formatAttemptTime, growthLabel } from "@/features/practice/utils/resultFormat";
import { cn } from "@/shared/utils/cn";

const CHART = { width: 320, left: 32, right: 310, top: 15, bottom: 105, maxScore: 100 };
const GRID_LINES = 4;
const FIRST_X = 65;
const LAST_X = 265;

const xAt = (index: number, total: number) => FIRST_X + (index * (LAST_X - FIRST_X)) / Math.max(1, total - 1);
// Trục tung bắt đầu dưới điểm thấp nhất một chút (làm tròn xuống bội 10), tối đa từ 50 để đường không bị dẹt
const floorScore = (lowest: number) => Math.max(0, Math.min(50, Math.floor((lowest - 10) / 10) * 10));

interface ProgressHistoryCardProps {
  history: ResultHistory;
}

// Điểm của các lần nộp cùng bài (cùng bản nhạc, cùng bài tập), lần hiện tại nằm cuối
export function ProgressHistoryCard({ history }: ProgressHistoryCardProps) {
  const { x: pointerX, pointerProps } = useChartPointer(CHART.width);
  const minScore = floorScore(Math.min(...history.attempts.map((attempt) => attempt.accuracyPercent)));
  const yAt = (score: number) =>
    CHART.bottom - ((score - minScore) / (CHART.maxScore - minScore)) * (CHART.bottom - CHART.top);
  const gridScores = Array.from({ length: GRID_LINES }, (_, index) =>
    Math.round(CHART.maxScore - (index * (CHART.maxScore - minScore)) / (GRID_LINES - 1))
  );
  const points = history.attempts.map((attempt, index) => ({
    key: attempt.submissionId,
    label: attempt.isCurrent ? `Lần ${attempt.attemptNo} (Hiện tại)` : `Lần ${attempt.attemptNo}`,
    when: formatAttemptTime(attempt.submittedAt),
    score: attempt.accuracyPercent,
    isCurrent: attempt.isCurrent,
    x: xAt(index, history.attempts.length),
    y: yAt(attempt.accuracyPercent),
  }));
  const last = points[points.length - 1];
  const line = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");
  const area = `${line} L${last.x} ${CHART.bottom} L${points[0].x} ${CHART.bottom} Z`;
  // Chọn lần nộp gần con trỏ nhất (đường chỉ có điểm tại từng lần nộp)
  const hover =
    pointerX === null
      ? null
      : points.reduce((nearest, point) =>
          Math.abs(point.x - pointerX) < Math.abs(nearest.x - pointerX) ? point : nearest
        );
  const best = history.bestPercent;
  const isDecline = (history.deltaPercent ?? 0) < 0;

  return (
    <section className="flex flex-col gap-3 rounded-bvc-xl border border-bvc-border bg-white p-4 md:rounded-[22px] md:p-5.5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-bvc-ink">Tiến trình qua các lần nộp</h2>
          <p className="mt-0.5 text-[11px] text-bvc-muted">Cùng bài hát {history.pieceTitle}</p>
        </div>
        <span
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-full border bg-bvc-soft px-2 py-0.5 text-[11px] font-bold",
            isDecline ? "border-bvc-border text-bvc-muted" : "border-bvc-ok/20 text-bvc-ok"
          )}
        >
          {isDecline ? (
            <TrendingDown className="size-3" strokeWidth={2.5} aria-hidden />
          ) : (
            <TrendingUp className="size-3" strokeWidth={2.5} aria-hidden />
          )}
          {growthLabel(history)}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-bvc-border bg-bvc-soft px-3 pt-4 pb-2.5">
        <div className="relative">
          <svg
            {...pointerProps}
            viewBox={`0 0 ${CHART.width} 140`}
            fill="none"
            className="h-40 w-full cursor-crosshair overflow-visible"
            role="img"
            aria-label="Điểm qua các lần nộp; rê chuột hoặc chạm để xem từng lần"
          >
            <defs>
              <linearGradient id="progressArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-bvc-ink)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--color-bvc-ink)" stopOpacity="0.01" />
              </linearGradient>
            </defs>
            {gridScores.map((score) => (
              <g key={score}>
                <line
                  x1={CHART.left}
                  y1={yAt(score)}
                  x2={CHART.right}
                  y2={yAt(score)}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                />
                <text
                  x={CHART.left - 6}
                  y={yAt(score) + 3}
                  fontSize="8"
                  fill="#94a3b8"
                  fontWeight="600"
                  textAnchor="end"
                >
                  {score}%
                </text>
              </g>
            ))}
            <path d={area} fill="url(#progressArea)" />
            <path
              d={line}
              stroke="var(--color-bvc-ink)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {points.map((point) => {
              const { isCurrent } = point;
              return (
                <g key={point.key}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isCurrent ? 5.5 : 4}
                    fill={isCurrent ? "var(--color-bvc-ink)" : "#fff"}
                    stroke={isCurrent ? "#fff" : "var(--color-bvc-ok)"}
                    strokeWidth="2.5"
                  />
                  {!isCurrent && (
                    <text
                      x={point.x}
                      y={point.y - 10}
                      fontSize="9"
                      fill="var(--color-bvc-muted)"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {point.score}%
                    </text>
                  )}
                  <text
                    x={point.x}
                    y="119"
                    fontSize="9"
                    fill={isCurrent ? "var(--color-bvc-ink)" : "#475569"}
                    fontWeight={isCurrent ? 800 : 700}
                    textAnchor="middle"
                  >
                    {point.label}
                  </text>
                  <text x={point.x} y="130" fontSize="7.5" fill="#94a3b8" fontWeight="500" textAnchor="middle">
                    {point.when}
                  </text>
                </g>
              );
            })}
            <g transform={`translate(${last.x - 40}, ${last.y - 32})`}>
              <rect width="80" height="18" rx="9" fill="var(--color-bvc-ink)" />
              <text x="40" y="12" fontSize="8.5" fill="#fff" fontWeight="700" textAnchor="middle">
                {best}% · Cao nhất
              </text>
            </g>
            <line x1={CHART.left} y1={CHART.bottom} x2={CHART.right} y2={CHART.bottom} stroke="#cbd5e1" />
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
                <circle cx={hover.x} cy={hover.y} r="7" fill="none" stroke="var(--color-bvc-ink)" strokeWidth="1.5" />
              </g>
            )}
          </svg>
          {hover && (
            <ChartTooltip percent={(hover.x / CHART.width) * 100}>
              <div className="font-bold">{hover.label}</div>
              <div className="text-bvc-muted">{hover.when}</div>
              <div>Điểm: {hover.score}%</div>
            </ChartTooltip>
          )}
        </div>
      </div>

      <p className="text-[11px] leading-normal text-bvc-faint">
        Tính các lần nộp đã phân tích xong của cùng bản nhạc
        {history.attempts.length > 1 ? `, ${history.attempts.length} lần gần nhất` : ""}.
      </p>
    </section>
  );
}
