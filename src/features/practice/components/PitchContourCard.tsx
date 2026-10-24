import { ChartTooltip } from "@/features/practice/components/ChartTooltip";
import { MSG } from "@/features/practice/constants/practiceConstants";
import { useChartPointer } from "@/features/practice/hooks/useChartPointer";
import { useElementWidth } from "@/features/practice/hooks/useElementWidth";
import type { PitchChart, PitchSegment } from "@/features/practice/types/practiceResultTypes";
import { hzToMidiFloat, midiToNoteInfo } from "@/features/practice/utils/noteMath";
import { fmtTime, signed } from "@/features/practice/utils/practiceFormat";
import {
  buildLinePath,
  dropShortRuns,
  nearestPoint,
  robustHzRange,
  smoothRuns,
} from "@/features/practice/utils/resultFormat";

// Biểu đồ vẽ theo đúng số px của khung (không co giãn viewBox) để chữ luôn cùng cỡ trên mọi màn hình
const LEFT = 42;
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
// rộng hơn nữa thì thêm vạch 50 cent và 25 cent để thấy rõ hai đường lệch nhau bao nhiêu
const LABEL_EVERY_SEMITONE_PX = 14;
const HALF_SEMITONE_LINE_PX = 30;
const QUARTER_SEMITONE_LINE_PX = 64;
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
const MIN_TICK_GAP = 40;
// Đoạn cao độ ngắn hơn 3 điểm (khoảng 0,2 giây) coi là tạp âm khi vẽ; trục tung bỏ 4% điểm lạc mỗi đầu
// (pyin bắt nhầm quãng tám) để khoảng nốt thật được giãn ra, phần lạc bị cắt ở mép khung
const MIN_VOICED_RUN = 3;
const RANGE_TRIM_RATIO = 0.04;
// Làm mượt nhẹ (Gauss khoảng 1 điểm) để đường bám sát dữ liệu; độ mềm chủ yếu đến từ spline đơn điệu
const SMOOTH_POINTS_PER_SIGMA = 600;
const MIN_SMOOTH_SIGMA = 1;
const PITCH_CLIP_ID = "pitchContourPlot";

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

// Nhãn ngắn trên vùng lỗi: cao độ giữ số cent ("+24¢"), nhịp giữ ý chính ("Nhanh", "Chậm", "Thiếu nốt")
function chipText(segment: PitchSegment): string {
  if (segment.kind === "pitch") return segment.label.replace(/^Lệch\s*/, "");
  return segment.label.startsWith("Thiếu") ? "Thiếu nốt" : segment.label.split(" ")[0];
}

function layoutChips(segments: PitchSegment[], xAt: (seconds: number) => number, frame: Frame): SegmentChip[] {
  const rowEnds = CHIP_ROWS.map(() => -Infinity);
  const chips: SegmentChip[] = [];
  const ordered = [...segments].sort((first, second) => first.startSec - second.startSec);
  for (const segment of ordered) {
    const text = chipText(segment);
    const width = text.length * CHIP_CHAR_WIDTH + 12;
    const center = (xAt(segment.startSec) + xAt(segment.endSec)) / 2;
    const x = Math.min(frame.xEnd - width, Math.max(frame.xStart, center - width / 2));
    const row = rowEnds.findIndex((end) => x >= end + CHIP_GAP);
    if (row < 0) continue;
    rowEnds[row] = x + width;
    chips.push({ segment, x, y: CHIP_ROWS[row], width, text });
  }
  return chips;
}

// Mốc thời gian đều nhau theo bề rộng, cộng mốc tô màu ở đầu mỗi vùng lỗi như thiết kế; mốc vùng lỗi được ưu tiên giữ
function axisTicks(duration: number, segments: PitchSegment[], xAt: (seconds: number) => number, frame: Frame) {
  const zoneTicks: { seconds: number; color: string }[] = [];
  for (const segment of [...segments].sort((first, second) => first.startSec - second.startSec)) {
    const last = zoneTicks.at(-1);
    if (last && xAt(segment.startSec) - xAt(last.seconds) < MIN_TICK_GAP) continue;
    zoneTicks.push({ seconds: segment.startSec, color: SEGMENT_STYLE[segment.kind].tick });
  }
  const count = Math.max(2, Math.floor((frame.xEnd - frame.xStart) / AXIS_TICK_SPACING) + 1);
  const evenTicks = Array.from({ length: count }, (_, index) => (index * duration) / (count - 1))
    .filter((seconds) => zoneTicks.every((tick) => Math.abs(xAt(tick.seconds) - xAt(seconds)) >= MIN_TICK_GAP))
    .map((seconds) => ({ seconds, color: "#64748b" }));
  return [...evenTicks, ...zoneTicks];
}

interface PitchContourCardProps {
  chart: PitchChart | null;
  loading: boolean;
  error: string;
}

