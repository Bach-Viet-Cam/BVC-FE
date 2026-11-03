import { useElementWidth } from "@/features/practice/hooks/useElementWidth";
import type {
  CompareSegment,
  CompareSegmentBand,
  SubmissionCompare,
} from "@/features/practice/types/submissionHistoryTypes";
import { formatTick } from "@/features/practice/utils/chartView";
import { hzToMidiFloat, midiToNoteInfo } from "@/features/practice/utils/noteMath";
import { toCompareChartPaths, toSegmentBands } from "@/features/practice/utils/submissionCompare";

const ACCENT = "#2f7a62";
const TEACHER = "#c3cfc7";
const OLDER = "#93a399";

const HEIGHT = 300;
const PLOT = { left: 34, right: 8, top: 26, bottom: 30 };
const TIME_TICKS = 5;
const MAX_NOTE_LINES = 6;
// Thêm nửa cung mỗi đầu cho đường không chạm mép
const MIDI_PADDING = 0.5;

function bandBadge(status: CompareSegmentBand["status"]) {
  return status === "IMPROVED"
    ? { label: "Đã cải thiện", width: 74, fill: "#3a6b44", stroke: "none", text: "#ffffff" }
    : { label: "Lỗi lặp lại", width: 66, fill: "#fbf3de", stroke: "#e6d29a", text: "#8a6a12" };
}

export function TeacherLineSwatch() {
  return (
    <svg width="30" height="8" viewBox="0 0 30 8" className="shrink-0" aria-hidden>
      <line x1="1" y1="4" x2="29" y2="4" stroke={TEACHER} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function OlderLineSwatch() {
  return (
    <svg width="30" height="8" viewBox="0 0 30 8" className="shrink-0" aria-hidden>
      <line x1="2" y1="4" x2="28" y2="4" stroke={OLDER} strokeOpacity="0.5" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

export function NewerLineSwatch() {
  return (
    <svg width="30" height="8" viewBox="0 0 30 8" className="shrink-0" aria-hidden>
      <line x1="1" y1="4" x2="29" y2="4" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

interface SubmissionCompareChartProps {
  chart: SubmissionCompare["chart"];
  segments: CompareSegment[];
  selectedId: string | null;
  visible: { teacher: boolean; older: boolean; newer: boolean };
  onSelectSegment: (id: string) => void;
}

// Biểu đồ cao độ chồng nhau của hai bài nộp trên trục thời gian bản mẫu (không zoom, không phát âm thanh)
export function SubmissionCompareChart({ chart, segments, selectedId, visible, onSelectSegment }: SubmissionCompareChartProps) {
  const { ref, width } = useElementWidth<HTMLDivElement>();

  const duration = Math.max(chart.durationSec, 0.1);
  const lowMidi = hzToMidiFloat(chart.minHz) - MIDI_PADDING;
  const highMidi = hzToMidiFloat(chart.maxHz) + MIDI_PADDING;
  const plotWidth = Math.max(width - PLOT.left - PLOT.right, 1);
  const plotHeight = HEIGHT - PLOT.top - PLOT.bottom;
  const xAt = (seconds: number) => PLOT.left + (Math.min(Math.max(seconds, 0), duration) / duration) * plotWidth;
  const yAtMidi = (midi: number) => PLOT.top + (1 - (midi - lowMidi) / (highMidi - lowMidi)) * plotHeight;
  const yAt = (hz: number) => yAtMidi(hzToMidiFloat(hz));

  const noteStep = Math.max(1, Math.ceil((highMidi - lowMidi) / MAX_NOTE_LINES));
  const noteLines: number[] = [];
  for (let midi = Math.ceil(lowMidi); midi <= highMidi; midi += noteStep) noteLines.push(midi);
  const ticks = Array.from({ length: TIME_TICKS }, (_, index) => (duration * index) / (TIME_TICKS - 1));

  const paths = toCompareChartPaths(chart, xAt, yAt);
  const bands = toSegmentBands(segments, xAt);
  const kindById = new Map(segments.map((segment) => [segment.id, segment.kind]));
  const axisY = HEIGHT - PLOT.bottom;

  return (
    <div ref={ref} className="w-full">
      {width > 0 && (
        <svg
          viewBox={`0 0 ${width} ${HEIGHT}`}
          width={width}
          height={HEIGHT}
          role="img"
          aria-label="Biểu đồ cao độ theo thời gian của hai bài nộp và bản mẫu"
          className="block"
        >
          {noteLines.map((midi) => (
            <g key={midi}>
              <line
                x1={PLOT.left}
                y1={yAtMidi(midi)}
                x2={width - PLOT.right}
                y2={yAtMidi(midi)}
                stroke="#e2eae4"
                strokeWidth="1"
              />
              <text x={PLOT.left - 6} y={yAtMidi(midi) + 3.5} textAnchor="end" fontSize="11" fill="#5e6f66">
                {midiToNoteInfo(midi).vn}
              </text>
            </g>
          ))}

          {bands.map((band) => (
            <rect
              key={band.id}
              x={band.x}
              y={PLOT.top}
              width={Math.max(band.width, 2)}
              height={plotHeight}
              fill={band.status === "IMPROVED" ? "#3a6b44" : "#c8a63c"}
              fillOpacity={(band.status === "IMPROVED" ? 0.1 : 0.18) + (band.id === selectedId ? 0.12 : 0)}
            />
          ))}

          <line x1={PLOT.left} y1={axisY} x2={width - PLOT.right} y2={axisY} stroke="#cfdcd3" strokeWidth="1" />
          {ticks.map((seconds) => (
            <g key={seconds}>
              <line x1={xAt(seconds)} y1={axisY} x2={xAt(seconds)} y2={axisY + 4} stroke="#93a399" strokeWidth="1" />
              <text x={xAt(seconds)} y={axisY + 16} textAnchor="middle" fontSize="10.5" fill="#5e6f66">
                {formatTick(seconds, duration)}
              </text>
            </g>
          ))}

          {visible.teacher && paths.teacher && (
            <path d={paths.teacher} fill="none" stroke={TEACHER} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {/* Bài cũ là dải dày, nhạt nằm dưới; bài mới là nét mảnh nằm trên. Hai đường trùng nhau vẫn thấy dải xám bao quanh nét xanh. */}
          {visible.older && paths.older && (
            <path
              d={paths.older}
              fill="none"
              stroke={OLDER}
              strokeOpacity="0.5"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {visible.newer && paths.newer && (
            <path d={paths.newer} fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {bands.map((band) => {
            const badge = bandBadge(band.status);
            const bandWidth = Math.max(band.width, 2);
            const x = Math.min(
              Math.max(band.x + bandWidth / 2 - badge.width / 2, PLOT.left),
              width - PLOT.right - badge.width
            );
            return (
              <g
                key={`${band.id}-badge`}
                role="button"
                tabIndex={0}
                aria-label={`${badge.label}, lỗi ${kindById.get(band.id) === "rhythm" ? "nhịp" : "cao độ"}`}
                className="cursor-pointer outline-none focus-visible:opacity-80"
                onClick={() => onSelectSegment(band.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectSegment(band.id);
                  }
                }}
              >
                {/* Vùng chạm phủ cả dải để dễ bấm trên điện thoại */}
                <rect x={band.x} y={5} width={bandWidth} height={axisY - 5} fill="transparent" />
                <rect x={x} y="5" width={badge.width} height="17" rx="8.5" fill={badge.fill} stroke={badge.stroke} />
                <text x={x + badge.width / 2} y="16.8" textAnchor="middle" fontSize="10.5" fontWeight="600" fill={badge.text}>
                  {badge.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
