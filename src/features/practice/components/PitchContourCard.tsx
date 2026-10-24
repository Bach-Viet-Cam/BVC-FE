import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { ChartTooltip } from "@/features/practice/components/ChartTooltip";
import { MSG } from "@/features/practice/constants/practiceConstants";
import { useChartPointer } from "@/features/practice/hooks/useChartPointer";
import { useElementWidth } from "@/features/practice/hooks/useElementWidth";
import type { PitchChart, PitchPoint, PitchSegment } from "@/features/practice/types/practiceResultTypes";
import type { ChartView } from "@/features/practice/utils/chartView";
import { clampView, formatTick, isZoomed, panView, zoomView } from "@/features/practice/utils/chartView";
import { hzToMidiFloat, midiToNoteInfo } from "@/features/practice/utils/noteMath";
import { fmtTime, signed } from "@/features/practice/utils/practiceFormat";
import {
  buildLinePath,
  dropShortRuns,
  nearestPoint,
  robustHzRange,
  smoothRuns,
} from "@/features/practice/utils/resultFormat";
import { cn } from "@/shared/utils/cn";

// Biểu đồ vẽ theo đúng số px của khung (không co giãn viewBox) để chữ luôn cùng cỡ trên mọi màn hình;
// khung có chiều cao cố định, bề ngang tối đa theo trang
const LEFT = 64;
const RIGHT = 10;
const CHART_HEIGHT = 380;
// Khung cao độ: hàng nhãn vùng lỗi ở trên, đường cao độ bên dưới để nhãn không đè lên đường
const ZONE_TOP = 4;
const CHIP_ROWS = [6, 25];
const CHIP_HEIGHT = 16;
const PITCH_TOP = 50;
const PITCH_BOTTOM = 342;
const TICK_TOP = 348;
const TICK_LABEL_Y = 366;

const AXIS_TICK_SPACING = 110;
const NATURAL_PITCH_CLASSES = new Set([0, 2, 4, 5, 7, 9, 11]);
// Lưới trục tung theo khoảng cách px của một nửa cung: đủ chỗ thì ghi tên mọi nốt (kể cả nốt thăng),
// phóng to hơn thì thêm vạch 50, 25 rồi 10 cent để đo được hai đường lệch nhau bao nhiêu
const LABEL_EVERY_SEMITONE_PX = 14;
const CENT_GRID_STEPS = [
  { minSemitonePx: 400, step: 0.1 },
  { minSemitonePx: 64, step: 0.25 },
  { minSemitonePx: 30, step: 0.5 },
];
const MIN_SUB_LABEL_GAP_PX = 13;
const STUDENT_COLOR = "#dc2626";
const AXIS_TEXT = "#94a3b8";
const SEGMENT_STYLE = {
  pitch: { fill: "#fee2e2", stroke: "#ef4444", chip: "#ef4444", tick: "#dc2626" },
  rhythm: { fill: "#ffedd5", stroke: "#f97316", chip: "#ea580c", tick: "#ea580c" },
};
// Nhãn vùng lỗi rộng theo chữ (khoảng 6,2 px mỗi ký tự cỡ 10px đậm), xếp tối đa 2 hàng để không đè nhau
const CHIP_CHAR_WIDTH = 6.2;
const CHIP_GAP = 3;
// Mốc trục hoành gần nhau hơn khoảng này thì bỏ bớt để chữ không chồng
const MIN_TICK_GAP = 48;
// Đoạn cao độ ngắn hơn 3 điểm (khoảng 0,2 giây) coi là tạp âm khi vẽ; trục tung ban đầu bỏ 4% điểm lạc mỗi đầu
// (pyin bắt nhầm quãng tám) để khoảng nốt thật được giãn ra; kéo lên / xuống vẫn xem được phần bị cắt
const MIN_VOICED_RUN = 3;
const RANGE_TRIM_RATIO = 0.04;
// Làm mượt nhẹ (Gauss khoảng 1 điểm) để đường bám sát dữ liệu; độ mềm chủ yếu đến từ spline đơn điệu
const SMOOTH_POINTS_PER_SIGMA = 600;
const MIN_SMOOTH_SIGMA = 1;
// Mỗi lần bấm phóng to / thu nhỏ; Ctrl + cuộn chuột (hoặc chụm hai ngón trên touchpad) phóng mịn hơn
const BUTTON_ZOOM = 1.6;
const WHEEL_ZOOM_PER_PIXEL = 0.002;
const PLOT_CLIP_ID = "pitchContourPlot";

