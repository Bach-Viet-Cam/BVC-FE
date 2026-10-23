import type { PracticeContext } from "@/features/practice/types/practiceContextTypes";
import { DEADLINE_NOTE, assignmentStatusText } from "@/features/practice/utils/practiceContextFormat";
import { fmtTime } from "@/features/practice/utils/practiceFormat";
import { formatDate } from "@/shared/utils/formatDate";

interface AssignmentInfoCardProps {
  context: PracticeContext | null;
  isLoading: boolean;
  error: string | null;
}

interface InfoRow {
  label: string;
  value: string;
}

const ROW_CLASS = "flex items-baseline justify-between gap-3 border-b border-bvc-border-strong/60 py-3 text-sm";

function buildRows(context: PracticeContext): InfoRow[] {
  const { sheet, assignment, classRecord } = context;
  const rows: (InfoRow | null)[] = [
    { label: "Bài nhạc", value: context.piece.title },
    { label: "Bản nhạc", value: sheet.name },
    { label: "Nhạc cụ", value: sheet.instrument.name },
    { label: "Độ khó", value: sheet.level.name },
    sheet.durationSec ? { label: "Thời lượng", value: fmtTime(sheet.durationSec) } : null,
    classRecord ? { label: "Lớp", value: classRecord.name } : null,
    assignment ? { label: "Bài tập", value: assignment.title } : null,
    assignment ? { label: "Hạn nộp", value: formatDate(assignment.deadline) } : null,
    assignment
      ? { label: "Lượt nộp còn lại", value: `${assignment.remainingSubmissions}/${assignment.maxSubmissions}` }
      : null,
    assignment?.targetBpm ? { label: "Tốc độ yêu cầu", value: `${assignment.targetBpm} BPM` } : null,
  ];
  return rows.filter((row): row is InfoRow => row !== null);
}

// Thẻ thông tin chỉ có ở bố cục laptop (từ lg): cấu hình bản nhạc và bài tập của lớp (nếu có)
export function AssignmentInfoCard({ context, isLoading, error }: AssignmentInfoCardProps) {
  return (
    <section className="hidden flex-col rounded-[22px] border border-bvc-border bg-bvc-panel p-5.5 lg:flex">
      <span className="text-[11.5px] font-bold tracking-[0.12em] text-bvc-muted uppercase">Bài tập</span>

      {isLoading && <div aria-hidden className="mt-4 h-40 animate-pulse rounded-bvc-md bg-bvc-surface" />}
      {!isLoading && error && <p className="mt-3 text-sm text-bvc-muted">{error}</p>}
      {!isLoading && !error && !context && (
        <p className="mt-3 text-sm text-bvc-muted">Chọn một bản nhạc để xem thông tin bài tập.</p>
      )}

      {context && (
        <>
          <dl className="mt-2 flex flex-col">
            {buildRows(context).map((row) => (
              <div key={row.label} className={ROW_CLASS}>
                <dt className="text-bvc-muted">{row.label}</dt>
                <dd className="text-right font-semibold text-bvc-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[13px] leading-normal text-bvc-muted">{assignmentStatusText(context)}</p>
          {context.assignment && <p className="mt-2 text-[12.5px] leading-normal text-bvc-muted">{DEADLINE_NOTE}</p>}
        </>
      )}
    </section>
  );
}
