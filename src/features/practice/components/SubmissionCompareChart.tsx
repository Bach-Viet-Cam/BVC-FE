import {
  COMPARE_CHART_BANDS,
  COMPARE_CHART_NOTES,
  COMPARE_CHART_TICKS,
  COMPARE_NEWER_PATH,
  COMPARE_OLDER_PATH,
  COMPARE_TOTAL_BARS,
} from "@/features/practice/constants/submissionHistoryMockData";
import type { CompareChartBand } from "@/features/practice/types/submissionHistoryTypes";

const ACCENT = "#2f7a62";

function bandBadge(status: CompareChartBand["status"]) {
  return status === "IMPROVED"
    ? { label: "Đã cải thiện", width: 74, fill: "#3a6b44", stroke: "none", text: "#ffffff" }
    : { label: "Lỗi lặp lại", width: 66, fill: "#fbf3de", stroke: "#e6d29a", text: "#8a6a12" };
}

export function OlderLineSwatch() {
  return (
    <svg width="30" height="8" viewBox="0 0 30 8" className="shrink-0" aria-hidden>
      <line x1="1" y1="4" x2="29" y2="4" stroke="#93a399" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" />
    </svg>
  );
}

export function NewerLineSwatch() {
  return (
    <svg width="30" height="8" viewBox="0 0 30 8" className="shrink-0" aria-hidden>
      <line x1="1" y1="4" x2="29" y2="4" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// Biểu đồ cao độ chồng nhau của hai bài nộp (chế độ so sánh, không phát âm thanh). Dữ liệu mẫu.
export function SubmissionCompareChart() {
  return (
    <svg
      viewBox="0 0 396 200"
      width="100%"
      role="img"
      aria-label={`Biểu đồ cao độ theo thời gian của hai bài nộp, ô nhịp 1 đến ${COMPARE_TOTAL_BARS}`}
      className="block"
    >
      {COMPARE_CHART_NOTES.map((note) => (
        <g key={note.label}>
          <line x1="34" y1={note.y} x2="388" y2={note.y} stroke="#e2eae4" strokeWidth="1" />
          <text x="28" y={note.y + 3.5} textAnchor="end" fontSize="11" fill="#5e6f66">
            {note.label}
          </text>
        </g>
      ))}

      {COMPARE_CHART_BANDS.map((band) => (
        <rect
          key={band.id}
          x={band.x}
          y="26"
          width={band.width}
          height="144"
          fill={band.status === "IMPROVED" ? "#3a6b44" : "#c8a63c"}
          fillOpacity={band.status === "IMPROVED" ? 0.1 : 0.18}
        />
      ))}

      <line x1="34" y1="170" x2="388" y2="170" stroke="#cfdcd3" strokeWidth="1" />
      {COMPARE_CHART_TICKS.map((tick) => (
        <g key={tick.label}>
          <line x1={tick.x} y1="170" x2={tick.x} y2="174" stroke="#93a399" strokeWidth="1" />
          <text x={tick.x} y="186" textAnchor="middle" fontSize="10.5" fill="#5e6f66">
            {tick.label}
          </text>
        </g>
      ))}

      <path
        d={COMPARE_OLDER_PATH}
        fill="none"
        stroke="#93a399"
        strokeWidth="2"
        strokeDasharray="5 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={COMPARE_NEWER_PATH}
        fill="none"
        stroke={ACCENT}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {COMPARE_CHART_BANDS.map((band) => {
        const badge = bandBadge(band.status);
        const x = band.x + band.width / 2 - badge.width / 2;
        return (
          <g key={`${band.id}-badge`}>
            <rect x={x} y="5" width={badge.width} height="17" rx="8.5" fill={badge.fill} stroke={badge.stroke} />
            <text
              x={x + badge.width / 2}
              y="16.8"
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="700"
              fill={badge.text}
            >
              {badge.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
