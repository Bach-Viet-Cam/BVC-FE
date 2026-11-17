import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { ChartFullscreen, useFullscreenChartHeight } from "@/features/practice/components/ChartFullscreen";
import { ChartTooltip } from "@/features/practice/components/ChartTooltip";
import { useChartPointer } from "@/features/practice/hooks/useChartPointer";
import type { StudentStatsAssignment } from "@/features/practice/types/studentStatsTypes";
import { baseAccuracyView, buildAccuracySeries } from "@/features/practice/utils/accuracyLines";
import type { AccuracyPoint, AccuracySeries } from "@/features/practice/utils/accuracyLines";
import { isZoomed, panView, zoomView } from "@/features/practice/utils/chartView";
import type { ChartView } from "@/features/practice/utils/chartView";
import { formatAttemptTime } from "@/features/practice/utils/resultFormat";
import { cn } from "@/shared/utils/cn";

const VIEW_WIDTH = 640;
const VIEW_WIDTH_FULLSCREEN = 1100;
const CHART_HEIGHT = 240;
const PAD = { left: 40, right: 14, top: 14, bottom: 30 };
const BUTTON_ZOOM = 1.6;
const WHEEL_ZOOM_PER_PIXEL = 0.0025;
const GRID_STEPS = 5;
const AXIS_TEXT = "var(--color-bvc-faint)";

interface AccuracyLinesChartProps {
  assignments: StudentStatsAssignment[];
  // null = tất cả bài
  selectedAssignmentId: string | null;
  onSelectAssignment: (assignmentId: string | null) => void;
  // Chỉ phía giảng viên: bấm một điểm để mở lần nộp đó
  onPointClick?: (submissionId: string) => void;
}

// Độ chính xác qua các lần nộp, mỗi bài một đường. Lọc về một bài, ẩn/hiện từng đường từ chú thích,
// Ctrl + cuộn hoặc nút để phóng to, kéo để di chuyển khi đã phóng, mở toàn màn hình.
export function AccuracyLinesChart({
  assignments,
  selectedAssignmentId,
  onSelectAssignment,
  onPointClick,
}: AccuracyLinesChartProps) {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [fullscreen, setFullscreen] = useState<{ view: ChartView } | null>(null);
  const allSeries = useMemo(() => buildAccuracySeries(assignments), [assignments]);
  const scoredIds = new Set(allSeries.map((series) => series.assignmentId));
  const filtered = selectedAssignmentId
    ? allSeries.filter((series) => series.assignmentId === selectedAssignmentId)
    : allSeries;
  const visible = filtered.filter((series) => !hiddenIds.has(series.assignmentId));

  const toggle = (assignmentId: string) =>
    setHiddenIds((current) => {
      const next = new Set(current);
      if (next.has(assignmentId)) next.delete(assignmentId);
      else next.add(assignmentId);
      return next;
    });

  const plot = (isFullscreen: boolean, initialView?: ChartView) => (
    <AccuracyPlot
      // Đổi bộ lọc thì khung nhìn về mặc định của các đường đang chọn
      key={`${selectedAssignmentId ?? "all"}:${isFullscreen}`}
      series={filtered}
      visible={visible}
      fullscreen={isFullscreen}
      initialView={initialView}
      onPointClick={onPointClick}
      onToggleFullscreen={(view) => (isFullscreen ? setFullscreen(null) : setFullscreen({ view }))}
    />
  );

  return (
    <section className="flex flex-col gap-3 rounded-bvc-xl border border-bvc-border bg-white p-4 md:p-5.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-bvc-ink">Độ chính xác qua các lần nộp</h2>
          <p className="mt-0.5 text-[11px] text-bvc-muted">Mỗi đường là một bài tập; trục ngang là lần nộp thứ mấy</p>
        </div>
        <select
          aria-label="Lọc theo bài tập"
          value={selectedAssignmentId ?? ""}
          onChange={(event) => onSelectAssignment(event.target.value || null)}
          className="h-9 max-w-full rounded-full border border-bvc-border-strong bg-white px-3 text-[13px] text-bvc-ink focus:outline-none"
        >
          <option value="">Tất cả bài</option>
          {assignments.map((assignment) => (
            <option key={assignment.id} value={assignment.id} disabled={!scoredIds.has(assignment.id)}>
              {scoredIds.has(assignment.id) ? assignment.title : `${assignment.title} (chưa có điểm)`}
            </option>
          ))}
        </select>
      </div>

      {plot(false)}

      <div className="flex flex-wrap gap-2" aria-label="Chú thích">
        {filtered.map((series) => {
          const isShown = !hiddenIds.has(series.assignmentId);
          return (
            <button
              key={series.assignmentId}
              type="button"
              aria-pressed={isShown}
              aria-label={`${isShown ? "Ẩn" : "Hiện"} đường ${series.title}`}
              onClick={() => toggle(series.assignmentId)}
              className={cn(
                "flex min-h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium",
                isShown ? "border-bvc-border-strong text-bvc-ink" : "border-bvc-border text-bvc-faint line-through"
              )}
            >
              <span
                className="h-0.5 w-3.5 rounded-full"
                style={{ backgroundColor: isShown ? series.color : "var(--color-bvc-bar)" }}
              />
              {series.title}
            </button>
          );
        })}
      </div>

      {fullscreen && (
        <ChartFullscreen onClose={() => setFullscreen(null)}>{plot(true, fullscreen.view)}</ChartFullscreen>
      )}
    </section>
  );
}

