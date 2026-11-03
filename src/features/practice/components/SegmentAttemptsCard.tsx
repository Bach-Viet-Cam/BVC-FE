import { useNavigate } from "react-router-dom";
import { useSegmentAttempts } from "@/features/practice/hooks/useSegmentAttempts";
import type { SegmentSummary } from "@/features/practice/types/practiceSegmentTypes";
import { fmtTime } from "@/features/practice/utils/practiceFormat";
import { formatAttemptTime } from "@/features/practice/utils/resultFormat";
import { buildSegmentPath, formatScoreDelta } from "@/features/practice/utils/segmentFormat";

interface SegmentAttemptsCardProps {
  submissionId: string;
}

const STATUS_TEXT: Record<SegmentSummary["status"], string> = {
  PROCESSING: "Đang xử lý",
  COMPLETED: "Không có nốt để chấm",
  REJECTED: "Bản thu bị từ chối",
  FAILED: "Lỗi xử lý",
};

function scoreText(item: SegmentSummary): string {
  if (item.status !== "COMPLETED" || item.overall === null) return STATUS_TEXT[item.status];
  const delta = formatScoreDelta(item.baselineOverall, item.overall);
  return delta === null ? `${item.overall}%` : `${item.overall}% · ${delta}`;
}

// Các lần luyện đoạn của bản nộp (UC-03); tự ẩn khi chưa có lần nào
export function SegmentAttemptsCard({ submissionId }: SegmentAttemptsCardProps) {
  const navigate = useNavigate();
  const { items, hasMore, loading, loadMore } = useSegmentAttempts(submissionId, true);
  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-3 rounded-bvc-xl border border-bvc-border bg-white p-4 md:p-5.5">
      <h2 className="text-[15px] font-semibold text-bvc-ink">Các lần luyện đoạn</h2>
      <ul className="flex flex-col divide-y divide-bvc-border">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() =>
                navigate(
                  `${buildSegmentPath(submissionId, { start: item.startSec, end: item.endSec, countIn: false })}&attemptId=${encodeURIComponent(item.id)}`
                )
              }
              className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 py-2.5 text-left"
            >
              <span className="text-sm font-medium text-bvc-ink">
                {fmtTime(item.startSec)}–{fmtTime(item.endSec)} · {scoreText(item)}
              </span>
              <span className="shrink-0 text-xs text-bvc-muted">{formatAttemptTime(item.createdAt)}</span>
            </button>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          type="button"
          disabled={loading}
          onClick={loadMore}
          className="min-h-11 cursor-pointer self-start rounded-full border border-bvc-border px-4 text-sm font-medium text-bvc-ink"
        >
          Xem thêm
        </button>
      )}
    </section>
  );
}