function noteLabel(hz: number): string {
  const midi = Math.round(hzToMidiFloat(hz));
  return `${midiToNoteInfo(midi).vn}${Math.floor(midi / 12) - 1}`;
}

interface GridLine {
  midi: number;
  // note: vạch nốt (có nhãn), half / quarter: vạch 50 / 25 cent giữa hai nốt
  kind: "note" | "half" | "quarter";
  label: string | null;
  isNatural: boolean;
}

// Vạch cho mọi nửa cung trong khoảng; nhãn và vạch phụ chỉ thêm khi đủ chỗ theo semitonePx
function noteGrid(minMidi: number, maxMidi: number, semitonePx: number): GridLine[] {
  const lines: GridLine[] = [];
  const labelAll = semitonePx >= LABEL_EVERY_SEMITONE_PX;
  const step = semitonePx >= QUARTER_SEMITONE_LINE_PX ? 0.25 : semitonePx >= HALF_SEMITONE_LINE_PX ? 0.5 : 1;
  for (let midi = Math.ceil(minMidi / step) * step; midi <= maxMidi; midi += step) {
    if (!Number.isInteger(midi)) {
      lines.push({ midi, kind: Number.isInteger(midi * 2) ? "half" : "quarter", label: null, isNatural: false });
      continue;
    }
    const isNatural = NATURAL_PITCH_CLASSES.has(((midi % 12) + 12) % 12);
    const label = labelAll || isNatural ? `${midiToNoteInfo(midi).vn}${Math.floor(midi / 12) - 1}` : null;
    lines.push({ midi, kind: "note", label, isNatural });
  }
  return lines;
}