type SeriesMode = "both" | "teacher" | "student";
const SERIES_OPTIONS: { value: SeriesMode; label: string }[] = [
  { value: "both", label: "Cả hai" },
  { value: "teacher", label: "Bản mẫu GV" },
  { value: "student", label: "Bản thu" },
];

interface Frame {
  xStart: number;
  xEnd: number;
}

interface SegmentChip {
  segment: PitchSegment;
  x: number;
  y: number;
  width: number;
  text: string;
}

interface GridLine {
  midi: number;
  isNote: boolean;
  isNatural: boolean;
  label: string | null;
}

// Nhãn ngắn trên vùng lỗi: cao độ giữ số cent ("+24¢"), nhịp giữ ý chính ("Nhanh", "Chậm", "Thiếu nốt")
function chipText(segment: PitchSegment): string {
  if (segment.kind === "pitch") return segment.label.replace(/^Lệch\s*/, "");
  return segment.label.startsWith("Thiếu") ? "Thiếu nốt" : segment.label.split(" ")[0];
}

function layoutChips(segments: PitchSegment[], xAt: (seconds: number) => number, frame: Frame): SegmentChip[] {
  const rowEnds = CHIP_ROWS.map(() => -Infinity);
  const chips: SegmentChip[] = [];
  const visible = segments.filter(
    (segment) => xAt(segment.endSec) > frame.xStart && xAt(segment.startSec) < frame.xEnd
  );
  for (const segment of [...visible].sort((first, second) => first.startSec - second.startSec)) {
    const text = chipText(segment);
    const width = text.length * CHIP_CHAR_WIDTH + 12;
    const left = Math.max(frame.xStart, xAt(segment.startSec));
    const right = Math.min(frame.xEnd, xAt(segment.endSec));
    const x = Math.min(frame.xEnd - width, Math.max(frame.xStart, (left + right) / 2 - width / 2));
    const row = rowEnds.findIndex((end) => x >= end + CHIP_GAP);
    if (row < 0) continue;
    rowEnds[row] = x + width;
    chips.push({ segment, x, y: CHIP_ROWS[row], width, text });
  }
  return chips;
}

// Mốc thời gian đều nhau trong khung đang xem, cộng mốc tô màu ở đầu mỗi vùng lỗi; mốc vùng lỗi được ưu tiên giữ
function axisTicks(view: ChartView, segments: PitchSegment[], xAt: (seconds: number) => number, frame: Frame) {
  const zoneTicks: { seconds: number; color: string }[] = [];
  const visible = segments.filter((segment) => segment.startSec >= view.t0 && segment.startSec <= view.t1);
  for (const segment of [...visible].sort((first, second) => first.startSec - second.startSec)) {
    const last = zoneTicks[zoneTicks.length - 1];
    if (last && xAt(segment.startSec) - xAt(last.seconds) < MIN_TICK_GAP) continue;
    zoneTicks.push({ seconds: segment.startSec, color: SEGMENT_STYLE[segment.kind].tick });
  }
  const count = Math.max(2, Math.floor((frame.xEnd - frame.xStart) / AXIS_TICK_SPACING) + 1);
  const span = view.t1 - view.t0;
  const evenTicks = Array.from({ length: count }, (_, index) => view.t0 + (index * span) / (count - 1))
    .filter((seconds) => zoneTicks.every((tick) => Math.abs(xAt(tick.seconds) - xAt(seconds)) >= MIN_TICK_GAP))
    .map((seconds) => ({ seconds, color: "#64748b" }));
  return [...evenTicks, ...zoneTicks];
}

function noteName(midi: number): string {
  return `${midiToNoteInfo(midi).vn}${Math.floor(midi / 12) - 1}`;
}

function noteLabel(hz: number): string {
  return noteName(Math.round(hzToMidiFloat(hz)));
}

