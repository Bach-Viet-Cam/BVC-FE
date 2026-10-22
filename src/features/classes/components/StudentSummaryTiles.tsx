import { StatusLabel } from "@/features/classes/components/StatusLabel";
import { type StudentSummary } from "@/features/classes/types/progressTypes";
import { formatPercent } from "@/features/classes/utils/assignmentFormat";
import { PROGRESS_STATUS_LABELS, PROGRESS_STATUS_TONES } from "@/features/classes/utils/progressFormat";

interface StudentSummaryTilesProps {
  summary: StudentSummary;
}

const TILE_CLASSES = "flex min-w-0 flex-col gap-[4px] rounded-[16px] bg-bvc-soft px-[12px] py-[11px]";
const LABEL_CLASSES = "text-[12px] leading-tight text-bvc-muted";
const VALUE_CLASSES = "font-bvc-mono text-[22px] font-bold leading-none text-bvc-ink";

export function StudentSummaryTiles({ summary }: StudentSummaryTilesProps) {
  return (
    <div className="grid grid-cols-3 gap-[8px]">
      <div className={TILE_CLASSES}>
        <span className={LABEL_CLASSES}>Tổng buổi luyện</span>
        <span className={VALUE_CLASSES}>{summary.totalSessions}</span>
      </div>
      <div className={TILE_CLASSES}>
        <span className={LABEL_CLASSES}>Buổi trong 7 ngày qua</span>
        <span className={VALUE_CLASSES}>{summary.sessionsLast7Days}</span>
      </div>
      <div className={TILE_CLASSES}>
        <span className={LABEL_CLASSES}>Độ chính xác TB</span>
        <span className={VALUE_CLASSES}>{summary.average === null ? "-" : formatPercent(summary.average)}</span>
        {summary.status && (
          <StatusLabel
            label={PROGRESS_STATUS_LABELS[summary.status]}
            tone={PROGRESS_STATUS_TONES[summary.status]}
            className="text-[11.5px]"
          />
        )}
      </div>
    </div>
  );
}
