import { ChevronRight } from "lucide-react";
import {
  NewerLineSwatch,
  OlderLineSwatch,
  SubmissionCompareChart,
} from "@/features/practice/components/SubmissionCompareChart";
import { SubmissionPageTitle } from "@/features/practice/components/SubmissionPageTitle";
import { COMPARE_SEGMENTS, COMPARE_TOTAL_BARS, MSG_28 } from "@/features/practice/constants/submissionHistoryMockData";
import { useSubmissionCompare } from "@/features/practice/hooks/useSubmissionCompare";
import type { CompareSegment, SubmissionCompareItem } from "@/features/practice/types/submissionHistoryTypes";
import { formatSubmittedDay } from "@/features/practice/utils/submissionHistory";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { cn } from "@/shared/utils/cn";

const SEGMENT_ORDER: Record<CompareSegment["status"], number> = { REPEATED: 0, IMPROVED: 1, NEW: 2 };

interface SummaryCardProps {
  side: "older" | "newer";
  item: SubmissionCompareItem;
}

function SummaryCard({ side, item }: SummaryCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-[18px] border border-bvc-border bg-white px-3.5 py-3.5">
      <div className="flex items-center gap-2">
        {side === "older" ? <OlderLineSwatch /> : <NewerLineSwatch />}
        <span className="text-[12.5px] font-bold">{side === "older" ? "Bài cũ hơn" : "Bài mới hơn"}</span>
      </div>
      <div className="flex flex-col gap-px">
        <span className="truncate text-sm font-semibold">{item.title}</span>
        <span className="text-[12.5px] text-bvc-muted">{formatSubmittedDay(item.submittedAt)}</span>
      </div>
      <span
        className={cn(
          "min-w-[52px] self-start rounded-xl bg-bvc-soft px-2.5 py-[5px] text-center font-bvc-mono text-[19px] font-semibold",
          side === "newer" ? "text-bvc-dot-ok" : "text-bvc-muted"
        )}
      >
        {item.accuracy}%
      </span>
    </div>
  );
}

function RepeatedPill() {
  return (
    <span className="shrink-0 rounded-full border border-bvc-accent-border bg-bvc-accent-tint px-2.25 py-0.5 text-[11.5px] font-bold text-bvc-accent-text">
      Lỗi lặp lại
    </span>
  );
}

function ImprovedPill() {
  return (
    <span className="shrink-0 rounded-full bg-bvc-dot-ok px-2.5 py-[3px] text-[11.5px] font-bold text-white">
      Đã cải thiện
    </span>
  );
}

function SegmentCard({ segment, onPractice }: { segment: CompareSegment; onPractice: () => void }) {
  if (segment.status === "REPEATED") {
    return (
      <div className="flex flex-col gap-2.25 rounded-bvc-lg border border-bvc-accent-border bg-bvc-accent-tint px-3.25 py-3">
        <div className="flex items-center justify-between gap-2.5">
          <span className="text-sm font-bold">{segment.barLabel}</span>
          <RepeatedPill />
        </div>
        <p className="text-[12.5px] leading-snug text-bvc-accent-text">{MSG_28}</p>
        <button
          type="button"
          onClick={onPractice}
          className="flex min-h-11 cursor-pointer items-center justify-between rounded-[13px] border border-bvc-border-strong bg-white pr-3 pl-3.5 text-sm font-semibold text-bvc-ink"
        >
          Luyện đoạn này
          <ChevronRight className="size-[18px] shrink-0" strokeWidth={1.8} aria-hidden />
        </button>
      </div>
    );
  }

  if (segment.status === "IMPROVED") {
    return (
      <div className="flex items-center justify-between gap-2.5 rounded-bvc-lg border border-bvc-border bg-white p-3.25">
        <span className="text-sm font-semibold">{segment.barLabel}</span>
        <ImprovedPill />
      </div>
    );
  }

  // Lỗi chỉ có ở bài mới hơn: không nhãn (GBR-18)
  return (
    <div className="flex flex-col gap-0.5 rounded-bvc-lg border border-bvc-border bg-white px-3.25 py-3">
      <span className="text-sm font-semibold">{segment.barLabel}</span>
      <span className="text-[12.5px] text-bvc-muted">Lỗi ở bài mới hơn</span>
    </div>
  );
}

// SCR-02 So sánh bài nộp (UC 1.4 bước 5-11). MOCKUP: dữ liệu mẫu cố định, chưa nối API.
// GBR-17: bài cũ hơn (đường nét đứt) và bài mới hơn (đường liền). GBR-18: gắn nhãn đoạn lỗi theo hai bài.
export function SubmissionComparePage() {
  const { older, newer, backToSelect, practiceSegment } = useSubmissionCompare();
  const segments = [...COMPARE_SEGMENTS].sort((a, b) => SEGMENT_ORDER[a.status] - SEGMENT_ORDER[b.status]);

  return (
    <StudentShell>
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-3 px-[18px] pt-5 pb-6 md:gap-4 md:px-14 md:pt-8">
        <SubmissionPageTitle
          title="So sánh bài nộp"
          subtitle={
            older && newer ? (older.pieceId === newer.pieceId ? newer.pieceTitle : "Hai bài hát khác nhau") : undefined
          }
          onBack={backToSelect}
        />

        {older && newer ? (
          <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-6">
            <div className="flex min-w-0 flex-col gap-3 md:gap-4">
              <div className="grid shrink-0 grid-cols-2 gap-2.5 md:gap-4">
                <SummaryCard side="older" item={older} />
                <SummaryCard side="newer" item={newer} />
              </div>

              <section className="flex shrink-0 flex-col gap-2.5 rounded-bvc-xl border border-bvc-border bg-white px-3 pt-4 pb-3.5">
                <div className="flex items-baseline justify-between px-1">
                  <h2 className="text-sm font-bold">Cao độ theo thời gian</h2>
                  <span className="font-bvc-mono text-xs text-bvc-muted">Bar 1 - {COMPARE_TOTAL_BARS}</span>
                </div>
                <SubmissionCompareChart />
                <div className="flex flex-col gap-2 px-1">
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-bvc-muted">
                    <span className="flex items-center gap-[7px]">
                      <OlderLineSwatch />
                      Bài cũ hơn
                    </span>
                    <span className="flex items-center gap-[7px]">
                      <NewerLineSwatch />
                      Bài mới hơn
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ImprovedPill />
                    <RepeatedPill />
                  </div>
                </div>
              </section>
            </div>

            <section className="flex shrink-0 flex-col gap-2 lg:sticky lg:top-6">
              <h2 className="text-sm font-bold">Các đoạn lỗi</h2>
              {segments.map((segment) => (
                <SegmentCard key={segment.id} segment={segment} onPractice={practiceSegment} />
              ))}
            </section>
          </div>
        ) : (
          <p className="px-6 pt-10 text-center text-sm text-bvc-muted">Vui lòng chọn 2 bài nộp khác nhau để so sánh.</p>
        )}
      </div>

      <footer className="sticky bottom-0 z-10 border-t border-bvc-border-strong bg-white">
        <div className="mx-auto flex w-full max-w-[1200px] justify-end px-[18px] pt-3.5 pb-6 md:px-14 md:py-4">
          <button
            type="button"
            onClick={backToSelect}
            className="flex min-h-[50px] w-full cursor-pointer items-center justify-center rounded-2xl border border-bvc-border-strong bg-bvc-soft text-[15px] font-semibold text-bvc-ink md:w-auto md:min-w-64 md:px-8"
          >
            Chọn bài khác
          </button>
        </div>
      </footer>
    </StudentShell>
  );
}
