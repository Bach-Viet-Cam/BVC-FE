import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { SubmissionHistoryItem } from "@/features/practice/types/submissionHistoryTypes";
import { SUBMISSION_KIND_LABEL, formatSubmittedAt } from "@/features/practice/utils/submissionHistory";
import { toStatusLabel } from "@/features/practice/utils/submissionStatus";
import { formatPercent, submissionHref } from "@/features/home/utils/homeFormat";
import { SectionTitle } from "@/shared/components/bvc/SectionTitle";

interface RecentSubmissionsCardProps {
  items: SubmissionHistoryItem[];
  isLoading: boolean;
  error: string | null;
}

// 3 lần nộp gần nhất (mọi bài, mọi trạng thái) để xem nhanh; "Xem tất cả" mở trang lịch sử
export function RecentSubmissionsCard({ items, isLoading, error }: RecentSubmissionsCardProps) {
  return (
    <section aria-labelledby="recent-heading" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <SectionTitle id="recent-heading">Lần nộp gần nhất</SectionTitle>
        <Link to="/practice/submissions" className="text-[13.5px] font-medium text-bvc-accent-text">
          Xem tất cả
        </Link>
      </div>
      {isLoading ? (
        <p className="text-[14px] text-bvc-muted">Đang tải...</p>
      ) : error ? (
        <p role="alert" className="text-[14px] text-bvc-error">
          {error}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-bvc-border rounded-bvc-xl border border-bvc-border bg-white">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to={submissionHref(item)}
                className="flex items-center gap-3 px-4 py-3 text-bvc-ink hover:bg-bvc-soft hover:text-bvc-ink"
              >
                <span className="w-14 shrink-0 text-center font-bvc-mono text-[15px] font-semibold">
                  {item.status === "COMPLETED" ? formatPercent(item.accuracy) : "-"}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[14.5px] font-semibold">{item.pieceTitle}</span>
                  <span className="truncate text-[12.5px] text-bvc-muted">
                    {SUBMISSION_KIND_LABEL[item.kind]} · {formatSubmittedAt(item.submittedAt)}
                    {item.status !== "COMPLETED" && ` · ${toStatusLabel(item.status)}`}
                  </span>
                </span>
                <ChevronRight className="size-4.5 shrink-0 text-bvc-faint" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
