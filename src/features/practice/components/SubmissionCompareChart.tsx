import { useId, useState } from "react";
import { Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";
import { ChartFullscreen, useFullscreenChartHeight } from "@/features/practice/components/ChartFullscreen";
import { useElementWidth } from "@/features/practice/hooks/useElementWidth";
import type {
  CompareSegment,
  CompareSegmentBand,
  SubmissionCompare,
} from "@/features/practice/types/submissionHistoryTypes";
import { formatTick, isZoomed, zoomView } from "@/features/practice/utils/chartView";
import type { ChartView } from "@/features/practice/utils/chartView";
import { hzToMidiFloat, midiToNoteInfo } from "@/features/practice/utils/noteMath";
import { toCompareChartPaths, toSegmentBands } from "@/features/practice/utils/submissionCompare";

const ACCENT = "#2f7a62";
const TEACHER = "#c3cfc7";
const OLDER = "#93a399";

const HEIGHT = 300;
const MIN_CHART_WIDTH = 560;
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
export function SubmissionCompareChart(props: SubmissionCompareChartProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenView, setFullscreenView] = useState<ChartView | undefined>();
  return <>
    <ComparePlot {...props} onFullscreen={(view) => { setFullscreenView(view); setFullscreen(true); }} />
    {fullscreen && <ChartFullscreen onClose={() => setFullscreen(false)}><ComparePlot {...props} fullscreen initialView={fullscreenView} onFullscreen={() => setFullscreen(false)} /></ChartFullscreen>}
  </>;
}

function ComparePlot({ chart, segments, selectedId, visible, onSelectSegment, onFullscreen, fullscreen = false, initialView }: SubmissionCompareChartProps & { onFullscreen: (view?: ChartView) => void; fullscreen?: boolean; initialView?: ChartView }) {
  const height = useFullscreenChartHeight(fullscreen, HEIGHT);
  const clipId = useId();
  const { ref, width: viewportWidth } = useElementWidth<HTMLDivElement>();
  // Khung hẹp hơn MIN_CHART_WIDTH thì giữ nguyên tỉ lệ biểu đồ và cho cuộn ngang thay vì co lại
  const width = viewportWidth > 0 ? Math.max(viewportWidth, MIN_CHART_WIDTH) : 0;

  const duration = Math.max(chart.durationSec, 0.1);
  const lowMidi = hzToMidiFloat(chart.minHz) - MIDI_PADDING;
  const highMidi = hzToMidiFloat(chart.maxHz) + MIDI_PADDING;
  const base = { t0: 0, t1: duration, m0: lowMidi, m1: highMidi };
  const [view, setView] = useState(initialView ?? base);
  const zoomed = isZoomed(view, base);
  const zoom = (factor: number) => setView(current => zoomView(current, factor, { seconds: (current.t0 + current.t1) / 2, midi: (current.m0 + current.m1) / 2 }, base));
  const plotWidth = Math.max(width - PLOT.left - PLOT.right, 1);
  const plotHeight = height - PLOT.top - PLOT.bottom;
  const xAt = (seconds: number) => PLOT.left + ((seconds - view.t0) / (view.t1 - view.t0)) * plotWidth;
  const yAtMidi = (midi: number) => PLOT.top + (1 - (midi - view.m0) / (view.m1 - view.m0)) * plotHeight;
  const yAt = (hz: number) => yAtMidi(hzToMidiFloat(hz));

  const noteStep = Math.max(1, Math.ceil((view.m1 - view.m0) / MAX_NOTE_LINES));
  const noteLines: number[] = [];
  for (let midi = Math.ceil(view.m0); midi <= view.m1; midi += noteStep) noteLines.push(midi);
  const ticks = Array.from({ length: TIME_TICKS }, (_, index) => view.t0 + ((view.t1 - view.t0) * index) / (TIME_TICKS - 1));

  const paths = toCompareChartPaths(chart, xAt, yAt);
  const bands = toSegmentBands(segments.filter(segment => segment.endSec >= view.t0 && segment.startSec <= view.t1), xAt);
  const kindById = new Map(segments.map((segment) => [segment.id, segment.kind]));
  const axisY = height - PLOT.bottom;

  return (
    <div className="w-full">
      <div ref={ref} className="overflow-x-auto overscroll-x-contain">
      {width > 0 && (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          role="img"
          aria-label="Biểu đồ cao độ theo thời gian của hai bài nộp và bản mẫu"
          className="block"
        >
          <defs><clipPath id={clipId}><rect x={PLOT.left} y={PLOT.top} width={plotWidth} height={plotHeight} /></clipPath></defs>
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

          <g clipPath={`url(#${clipId})`}>
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

          </g>
          <line x1={PLOT.left} y1={axisY} x2={width - PLOT.right} y2={axisY} stroke="#cfdcd3" strokeWidth="1" />
          {ticks.map((seconds) => (
            <g key={seconds}>
              <line x1={xAt(seconds)} y1={axisY} x2={xAt(seconds)} y2={axisY + 4} stroke="#93a399" strokeWidth="1" />
              <text x={xAt(seconds)} y={axisY + 16} textAnchor="middle" fontSize="10.5" fill="#5e6f66">
                {formatTick(seconds, view.t1 - view.t0)}
              </text>
            </g>
          ))}

          <g clipPath={`url(#${clipId})`}>
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

          </g>
          {bands.map((band) => {
            const badge = bandBadge(band.status);
            const bandLeft = Math.max(PLOT.left, band.x);
            const bandWidth = Math.max(2, Math.min(width - PLOT.right, band.x + band.width) - bandLeft);
            const x = Math.min(
              Math.max(bandLeft + bandWidth / 2 - badge.width / 2, PLOT.left),
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
                <rect x={bandLeft} y={5} width={bandWidth} height={axisY - 5} fill="transparent" />
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
      <div className="flex justify-end gap-1 pt-1">
        <button type="button" aria-label="Thu nh?" title="Thu nh?" disabled={!zoomed} onClick={() => zoom(1 / 1.6)} className="flex size-9 items-center justify-center rounded-full border border-bvc-border bg-white disabled:opacity-40"><ZoomOut className="size-4" /></button>
        <button type="button" aria-label="Ph?ng to" title="Ph?ng to" onClick={() => { if (fullscreen) zoom(1.6); else onFullscreen(zoomView(view, 1.6, { seconds: (view.t0 + view.t1) / 2, midi: (view.m0 + view.m1) / 2 }, base)); }} className="flex size-9 items-center justify-center rounded-full border border-bvc-border bg-white"><ZoomIn className="size-4" /></button>
        <button type="button" aria-label={fullscreen ? "Thu nhỏ biểu đồ" : "Xem toàn bộ"} title={fullscreen ? "Thu nhỏ biểu đồ" : "Xem toàn bộ"} onClick={() => onFullscreen(view)} className="flex size-9 items-center justify-center rounded-full border border-bvc-border bg-white">{fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}</button>
      </div>
    </div>
  );
}
