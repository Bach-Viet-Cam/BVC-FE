import { ChartTooltip } from "@/features/practice/components/ChartTooltip";
import { RESULT_MOCK } from "@/features/practice/constants/resultsMockData";
import { useChartPointer } from "@/features/practice/hooks/useChartPointer";
import { parseCubicPath, yAtX } from "@/features/practice/utils/bezierPath";
import { hzToMidiFloat, midiToNoteInfo } from "@/features/practice/utils/noteMath";
import { fmtTime, signed } from "@/features/practice/utils/practiceFormat";

const VIEW_WIDTH = 340;
const X_START = 28;
const X_END = 332;
// Trục tung vẽ theo các mốc nốt (y trong viewBox → Hz), nội suy tuyến tính giữa hai mốc
const PITCH_ANCHORS = [
  { y: 20, hz: 523.25 },
  { y: 48, hz: 440 },
  { y: 76, hz: 392 },
  { y: 104, hz: 329.63 },
];

const GRID_Y = [20, 48, 76, 104];
const NOTE_LABELS = [
  { y: 23, text: "Do5" },
  { y: 51, text: "La4" },
  { y: 79, text: "Sol4" },
  { y: 107, text: "Mi4" },
];
const TICK_COLOR = { neutral: "#64748b", bad: "#dc2626", warn: "#ea580c" };
const AXIS_TICKS = [
  { x: 28, text: "Bar 1", tone: "neutral" },
  { x: 98, text: "Bar 9", tone: "bad" },
  { x: 170, text: "Bar 18", tone: "warn" },
  { x: 225, text: "Bar 24", tone: "warn" },
  { x: 332, text: "Bar 36", tone: "neutral" },
] as const;

const TEACHER_PATH =
  "M28 82 C 45 80, 55 46, 75 48 C 88 50, 95 78, 108 78 C 122 78, 132 30, 148 24 C 160 20, 172 68, 190 70 C 205 72, 218 38, 230 40 C 248 42, 260 92, 276 90 C 292 88, 305 32, 332 34";
const STUDENT_PATH =
  "M28 82 C 45 81, 55 47, 75 50 C 88 52, 94 92, 108 86 C 122 80, 132 32, 148 26 C 158 22, 168 54, 182 56 C 196 58, 206 28, 222 32 C 238 36, 256 90, 276 89 C 292 88, 305 33, 332 35";

const TEACHER_SEGMENTS = parseCubicPath(TEACHER_PATH);
const STUDENT_SEGMENTS = parseCubicPath(STUDENT_PATH);

function hzAtY(y: number): number {
  const last = PITCH_ANCHORS.length - 1;
  if (y <= PITCH_ANCHORS[0].y) return PITCH_ANCHORS[0].hz;
  if (y >= PITCH_ANCHORS[last].y) return PITCH_ANCHORS[last].hz;
  const index = PITCH_ANCHORS.findIndex((anchor) => anchor.y >= y);
  const upper = PITCH_ANCHORS[index];
  const lower = PITCH_ANCHORS[index - 1];
  return lower.hz + ((y - lower.y) / (upper.y - lower.y)) * (upper.hz - lower.hz);
}

function noteLabel(hz: number): string {
  const midi = Math.round(hzToMidiFloat(hz));
  return `${midiToNoteInfo(midi).vn}${Math.floor(midi / 12) - 1}`;
}

// Giá trị của hai đường tại hoành độ x: thời điểm, ô nhịp, cao độ bản mẫu và bản thu
function readAt(x: number) {
  if (x < X_START || x > X_END) return null;
  const teacherY = yAtX(TEACHER_SEGMENTS, x);
  const studentY = yAtX(STUDENT_SEGMENTS, x);
  if (teacherY === null || studentY === null) return null;
  const ratio = (x - X_START) / (X_END - X_START);
  const teacherHz = hzAtY(teacherY);
  const studentHz = hzAtY(studentY);
  return {
    x,
    teacherY,
    studentY,
    teacherHz,
    studentHz,
    seconds: ratio * RESULT_MOCK.durationSec,
    bar: Math.min(RESULT_MOCK.totalBars, Math.floor(ratio * RESULT_MOCK.totalBars) + 1),
    cents: 1200 * Math.log2(studentHz / teacherHz),
  };
}

const LEGEND = [
  { label: "Bản mẫu GV", swatch: <span className="h-1 w-3.5 rounded-full bg-bvc-ink" /> },
  { label: "Bản thu Sinh viên", swatch: <span className="h-1 w-3.5 rounded-full bg-[#dc2626]" /> },
  { label: "Vùng sai khác cao", swatch: <span className="size-2.5 rounded-[3px] border border-red-300 bg-red-100" /> },
];

