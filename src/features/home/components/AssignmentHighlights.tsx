import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Repeat2, TrendingUp } from "lucide-react";
import type { DashboardAssignment } from "@/features/home/types/homeTypes";
import { formatDelta, formatPercent, type AssignmentSummary } from "@/features/home/utils/homeFormat";
import { cn } from "@/shared/utils/cn";

interface AssignmentHighlightsProps {
  summary: AssignmentSummary;
  mostSubmitted: DashboardAssignment | null;
  mostImproved: DashboardAssignment | null;
}

interface HighlightTileProps {
  icon: ReactNode;
  label: string;
  to?: string;
  children: ReactNode;
}

const TILE_CLASS = "flex h-full flex-col gap-2 rounded-bvc-xl border border-bvc-border bg-white p-4 text-bvc-ink";

function HighlightTile({ icon, label, to, children }: HighlightTileProps) {
  const content = (
    <>
      <span className="flex items-center gap-2 text-[12.5px] font-semibold text-bvc-muted">
        <span className="text-bvc-accent-text">{icon}</span>
        {label}
      </span>
      {children}
    </>
  );
  if (!to) return <div className={TILE_CLASS}>{content}</div>;
  return (
    <Link to={to} className={cn(TILE_CLASS, "hover:bg-bvc-soft hover:text-bvc-ink")}>
      {content}
    </Link>
  );
}

// Ô tổng hợp bài tập: tổng số bài hiện tại, bài nộp nhiều lần nhất, bài tiến bộ nhiều nhất
export function AssignmentHighlights({ summary, mostSubmitted, mostImproved }: AssignmentHighlightsProps) {
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      <li>
        <HighlightTile
          icon={<ClipboardList className="size-4" aria-hidden />}
          label="Bài tập hiện tại"
          to="/assignments"
        >
          <span className="font-bvc-mono text-[29px] leading-none font-semibold">{summary.total}</span>
          <span className="text-[12.5px] text-bvc-muted">
            {summary.passed} đạt · {summary.submitted} đã nộp · {summary.notSubmitted} chưa nộp
            {summary.overdue > 0 && ` · ${summary.overdue} quá hạn`}
          </span>
        </HighlightTile>
      </li>
      <li>
        <HighlightTile
          icon={<Repeat2 className="size-4" aria-hidden />}
          label="Nộp nhiều nhất"
          to={mostSubmitted ? `/assignment/${mostSubmitted.assignmentId}` : undefined}
        >
          {mostSubmitted ? (
            <>
              <span className="line-clamp-2 text-[15px] font-bold">{mostSubmitted.title}</span>
              <span className="mt-auto font-bvc-mono text-[13px] text-bvc-muted">
                {mostSubmitted.submissionCount} lần nộp
              </span>
            </>
          ) : (
            <span className="text-[13px] text-bvc-muted">Chưa nộp bài tập nào.</span>
          )}
        </HighlightTile>
      </li>
      <li>
        <HighlightTile
          icon={<TrendingUp className="size-4" aria-hidden />}
          label="Tiến bộ nhiều nhất"
          to={mostImproved ? `/assignment/${mostImproved.assignmentId}` : undefined}
        >
          {mostImproved && mostImproved.deltaPercent !== null ? (
            <>
              <span className="line-clamp-2 text-[15px] font-bold">{mostImproved.title}</span>
              <span className="mt-auto flex items-baseline gap-2 font-bvc-mono text-[13px]">
                <span className="font-bold text-bvc-ok">{formatDelta(mostImproved.deltaPercent)}</span>
                <span className="text-bvc-muted">
                  {formatPercent(mostImproved.firstAccuracy)} → {formatPercent(mostImproved.latestAccuracy)}
                </span>
              </span>
            </>
          ) : (
            <span className="text-[13px] text-bvc-muted">Nộp lại một bài tập từ 2 lần để xem mức tiến bộ.</span>
          )}
        </HighlightTile>
      </li>
    </ul>
  );
}
