import { ArrowUp, Lock } from "lucide-react";
import { ChartTooltip } from "@/features/practice/components/ChartTooltip";
import { useChartPointer } from "@/features/practice/hooks/useChartPointer";
import type { ClassRank } from "@/features/practice/types/practiceResultTypes";
import { parseCubicPath, yAtX } from "@/features/practice/utils/bezierPath";

const VIEW_WIDTH = 320;

const CHART = { left: 24, right: 310, top: 28, bottom: 105 };
const SCORE_TICKS = [0, 25, 50, 75, 100];
const BETTER_CLIP_ID = "rankBetterThanClip";

const xAt = (score: number) => CHART.left + (score / 100) * (CHART.right - CHART.left);

// Đường cong mượt qua các điểm (tiếp tuyến nằm ngang tại mỗi điểm)
function smoothPath(points: { x: number; y: number }[]) {
  return points.reduce((path, point, index) => {
    if (index === 0) return `M${point.x} ${point.y}`;
    const previous = points[index - 1];
    const middle = (previous.x + point.x) / 2;
    return `${path} C${middle} ${previous.y}, ${middle} ${point.y}, ${point.x} ${point.y}`;
  }, "");
}

interface ClassRankCardProps {
  rank: ClassRank;
}

// Vị trí tương đối trong lớp ở cùng bài tập: đường phân bố điểm tốt nhất của các bạn, đánh dấu điểm trung bình và điểm của bạn
export function ClassRankCard({ rank }: ClassRankCardProps) {
  const maxCount = Math.max(1, ...rank.distribution.map((bucket) => bucket.count));
  const yAt = (count: number) => CHART.bottom - (count / maxCount) * (CHART.bottom - CHART.top);
  const points = rank.distribution.map((bucket) => ({ x: xAt(bucket.score), y: yAt(bucket.count) }));
  const line = smoothPath(points);
  const area = `${line} L${CHART.right} ${CHART.bottom} L${CHART.left} ${CHART.bottom} Z`;
  const { x: pointerX, pointerProps } = useChartPointer(VIEW_WIDTH);
  const curveY = pointerX === null ? null : yAtX(parseCubicPath(line), pointerX);
  const hover =
    pointerX !== null && curveY !== null
      ? {
          x: pointerX,
          y: curveY,
          score: Math.round(((pointerX - CHART.left) / (CHART.right - CHART.left)) * 100),
          students: Math.max(0, Math.round(((CHART.bottom - curveY) / (CHART.bottom - CHART.top)) * maxCount)),
        }
      : null;
  const averageX = xAt(rank.classAverage);
  const myX = xAt(rank.myScore);

  return (
    <section className="flex flex-col gap-3 rounded-bvc-xl border border-bvc-border bg-white p-4 md:rounded-[22px] md:p-5.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-bvc-ink">Vị trí tương đối trong lớp</h2>
            <span className="rounded-full bg-bvc-soft px-2 py-0.5 text-[10px] font-bold text-bvc-ink">
              Top {rank.topPercent}%
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-bvc-muted">Ẩn danh · Cùng bài tập lớp {rank.className}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-bvc-surface px-2 py-0.5 text-[11px] font-semibold text-bvc-muted">
          <Lock className="size-3 text-bvc-faint" aria-hidden />
          Ẩn danh
        </span>
      </div>

      <div className="flex items-center gap-2.5 rounded-xl border border-bvc-border bg-bvc-soft p-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-bvc-ink text-white">
          <ArrowUp className="size-4" strokeWidth={2.5} aria-hidden />
        </span>
        <p className="text-[12px] leading-snug text-bvc-ink">
          Bạn đang tốt hơn <strong className="font-bold">{rank.betterThanPercent}%</strong> sinh viên trong lớp ở bài
          tập này.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-bvc-border bg-bvc-soft px-3 pt-3 pb-2.5">
        <div className="relative">
          <svg
            {...pointerProps}
            viewBox={`0 0 ${VIEW_WIDTH} 135`}
            fill="none"
            className="h-auto w-full cursor-crosshair overflow-visible"
            role="img"
            aria-label={`Phân bố điểm của lớp, điểm trung bình ${rank.classAverage}, điểm của bạn ${rank.myScore}; rê chuột hoặc chạm để xem giá trị`}
          >
            <defs>
              <clipPath id={BETTER_CLIP_ID}>
                <rect x={CHART.left} y="0" width={myX - CHART.left} height="140" />
              </clipPath>
            </defs>

            <path d={area} fill="var(--color-bvc-ink)" fillOpacity="0.06" />
            <path d={area} fill="var(--color-bvc-ink)" fillOpacity="0.22" clipPath={`url(#${BETTER_CLIP_ID})`} />
            <path
              d={line}
              stroke="var(--color-bvc-ink)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <line
              x1={averageX}
              y1={CHART.top - 6}
              x2={averageX}
              y2={CHART.bottom}
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <text x={averageX - 5} y={CHART.top - 2} fontSize="8.5" fill="#64748b" fontWeight="600" textAnchor="end">
              TB: {rank.classAverage}đ
            </text>

            <line
              x1={myX}
              y1={CHART.top - 6}
              x2={myX}
              y2={CHART.bottom}
              stroke="var(--color-bvc-ink)"
              strokeWidth="2"
            />
            <g transform={`translate(${myX - 29}, ${CHART.top - 24})`}>
              <rect width="58" height="16" rx="4" fill="var(--color-bvc-ink)" />
              <text x="29" y="11" fontSize="8.5" fill="#fff" fontWeight="700" textAnchor="middle">
                Bạn ({rank.myScore}đ)
              </text>
            </g>

            <line x1={CHART.left} y1={CHART.bottom} x2={CHART.right} y2={CHART.bottom} stroke="#cbd5e1" />
            {SCORE_TICKS.map((score) => (
              <g key={score}>
                <line x1={xAt(score)} y1={CHART.bottom} x2={xAt(score)} y2={CHART.bottom + 4} stroke="#94a3b8" />
                <text
                  x={xAt(score)}
                  y={CHART.bottom + 15}
                  fontSize="8"
                  fill="#94a3b8"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {score}
                </text>
              </g>
            ))}
            <text x={CHART.right} y={CHART.bottom + 28} fontSize="7.5" fill="#94a3b8" fontWeight="500" textAnchor="end">
              Điểm · vùng tô đậm là các bạn thấp điểm hơn bạn
            </text>
            {hover && (
              <g pointerEvents="none">
                <line
                  x1={hover.x}
                  y1={CHART.top - 6}
                  x2={hover.x}
                  y2={CHART.bottom}
                  stroke="var(--color-bvc-ink)"
                  strokeWidth="1"
                  strokeDasharray="3 2"
                />
                <circle cx={hover.x} cy={hover.y} r="3.5" fill="var(--color-bvc-ink)" stroke="#fff" strokeWidth="1.5" />
              </g>
            )}
          </svg>
          {hover && (
            <ChartTooltip percent={(hover.x / VIEW_WIDTH) * 100}>
              <div className="font-bold">Điểm {hover.score}</div>
              <div>≈ {hover.students} sinh viên</div>
            </ChartTooltip>
          )}
        </div>
      </div>

      <p className="border-t border-bvc-border pt-2 text-[11px] leading-normal text-bvc-faint">
        Dữ liệu tính trên điểm cao nhất của {rank.peerCount} sinh viên đã hoàn tất phân tích bài tập này trong lớp{" "}
        {rank.className}. Danh tính các sinh viên khác được ẩn danh hoàn toàn.
      </p>
    </section>
  );
}