// Vạch cho mọi nửa cung trong khung, cộng vạch cent khi đủ chỗ
function noteGrid(minMidi: number, maxMidi: number, semitonePx: number): GridLine[] {
  const step = CENT_GRID_STEPS.find((level) => semitonePx >= level.minSemitonePx)?.step ?? 1;
  const labelAll = semitonePx >= LABEL_EVERY_SEMITONE_PX;
  const labelSub = step * semitonePx >= MIN_SUB_LABEL_GAP_PX;
  const lines: GridLine[] = [];
  const first = Math.ceil(minMidi / step - 1e-9);
  for (let index = first; index * step <= maxMidi + 1e-9; index += 1) {
    const midi = Math.round(index * step * 100) / 100;
    if (Number.isInteger(midi)) {
      const isNatural = NATURAL_PITCH_CLASSES.has(((midi % 12) + 12) % 12);
      lines.push({ midi, isNote: true, isNatural, label: labelAll || isNatural ? noteName(midi) : null });
      continue;
    }
    // Ghi theo nốt gần nhất ("Rê5 −25¢"); đúng giữa hai nốt thì tính từ nốt dưới ("Đô#5 +50¢")
    const fraction = Math.round((midi - Math.floor(midi)) * 100);
    const nearest = fraction <= 50 ? Math.floor(midi) : Math.ceil(midi);
    const cents = Math.round((midi - nearest) * 100);
    lines.push({
      midi,
      isNote: false,
      isNatural: false,
      label: labelSub ? `${noteName(nearest)} ${cents > 0 ? "+" : "−"}${Math.abs(cents)}¢` : null,
    });
  }
  return lines;
}

interface PitchContourCardProps {
  chart: PitchChart | null;
  loading: boolean;
  error: string;
}