// So sánh đường cao độ của sinh viên với bản mẫu giảng viên (dữ liệu mẫu)
export function PitchContourCard() {
  const { x: pointerX, pointerProps } = useChartPointer(VIEW_WIDTH);
  const hover = pointerX === null ? null : readAt(pointerX);

  return (
    <section className="flex flex-col gap-3 rounded-bvc-xl border border-bvc-border bg-white p-4 md:rounded-[22px] md:p-5.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-bvc-ink">So sánh cao độ &amp; nhịp (Pitch Contour)</h2>
          <p className="mt-0.5 text-[11px] text-bvc-muted">Phổ tần số thời gian thực so với chuẩn</p>
        </div>
        <span className="shrink-0 rounded-full bg-bvc-surface px-2 py-0.5 text-xs font-semibold text-bvc-faint">
          Bar 1 – {RESULT_MOCK.totalBars}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-bvc-border bg-bvc-soft p-2.5 pt-3">
        <div className="mb-1 flex items-center justify-between border-b border-bvc-border px-1 pb-1 text-[9px] font-semibold text-bvc-faint">
          <span>Cao độ (Hz / Nốt)</span>
          <span>Sol4 (392Hz) – Do5 (523Hz)</span>
        </div>
        <div className="relative">
          <svg
            {...pointerProps}
            viewBox={`0 0 ${VIEW_WIDTH} 130`}
            fill="none"
            className="h-auto w-full cursor-crosshair overflow-visible"
            role="img"
            aria-label="So sánh cao độ bản thu với bản mẫu; rê chuột hoặc chạm để xem giá trị theo thời gian"
          >
            {GRID_Y.map((y) => (
              <line key={y} x1="24" y1={y} x2="336" y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 3" />
            ))}
            {NOTE_LABELS.map((note) => (
              <text key={note.text} x="4" y={note.y} fontSize="8" fill="#94a3b8" fontWeight="600">
                {note.text}
              </text>
            ))}

            <rect
              x="86"
              y="8"
              width="24"
              height="102"
              rx="4"
              fill="#fef2f2"
              fillOpacity="0.9"
              stroke="#f87171"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <rect
              x="162"
              y="8"
              width="68"
              height="102"
              rx="4"
              fill="#fff7ed"
              fillOpacity="0.9"
              stroke="#fb923c"
              strokeWidth="1"
              strokeDasharray="2 2"
            />

            <g transform="translate(74, 10)">
              <rect width="48" height="14" rx="3" fill="#ef4444" />
              <text x="24" y="9.5" fontSize="7.5" fill="#fff" fontWeight="700" textAnchor="middle">
                -24¢ Sol
              </text>
            </g>
            <g transform="translate(166, 10)">
              <rect width="60" height="14" rx="3" fill="#ea580c" />
              <text x="30" y="9.5" fontSize="7.5" fill="#fff" fontWeight="700" textAnchor="middle">
                Lệch nhịp +14%
              </text>
            </g>

            <path d={TEACHER_PATH} stroke="var(--color-bvc-ink)" strokeWidth="2.5" strokeLinecap="round" />
            <path d={STUDENT_PATH} stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="98" cy="88" r="3.5" fill="#dc2626" stroke="#fff" strokeWidth="1.5" />
            <circle cx="98" cy="78" r="3" fill="var(--color-bvc-ink)" stroke="#fff" strokeWidth="1.5" />

            {AXIS_TICKS.map((tick) => (
              <g key={tick.text}>
                <line x1={tick.x} y1="112" x2={tick.x} y2="117" stroke="#94a3b8" strokeWidth="1" />
                <text x={tick.x} y="126" fontSize="8" fill={TICK_COLOR[tick.tone]} fontWeight="700" textAnchor="middle">
                  {tick.text}
                </text>
              </g>
            ))}

            {hover && (
              <g pointerEvents="none">
                <line
                  x1={hover.x}
                  y1="8"
                  x2={hover.x}
                  y2="112"
                  stroke="var(--color-bvc-ink)"
                  strokeWidth="1"
                  strokeDasharray="3 2"
                />
                <circle
                  cx={hover.x}
                  cy={hover.teacherY}
                  r="3.5"
                  fill="var(--color-bvc-ink)"
                  stroke="#fff"
                  strokeWidth="1.5"
                />
                <circle cx={hover.x} cy={hover.studentY} r="3.5" fill="#dc2626" stroke="#fff" strokeWidth="1.5" />
              </g>
            )}
          </svg>
          {hover && (
            <ChartTooltip percent={(hover.x / VIEW_WIDTH) * 100}>
              <div className="font-bold">
                Bar {hover.bar} · {fmtTime(hover.seconds)}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-bvc-ink" />
                Mẫu GV: {Math.round(hover.teacherHz)} Hz ({noteLabel(hover.teacherHz)})
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#dc2626]" />
                Sinh viên: {Math.round(hover.studentHz)} Hz ({noteLabel(hover.studentHz)})
              </div>
              <div className="text-bvc-muted">Lệch {signed(hover.cents)}¢ so với bản mẫu</div>
            </ChartTooltip>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-medium text-bvc-muted">
        {LEGEND.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            {item.swatch}
            {item.label}
          </span>
        ))}
      </div>
    </section>
  );
}