interface AccuracyPlotProps {
  series: AccuracySeries[];
  visible: AccuracySeries[];
  fullscreen: boolean;
  initialView?: ChartView;
  onPointClick?: (submissionId: string) => void;
  onToggleFullscreen: (view: ChartView) => void;
}

interface HoverPoint {
  series: AccuracySeries;
  point: AccuracyPoint;
  x: number;
}

function AccuracyPlot({ series, visible, fullscreen, initialView, onPointClick, onToggleFullscreen }: AccuracyPlotProps) {
  const width = fullscreen ? VIEW_WIDTH_FULLSCREEN : VIEW_WIDTH;
  const height = useFullscreenChartHeight(fullscreen, CHART_HEIGHT);
  const base = useMemo(() => baseAccuracyView(series), [series]);
  const [view, setView] = useState<ChartView>(initialView ?? base);
  const { x: pointerX, pointerProps } = useChartPointer(width);
  const drag = useRef<{ x: number; y: number; view: ChartView } | null>(null);
  const zoomed = isZoomed(view, base);

  const plotLeft = PAD.left;
  const plotRight = width - PAD.right;
  const plotTop = PAD.top;
  const plotBottom = height - PAD.bottom;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;
  const xAt = (attemptNo: number) => plotLeft + ((attemptNo - view.t0) / (view.t1 - view.t0)) * plotWidth;
  const yAt = (accuracy: number) => plotBottom - ((accuracy - view.m0) / (view.m1 - view.m0)) * plotHeight;

  // Ctrl + cuộn (hoặc chụm touchpad) phóng quanh con trỏ; cuộn thường vẫn cuộn trang
  useEffect(() => {
    const svg = pointerProps.ref.current;
    if (!svg) return;
    const listener = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const box = svg.getBoundingClientRect();
      const x = ((event.clientX - box.left) / box.width) * width;
      const y = ((event.clientY - box.top) / box.height) * height;
      setView((current) => {
        const anchor = {
          seconds: current.t0 + ((x - plotLeft) / plotWidth) * (current.t1 - current.t0),
          midi: current.m0 + ((plotBottom - y) / plotHeight) * (current.m1 - current.m0),
        };
        return zoomView(current, Math.exp(-event.deltaY * WHEEL_ZOOM_PER_PIXEL), anchor, base);
      });
    };
    svg.addEventListener("wheel", listener, { passive: false });
    return () => svg.removeEventListener("wheel", listener);
  }, [pointerProps.ref, width, height, base, plotLeft, plotWidth, plotBottom, plotHeight]);

  const zoomCenter = (factor: number) =>
    setView((current) =>
      zoomView(current, factor, { seconds: (current.t0 + current.t1) / 2, midi: (current.m0 + current.m1) / 2 }, base)
    );

  const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
    pointerProps.onPointerDown(event);
    if (!zoomed || event.button !== 0 || (event.target as Element).hasAttribute("data-point")) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, view };
  };
  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    pointerProps.onPointerMove(event);
    const start = drag.current;
    if (!start) return;
    const box = event.currentTarget.getBoundingClientRect();
    const scale = width / Math.max(1, box.width);
    const deltaAttempts = ((-(event.clientX - start.x) * scale) / plotWidth) * (start.view.t1 - start.view.t0);
    const deltaAccuracy = (((event.clientY - start.y) * scale) / plotHeight) * (start.view.m1 - start.view.m0);
    setView(panView(start.view, deltaAttempts, deltaAccuracy, base));
  };
  const endDrag = () => {
    drag.current = null;
  };

  const gridValues = Array.from(
    { length: GRID_STEPS },
    (_, index) => view.m0 + (index * (view.m1 - view.m0)) / (GRID_STEPS - 1)
  );
  const firstTick = Math.max(1, Math.ceil(view.t0));
  const lastTick = Math.floor(view.t1);
  const tickEvery = Math.max(1, Math.ceil((lastTick - firstTick + 1) / (fullscreen ? 20 : 10)));
  const ticks = Array.from({ length: Math.max(0, lastTick - firstTick + 1) }, (_, index) => firstTick + index).filter(
    (tick) => (tick - firstTick) % tickEvery === 0
  );

  // Lần nộp gần con trỏ nhất theo chiều ngang trong các đường đang hiện
  let hover: HoverPoint | null = null;
  if (pointerX !== null && pointerX >= plotLeft && pointerX <= plotRight) {
    for (const item of visible) {
      for (const point of item.points) {
        const x = xAt(point.attemptNo);
        if (x < plotLeft || x > plotRight) continue;
        if (!hover || Math.abs(x - pointerX) < Math.abs(hover.x - pointerX)) hover = { series: item, point, x };
      }
    }
  }
  const hoverSiblings = hover
    ? visible.flatMap((item) =>
        item.points.filter((point) => point.attemptNo === hover.point.attemptNo).map((point) => ({ item, point }))
      )
    : [];
  const clipId = `accuracy-clip-${fullscreen ? "full" : "card"}`;
  const isClickable = Boolean(onPointClick);

  return (
    <div className="rounded-xl border border-bvc-border bg-bvc-soft p-2.5 pt-3">
      <div className="relative">
        <svg
          {...pointerProps}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={{ touchAction: zoomed ? "none" : "pan-y" }}
          viewBox={`0 0 ${width} ${height}`}
          className={cn("block h-auto w-full", zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair")}
          role="img"
          aria-label="Độ chính xác của từng bài qua các lần nộp; rê chuột hoặc chạm để xem điểm, Ctrl + cuộn để phóng to"
        >
          <defs>
            <clipPath id={clipId}>
              <rect x={plotLeft - 8} y={plotTop - 8} width={plotWidth + 16} height={plotHeight + 16} />
            </clipPath>
          </defs>

          {gridValues.map((value) => (
            <g key={value}>
              <line x1={plotLeft} x2={plotRight} y1={yAt(value)} y2={yAt(value)} stroke="#dde5df" strokeWidth="1" />
              <text x={plotLeft - 6} y={yAt(value) + 4} fontSize="11" textAnchor="end" fill={AXIS_TEXT}>
                {Math.round(value)}%
              </text>
            </g>
          ))}
          {ticks.map((tick) => (
            <text key={tick} x={xAt(tick)} y={plotBottom + 18} fontSize="11" textAnchor="middle" fill={AXIS_TEXT}>
              Lần {tick}
            </text>
          ))}

          {hover && (
            <line
              x1={hover.x}
              x2={hover.x}
              y1={plotTop}
              y2={plotBottom}
              stroke="var(--color-bvc-bar-strong)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          <g clipPath={`url(#${clipId})`}>
            {visible.map((item) => (
              <g key={item.assignmentId} data-series={item.assignmentId}>
                <path
                  d={item.points
                    .map((point, index) => `${index === 0 ? "M" : "L"}${xAt(point.attemptNo)} ${yAt(point.accuracy)}`)
                    .join(" ")}
                  stroke={item.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                {item.points.map((point) => (
                  <g key={point.submissionId}>
                    {/* Vòng trắng 2px tách các điểm chồng nhau */}
                    <circle
                      cx={xAt(point.attemptNo)}
                      cy={yAt(point.accuracy)}
                      r="4"
                      fill={item.color}
                      stroke="white"
                      strokeWidth="2"
                    />
                    {/* Vùng bấm lớn hơn điểm vẽ */}
                    <circle
                      data-point={point.submissionId}
                      role={isClickable ? "button" : "presentation"}
                      aria-label={
                        isClickable ? `Mở ${item.title} lần ${point.attemptNo}, ${point.accuracy}%` : undefined
                      }
                      tabIndex={isClickable ? 0 : undefined}
                      cx={xAt(point.attemptNo)}
                      cy={yAt(point.accuracy)}
                      r="11"
                      fill="transparent"
                      className={isClickable ? "cursor-pointer" : undefined}
                      onClick={isClickable ? () => onPointClick?.(point.submissionId) : undefined}
                      onKeyDown={
                        isClickable
                          ? (event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                onPointClick?.(point.submissionId);
                              }
                            }
                          : undefined
                      }
                    />
                  </g>
                ))}
              </g>
            ))}
          </g>
        </svg>

        {hover && (
          <ChartTooltip percent={(hover.x / width) * 100}>
            <div className="font-semibold">
              Lần {hover.point.attemptNo} · {formatAttemptTime(hover.point.submittedAt)}
            </div>
            {hoverSiblings.map(({ item, point }) => (
              <div key={point.submissionId} className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.title}: <span className="font-semibold">{formatScore(point.accuracy)}</span>
              </div>
            ))}
            {isClickable && <div className="text-bvc-muted">Bấm vào điểm để mở lần nộp</div>}
          </ChartTooltip>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <p className="text-[11px] text-bvc-faint">
          Ctrl + cuộn chuột (hoặc nút bên phải) để phóng to; khi đã phóng, kéo để di chuyển.
        </p>
        <div className="flex items-center gap-1">
          {zoomed && (
            <ZoomButton label="Đặt lại khung nhìn" onClick={() => setView(base)}>
              <RotateCcw className="size-4" />
            </ZoomButton>
          )}
          <ZoomButton label="Thu nhỏ" disabled={!zoomed} onClick={() => zoomCenter(1 / BUTTON_ZOOM)}>
            <ZoomOut className="size-4" />
          </ZoomButton>
          <ZoomButton label="Phóng to" onClick={() => zoomCenter(BUTTON_ZOOM)}>
            <ZoomIn className="size-4" />
          </ZoomButton>
          <ZoomButton
            label={fullscreen ? "Thoát toàn màn hình" : "Xem toàn màn hình"}
            onClick={() => onToggleFullscreen(view)}
          >
            {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </ZoomButton>
        </div>
      </div>
    </div>
  );
}

function formatScore(accuracy: number): string {
  return `${Number.isInteger(accuracy) ? accuracy : Math.round(accuracy * 10) / 10}%`;
}

interface ZoomButtonProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function ZoomButton({ label, disabled = false, onClick, children }: ZoomButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-bvc-border bg-white text-bvc-ink hover:bg-bvc-surface disabled:cursor-not-allowed disabled:text-bvc-faint"
    >
      {children}
    </button>
  );
}