// So sánh đường cao độ bản thu với bản mẫu GV; trục ngang là thời gian của bản mẫu.
// Có thể chỉ xem một đường, phóng to theo thời gian và cao độ để thấy rõ hai đường lệch nhau bao nhiêu.
export function PitchContourCard({ chart, loading, error }: PitchContourCardProps) {
  const [mode, setMode] = useState<SeriesMode>("both");

  return (
    <section className="flex flex-col gap-3 rounded-bvc-xl border border-bvc-border bg-white p-4 md:rounded-[22px] md:p-5.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-bvc-ink">So sánh cao độ &amp; nhịp (Pitch Contour)</h2>
          <p className="mt-0.5 text-[11px] text-bvc-muted">Đường cao độ bản thu so với bản mẫu theo thời gian</p>
        </div>
        <div role="radiogroup" aria-label="Đường hiển thị" className="flex rounded-full bg-bvc-surface p-0.5">
          {SERIES_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={mode === option.value}
              onClick={() => setMode(option.value)}
              className={cn(
                "min-h-8 cursor-pointer rounded-full px-3 text-xs font-semibold whitespace-nowrap",
                mode === option.value ? "bg-bvc-ink text-white" : "text-bvc-muted hover:text-bvc-ink"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="h-105 animate-pulse rounded-xl bg-bvc-surface" aria-label="Đang tải biểu đồ cao độ" />
      )}
      {!loading && (error || !chart) && (
        <p className="rounded-xl border border-bvc-border bg-bvc-soft p-4 text-center text-[13px] text-bvc-muted">
          {error || MSG.pitchUnavailable}
        </p>
      )}
      {!loading && !error && chart && <PitchContourChart chart={chart} mode={mode} />}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-medium text-bvc-muted">
        {mode !== "student" && (
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-3.5 rounded-full bg-bvc-ink" />
            Bản mẫu GV
          </span>
        )}
        {mode !== "teacher" && (
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-3.5 rounded-full bg-[#dc2626]" />
            Bản thu Sinh viên
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px] border border-red-500 bg-red-100" />
          Lệch cao độ
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px] border border-orange-500 bg-orange-100" />
          Lệch nhịp
        </span>
      </div>
    </section>
  );
}

function PitchContourChart({ chart, mode }: { chart: PitchChart; mode: SeriesMode }) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  return (
    <div className="overflow-hidden rounded-xl border border-bvc-border bg-bvc-soft p-2.5 pt-3">
      <div ref={ref} className="relative" style={{ height: CHART_HEIGHT + 40 }}>
        {width > LEFT + RIGHT && <PitchContourPlot chart={chart} width={width} mode={mode} />}
      </div>
    </div>
  );
}

interface PreparedChart {
  shown: PitchPoint[];
  base: ChartView;
  bounds: ChartView;
}

// Làm sạch + làm mượt để vẽ, và tính khung xem ban đầu (base) cùng giới hạn được kéo tới (bounds)
function prepareChart(chart: PitchChart): PreparedChart {
  const sigma = Math.max(MIN_SMOOTH_SIGMA, chart.points.length / SMOOTH_POINTS_PER_SIGMA);
  const cleaned = dropShortRuns(dropShortRuns(chart.points, 1, MIN_VOICED_RUN), 2, MIN_VOICED_RUN);
  const shown = smoothRuns(smoothRuns(cleaned, 1, sigma), 2, sigma);
  const range = robustHzRange(shown, RANGE_TRIM_RATIO) ?? { minHz: chart.minHz, maxHz: chart.maxHz };
  const full = robustHzRange(shown, 0) ?? range;
  const duration = Math.max(chart.durationSec, 0.01);
  const base = { t0: 0, t1: duration, m0: hzToMidiFloat(range.minHz), m1: hzToMidiFloat(range.maxHz) };
  const bounds = { t0: 0, t1: duration, m0: hzToMidiFloat(full.minHz), m1: hzToMidiFloat(full.maxHz) };
  return { shown, base, bounds };
}

function PitchContourPlot({ chart, width, mode }: { chart: PitchChart; width: number; mode: SeriesMode }) {
  const { x: pointerX, pointerProps } = useChartPointer(width);
  const frame: Frame = { xStart: LEFT, xEnd: width - RIGHT };
  const { shown, base, bounds } = useMemo(() => prepareChart(chart), [chart]);
  const [view, setView] = useState<ChartView>(base);
  const drag = useRef<{ x: number; y: number; view: ChartView } | null>(null);
  const zoomed = isZoomed(view, base);

  const plotWidth = frame.xEnd - frame.xStart;
  const plotHeight = PITCH_BOTTOM - PITCH_TOP;
  const xAt = (seconds: number) => frame.xStart + ((seconds - view.t0) / (view.t1 - view.t0)) * plotWidth;
  const secondsAt = (x: number) => view.t0 + ((x - frame.xStart) / plotWidth) * (view.t1 - view.t0);
  const yAtMidi = (midi: number) => PITCH_BOTTOM - ((midi - view.m0) / (view.m1 - view.m0)) * plotHeight;
  const midiAt = (y: number) => view.m0 + ((PITCH_BOTTOM - y) / plotHeight) * (view.m1 - view.m0);
  const yAt = (hz: number) => yAtMidi(hzToMidiFloat(hz));

  // Ctrl + cuộn (hoặc chụm touchpad) phóng quanh con trỏ; cuộn thường vẫn cuộn trang
  const wheelZoom = useRef<(event: WheelEvent) => void>(() => undefined);
  wheelZoom.current = (event: WheelEvent) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const box = (event.currentTarget as SVGSVGElement).getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * width;
    const y = event.clientY - box.top;
    const anchor = { seconds: secondsAt(x), midi: midiAt(Math.min(PITCH_BOTTOM, Math.max(PITCH_TOP, y))) };
    setView((current) => zoomView(current, Math.exp(-event.deltaY * WHEEL_ZOOM_PER_PIXEL), anchor, bounds));
  };
  useEffect(() => {
    const svg = pointerProps.ref.current;
    if (!svg) return;
    const listener = (event: WheelEvent) => wheelZoom.current(event);
    svg.addEventListener("wheel", listener, { passive: false });
    return () => svg.removeEventListener("wheel", listener);
  }, [pointerProps.ref]);

  const zoomCenter = (factor: number) =>
    setView((current) =>
      zoomView(current, factor, { seconds: (current.t0 + current.t1) / 2, midi: (current.m0 + current.m1) / 2 }, bounds)
    );

  const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
    pointerProps.onPointerDown(event);
    if (!zoomed || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, view };
  };
  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    pointerProps.onPointerMove(event);
    const start = drag.current;
    if (!start) return;
    const box = event.currentTarget.getBoundingClientRect();
    const deltaSeconds =
      (-(event.clientX - start.x) / (box.width * (plotWidth / width))) * (start.view.t1 - start.view.t0);
    const deltaMidi = ((event.clientY - start.y) / plotHeight) * (start.view.m1 - start.view.m0);
    setView(panView(start.view, deltaSeconds, deltaMidi, bounds));
  };
  const endDrag = () => {
    drag.current = null;
  };

  const semitonePx = plotHeight / (view.m1 - view.m0);
  const gridLines = noteGrid(view.m0, view.m1, semitonePx);
  const teacherPath = mode === "student" ? "" : buildLinePath(shown, 1, xAt, yAt);
  const studentPath = mode === "teacher" ? "" : buildLinePath(shown, 2, xAt, yAt);
  const ticks = axisTicks(view, chart.segments, xAt, frame);
  const chips = layoutChips(chart.segments, xAt, frame);

  const hoverPoint =
    pointerX !== null && pointerX >= frame.xStart && pointerX <= frame.xEnd
      ? nearestPoint(chart.points, secondsAt(pointerX))
      : null;
  const hoverIndex = hoverPoint ? chart.points.indexOf(hoverPoint) : -1;
  const hover =
    hoverPoint && hoverIndex >= 0
      ? {
          seconds: hoverPoint[0],
          teacherHz: mode === "student" ? null : hoverPoint[1],
          studentHz: mode === "teacher" ? null : hoverPoint[2],
          x: xAt(hoverPoint[0]),
          // Chấm nằm trên đường đã làm mượt; chữ trong tooltip vẫn là giá trị thật
          drawnTeacher: mode === "student" ? null : shown[hoverIndex][1],
          drawnStudent: mode === "teacher" ? null : shown[hoverIndex][2],
        }
      : null;
  const hoverSegment = hover
    ? chart.segments.find((segment) => hover.seconds >= segment.startSec && hover.seconds <= segment.endSec)
    : undefined;
  const isSingle = mode !== "both";

  return (
    <>
      <svg
        {...pointerProps}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{ touchAction: zoomed ? "none" : "pan-y" }}
        width={width}
        height={CHART_HEIGHT}
        viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
        fill="none"
        className={cn("block overflow-visible", zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair")}
        role="img"
        aria-label="So sánh cao độ bản thu với bản mẫu theo thời gian; rê chuột hoặc chạm để xem giá trị, Ctrl + cuộn để phóng to"
      >
        <defs>
          <clipPath id={PLOT_CLIP_ID}>
            <rect x={frame.xStart} y={ZONE_TOP} width={plotWidth} height={PITCH_BOTTOM - ZONE_TOP + 4} />
          </clipPath>
        </defs>

        <g clipPath={`url(#${PLOT_CLIP_ID})`}>
          {chart.segments.map((segment) => (
            <SegmentZone key={segment.id} segment={segment} xAt={xAt} />
          ))}
        </g>

        {gridLines.map((line) => (
          <g key={line.midi}>
            <line
              x1={frame.xStart - 4}
              y1={yAtMidi(line.midi)}
              x2={frame.xEnd}
              y2={yAtMidi(line.midi)}
              stroke={line.isNote ? (line.isNatural ? "#cfd8d2" : "#e1e7e3") : "#dde5df"}
              strokeWidth="1"
              strokeDasharray={line.isNote ? (line.isNatural ? undefined : "4 3") : "1 3"}
            />
            {line.label && (
              <text
                x="2"
                y={yAtMidi(line.midi) + 4}
                fontSize={line.isNote ? (line.isNatural ? 11 : 10) : 9}
                fill={line.isNatural ? "#64748b" : AXIS_TEXT}
                fontWeight={line.isNatural ? 700 : 500}
              >
                {line.label}
              </text>
            )}
          </g>
        ))}

        {/* Hai đường: GV dày ở dưới, sinh viên mảnh ở trên để chỗ trùng nhau vẫn thấy viền tối của GV.
            Xem riêng một đường thì vẽ đậm vừa phải. */}
        <g clipPath={`url(#${PLOT_CLIP_ID})`}>
          <path
            d={teacherPath}
            stroke="var(--color-bvc-ink)"
            strokeWidth={isSingle ? 2.2 : 3.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={studentPath}
            stroke={STUDENT_COLOR}
            strokeWidth={isSingle ? 2.2 : 1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {chips.map((chip) => (
          <g key={chip.segment.id} transform={`translate(${chip.x}, ${chip.y})`}>
            <rect width={chip.width} height={CHIP_HEIGHT} rx="4" fill={SEGMENT_STYLE[chip.segment.kind].chip} />
            <text x={chip.width / 2} y="11.5" fontSize="10" fill="#fff" fontWeight="700" textAnchor="middle">
              {chip.text}
            </text>
          </g>
        ))}

        {ticks.map((tick) => (
          <g key={`${tick.seconds}-${tick.color}`}>
            <line
              x1={xAt(tick.seconds)}
              y1={TICK_TOP}
              x2={xAt(tick.seconds)}
              y2={TICK_TOP + 5}
              stroke={tick.color}
              strokeWidth="1"
            />
            <text
              x={xAt(tick.seconds)}
              y={TICK_LABEL_Y}
              fontSize="11"
              fill={tick.color}
              fontWeight="700"
              textAnchor="middle"
            >
              {formatTick(tick.seconds, view.t1 - view.t0)}
            </text>
          </g>
        ))}

        {hover && (
          <g pointerEvents="none">
            <line
              x1={hover.x}
              y1={ZONE_TOP}
              x2={hover.x}
              y2={PITCH_BOTTOM}
              stroke="var(--color-bvc-ink)"
              strokeWidth="1"
              strokeDasharray="3 2"
            />
            {hover.drawnTeacher !== null && (
              <circle
                cx={hover.x}
                cy={yAt(hover.drawnTeacher)}
                r="4"
                fill="var(--color-bvc-ink)"
                stroke="#fff"
                strokeWidth="1.5"
              />
            )}
            {hover.drawnStudent !== null && (
              <circle
                cx={hover.x}
                cy={yAt(hover.drawnStudent)}
                r="4"
                fill={STUDENT_COLOR}
                stroke="#fff"
                strokeWidth="1.5"
              />
            )}
          </g>
        )}
      </svg>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <p className="text-[11px] text-bvc-faint">
          Ctrl + cuộn chuột (hoặc nút bên phải) để phóng to theo thời gian và cao độ; khi đã phóng, kéo để di chuyển.
        </p>
        <div className="flex items-center gap-1">
          <ZoomButton label="Thu nhỏ" disabled={!zoomed} onClick={() => zoomCenter(1 / BUTTON_ZOOM)}>
            <ZoomOut className="size-4" />
          </ZoomButton>
          <ZoomButton label="Phóng to" onClick={() => zoomCenter(BUTTON_ZOOM)}>
            <ZoomIn className="size-4" />
          </ZoomButton>
          <ZoomButton label="Xem toàn bộ" disabled={!zoomed} onClick={() => setView(clampView(base, bounds))}>
            <Maximize2 className="size-4" />
          </ZoomButton>
        </div>
      </div>

      {hover && (
        <ChartTooltip percent={(hover.x / width) * 100}>
          <div className="font-bold">{fmtTime(hover.seconds)}</div>
          {mode !== "student" && (
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-bvc-ink" />
              Mẫu GV:{" "}
              {hover.teacherHz === null ? "lặng" : `${hover.teacherHz.toFixed(1)} Hz (${noteLabel(hover.teacherHz)})`}
            </div>
          )}
          {mode !== "teacher" && (
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#dc2626]" />
              Sinh viên:{" "}
              {hover.studentHz === null ? "lặng" : `${hover.studentHz.toFixed(1)} Hz (${noteLabel(hover.studentHz)})`}
            </div>
          )}
          {hover.teacherHz !== null && hover.studentHz !== null && (
            <div className="text-bvc-muted">
              Lệch {signed(1200 * Math.log2(hover.studentHz / hover.teacherHz))}¢ so với bản mẫu
            </div>
          )}
          {hoverSegment && <div className="font-semibold">{hoverSegment.label}</div>}
        </ChartTooltip>
      )}
    </>
  );
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

function SegmentZone({ segment, xAt }: { segment: PitchSegment; xAt: (seconds: number) => number }) {
  const style = SEGMENT_STYLE[segment.kind];
  const x = xAt(segment.startSec);
  const width = Math.max(4, xAt(segment.endSec) - x);
  return (
    <rect
      x={x}
      y={ZONE_TOP}
      width={width}
      height={PITCH_BOTTOM - ZONE_TOP}
      rx="4"
      fill={style.fill}
      stroke={style.stroke}
      strokeWidth="1.2"
      strokeDasharray="4 3"
    />
  );
}