// So sánh đường cao độ bản thu với bản mẫu GV; trục ngang là thời gian của bản mẫu.
// Trục tung chia theo từng nửa cung (và 50 / 25 cent khi đủ chỗ) để thấy rõ hai đường lệch nhau bao nhiêu.
export function PitchContourCard({ chart, loading, error }: PitchContourCardProps) {
  return (
    <section className="flex flex-col gap-3 rounded-bvc-xl border border-bvc-border bg-white p-4 md:rounded-[22px] md:p-5.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-bvc-ink">So sánh cao độ &amp; nhịp (Pitch Contour)</h2>
          <p className="mt-0.5 text-[11px] text-bvc-muted">Đường cao độ bản thu so với bản mẫu theo thời gian</p>
        </div>
        {chart && (
          <span className="shrink-0 rounded-full bg-bvc-surface px-2 py-0.5 text-xs font-semibold text-bvc-faint">
            00:00 - {fmtTime(chart.durationSec)}
          </span>
        )}
      </div>

      {loading && (
        <div className="h-[380px] animate-pulse rounded-xl bg-bvc-surface" aria-label="Đang tải biểu đồ cao độ" />
      )}
      {!loading && (error || !chart) && (
        <p className="rounded-xl border border-bvc-border bg-bvc-soft p-4 text-center text-[13px] text-bvc-muted">
          {error || MSG.pitchUnavailable}
        </p>
      )}
      {!loading && !error && chart && <PitchContourChart chart={chart} />}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-medium text-bvc-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-3.5 rounded-full bg-bvc-ink" />
          Bản mẫu GV
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-3.5 rounded-full bg-[#dc2626]" />
          Bản thu Sinh viên
        </span>
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

function PitchContourChart({ chart }: { chart: PitchChart }) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  return (
    <div className="overflow-hidden rounded-xl border border-bvc-border bg-bvc-soft p-2.5 pt-3">
      <div ref={ref} className="relative" style={{ height: CHART_HEIGHT }}>
        {width > LEFT + RIGHT && <PitchContourPlot chart={chart} width={width} />}
      </div>
    </div>
  );
}

function PitchContourPlot({ chart, width }: { chart: PitchChart; width: number }) {
  const { x: pointerX, pointerProps } = useChartPointer(width);
  const frame: Frame = { xStart: LEFT, xEnd: width - RIGHT };

  const sigma = Math.max(MIN_SMOOTH_SIGMA, chart.points.length / SMOOTH_POINTS_PER_SIGMA);
  const cleaned = dropShortRuns(dropShortRuns(chart.points, 1, MIN_VOICED_RUN), 2, MIN_VOICED_RUN);
  const shown = smoothRuns(smoothRuns(cleaned, 1, sigma), 2, sigma);
  const range = robustHzRange(shown, RANGE_TRIM_RATIO) ?? { minHz: chart.minHz, maxHz: chart.maxHz };
  const minMidi = hzToMidiFloat(range.minHz);
  const maxMidi = hzToMidiFloat(range.maxHz);
  const duration = Math.max(chart.durationSec, 0.01);
  const xAt = (seconds: number) => frame.xStart + (seconds / duration) * (frame.xEnd - frame.xStart);
  const secondsAt = (x: number) => ((x - frame.xStart) / (frame.xEnd - frame.xStart)) * duration;
  const yAtMidi = (midi: number) =>
    PITCH_BOTTOM - ((midi - minMidi) / Math.max(maxMidi - minMidi, 1)) * (PITCH_BOTTOM - PITCH_TOP);
  const yAt = (hz: number) => yAtMidi(hzToMidiFloat(hz));

  const teacherPath = buildLinePath(shown, 1, xAt, yAt);
  const studentPath = buildLinePath(shown, 2, xAt, yAt);
  const semitonePx = (PITCH_BOTTOM - PITCH_TOP) / Math.max(maxMidi - minMidi, 1);
  const gridLines = noteGrid(minMidi, maxMidi, semitonePx);
  const ticks = axisTicks(duration, chart.segments, xAt, frame);
  const chips = layoutChips(chart.segments, xAt, frame);

  const hoverIndex =
    pointerX !== null && pointerX >= frame.xStart && pointerX <= frame.xEnd
      ? chart.points.indexOf(nearestPoint(chart.points, secondsAt(pointerX)) ?? chart.points[0])
      : -1;
  const hover =
    hoverIndex >= 0
      ? {
          seconds: chart.points[hoverIndex][0],
          teacherHz: chart.points[hoverIndex][1],
          studentHz: chart.points[hoverIndex][2],
          x: xAt(chart.points[hoverIndex][0]),
          // Chấm nằm trên đường đã làm mượt; chữ trong tooltip vẫn là giá trị thật
          drawn: shown[hoverIndex],
        }
      : null;
  const hoverSegment = hover
    ? chart.segments.find((segment) => hover.seconds >= segment.startSec && hover.seconds <= segment.endSec)
    : undefined;

  return (
    <>
      <svg
        {...pointerProps}
        width={width}
        height={CHART_HEIGHT}
        viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
        fill="none"
        className="block cursor-crosshair overflow-visible"
        role="img"
        aria-label="So sánh cao độ bản thu với bản mẫu theo thời gian; rê chuột hoặc chạm để xem giá trị"
      >
        <defs>
          <clipPath id={PITCH_CLIP_ID}>
            <rect
              x={frame.xStart - 4}
              y={PITCH_TOP - 6}
              width={frame.xEnd - frame.xStart + 8}
              height={PITCH_BOTTOM - PITCH_TOP + 12}
            />
          </clipPath>
        </defs>

        {chart.segments.map((segment) => (
          <SegmentZone key={segment.id} segment={segment} xAt={xAt} />
        ))}

        {gridLines.map((line) => (
          <g key={line.midi}>
            <line
              x1={frame.xStart - 4}
              y1={yAtMidi(line.midi)}
              x2={frame.xEnd}
              y2={yAtMidi(line.midi)}
              stroke={line.kind === "note" ? (line.isNatural ? "#cfd8d2" : "#e1e7e3") : "#e9eeea"}
              strokeWidth="1"
              strokeDasharray={line.kind === "note" ? (line.isNatural ? undefined : "4 3") : "1 3"}
            />
            {line.label && (
              <text
                x="2"
                y={yAtMidi(line.midi) + 4}
                fontSize={line.isNatural ? 11 : 10}
                fill={line.isNatural ? "#64748b" : AXIS_TEXT}
                fontWeight={line.isNatural ? 700 : 500}
              >
                {line.label}
              </text>
            )}
          </g>
        ))}

        {/* Đường GV dày ở dưới, đường sinh viên mảnh ở trên: chỗ hai bản trùng nhau vẫn thấy viền tối của GV */}
        <g clipPath={`url(#${PITCH_CLIP_ID})`}>
          <path
            d={teacherPath}
            stroke="var(--color-bvc-ink)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d={studentPath} stroke={STUDENT_COLOR} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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
              {fmtTime(tick.seconds)}
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
            {hover.drawn[1] !== null && (
              <circle
                cx={hover.x}
                cy={yAt(hover.drawn[1])}
                r="4"
                fill="var(--color-bvc-ink)"
                stroke="#fff"
                strokeWidth="1.5"
              />
            )}
            {hover.drawn[2] !== null && (
              <circle
                cx={hover.x}
                cy={yAt(hover.drawn[2])}
                r="4"
                fill={STUDENT_COLOR}
                stroke="#fff"
                strokeWidth="1.5"
              />
            )}
          </g>
        )}
      </svg>
      {hover && (
        <ChartTooltip percent={(hover.x / width) * 100}>
          <div className="font-bold">{fmtTime(hover.seconds)}</div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-bvc-ink" />
            Mẫu GV:{" "}
            {hover.teacherHz === null ? "lặng" : `${Math.round(hover.teacherHz)} Hz (${noteLabel(hover.teacherHz)})`}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#dc2626]" />
            Sinh viên:{" "}
            {hover.studentHz === null ? "lặng" : `${Math.round(hover.studentHz)} Hz (${noteLabel(hover.studentHz)})`}
          </div>
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
