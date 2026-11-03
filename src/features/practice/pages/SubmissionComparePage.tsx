import { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { NoticeBanner } from "@/features/practice/components/NoticeBanner";
import {
  NewerLineSwatch,
  OlderLineSwatch,
  SubmissionCompareChart,
  TeacherLineSwatch,
} from "@/features/practice/components/SubmissionCompareChart";
import { SubmissionPageTitle } from "@/features/practice/components/SubmissionPageTitle";
import { MSG_25, MSG_27, MSG_28 } from "@/features/practice/constants/practiceConstants";
import { useSubmissionCompare } from "@/features/practice/hooks/useSubmissionCompare";
import type { CompareSegment, CompareSide } from "@/features/practice/types/submissionHistoryTypes";
import { formatSubmittedDay } from "@/features/practice/utils/submissionHistory";
import { formatLabelChange, formatSegmentRange } from "@/features/practice/utils/submissionCompare";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { cn } from "@/shared/utils/cn";

const HIGHLIGHT_MS = 1500;
const KIND_LABEL: Record<CompareSegment["kind"], string> = { pitch: "Cao độ", rhythm: "Nhịp" };

const LINES = [
  { key: "teacher", label: "Bản mẫu", Swatch: TeacherLineSwatch },
  { key: "older", label: "Bài cũ hơn", Swatch: OlderLineSwatch },
  { key: "newer", label: "Bài mới hơn", Swatch: NewerLineSwatch },
] as const;

const segmentDomId = (id: string) => `compare-segment-${id}`;

function SummaryCard({ side, item }: { side: "older" | "newer"; item: CompareSide }) {
  return (
    <div className="flex flex-col gap-2 rounded-bvc-xl border border-bvc-border bg-white px-3.5 py-3.5">
      <div className="flex items-center gap-2">
        {side === "older" ? <OlderLineSwatch /> : <NewerLineSwatch />}
        <span className="text-[12.5px] font-semibold">{side === "older" ? "Bài cũ hơn" : "Bài mới hơn"}</span>
      </div>
      <div className="flex flex-col gap-px">
        <span className="truncate text-sm font-medium">Lần nộp #{item.attemptNo}</span>
        <span className="text-[12.5px] text-bvc-muted">{formatSubmittedDay(item.submittedAt)}</span>
      </div>
      <span
        className={cn(
          "min-w-[52px] self-start rounded-xl bg-bvc-soft px-2.5 py-[5px] text-center font-bvc-mono text-[19px] font-medium",
          side === "newer" ? "text-bvc-dot-ok" : "text-bvc-muted"
        )}
      >
        {item.accuracy}%
      </span>
    </div>
  );
}

function SummarySkeleton() {
  return <div className="h-[132px] animate-pulse rounded-bvc-xl border border-bvc-border bg-bvc-soft" aria-hidden />;
}

function RepeatedPill() {
  return (
    <span className="shrink-0 rounded-full border border-bvc-accent-border bg-bvc-accent-tint px-2.25 py-0.5 text-[11.5px] font-semibold text-bvc-accent-text">
      Lỗi lặp lại
    </span>
  );
}

function ImprovedPill() {
  return (
    <span className="shrink-0 rounded-full bg-bvc-dot-ok px-2.5 py-[3px] text-[11.5px] font-semibold text-white">
      Đã cải thiện
    </span>
  );
}

interface SegmentCardProps {
  segment: CompareSegment;
  highlighted: boolean;
  onPractice: (segment: CompareSegment) => void;
}

function SegmentCard({ segment, highlighted, onPractice }: SegmentCardProps) {
  const range = formatSegmentRange(segment.startSec, segment.endSec);
  const change = formatLabelChange(segment.olderLabel, segment.newerLabel);
  const detail = (
    <span className="text-[12.5px] text-bvc-muted">
      {KIND_LABEL[segment.kind]}
      {change ? ` · ${change}` : ""}
    </span>
  );
  const ring = highlighted ? "ring-2 ring-bvc-dot-ok" : "";

  if (segment.status === "REPEATED") {
    return (
      <div
        id={segmentDomId(segment.id)}
        className={cn(
          "flex flex-col gap-2.25 rounded-bvc-lg border border-bvc-accent-border bg-bvc-accent-tint px-3.25 py-3 transition-shadow",
          ring
        )}
      >
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm font-semibold">{range}</span>
            {detail}
          </div>
          <RepeatedPill />
        </div>
        <p className="text-[12.5px] leading-snug text-bvc-accent-text">{MSG_28}</p>
        <button
          type="button"
          onClick={() => onPractice(segment)}
          className="flex min-h-11 cursor-pointer items-center justify-between rounded-full border border-bvc-border-strong bg-white pr-3 pl-3.5 text-sm font-medium text-bvc-ink"
        >
          Luyện đoạn này
          <ChevronRight className="size-[18px] shrink-0" strokeWidth={1.8} aria-hidden />
        </button>
      </div>
    );
  }

  if (segment.status === "IMPROVED") {
    return (
      <div
        id={segmentDomId(segment.id)}
        className={cn(
          "flex items-start justify-between gap-2.5 rounded-bvc-lg border border-bvc-border bg-white p-3.25 transition-shadow",
          ring
        )}
      >
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm font-medium">{range}</span>
          {detail}
        </div>
        <ImprovedPill />
      </div>
    );
  }

  // Lỗi chỉ có ở bài mới hơn: không nhãn (GBR-18)
  return (
    <div
      id={segmentDomId(segment.id)}
      className={cn(
        "flex flex-col gap-0.5 rounded-bvc-lg border border-bvc-border bg-white px-3.25 py-3 transition-shadow",
        ring
      )}
    >
      <span className="text-sm font-medium">{range}</span>
      <span className="text-[12.5px] text-bvc-muted">
        Lỗi ở bài mới hơn · {KIND_LABEL[segment.kind]}
        {segment.newerLabel ? ` · ${segment.newerLabel}` : ""}
      </span>
    </div>
  );
}

// SCR-02 So sánh bài nộp (UC 1.4 bước 5-11).
// GBR-17: bài cũ hơn (đường nét đứt) và bài mới hơn (đường liền). GBR-18: gắn nhãn đoạn lỗi theo hai bài.
export function SubmissionComparePage() {
  const { invalid, data, loading, error, reload, backToSelect, practiceSegment } = useSubmissionCompare();
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [visible, setVisible] = useState({ teacher: true, older: true, newer: true });
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    []
  );

  // Chạm một dải trên biểu đồ: cuộn tới thẻ đoạn tương ứng và nhấn mạnh viền một lúc
  function selectSegment(id: string) {
    document.getElementById(segmentDomId(id))?.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedId(id);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setHighlightedId(null), HIGHLIGHT_MS);
  }

  return (
    <StudentShell>
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-3 px-[18px] pt-5 pb-6 md:gap-4 md:px-14 md:pt-8">
        <SubmissionPageTitle
          title="So sánh bài nộp"
          subtitle={data ? `${data.piece.title} · ${data.sheetMusic.name}` : undefined}
          onBack={backToSelect}
        />

        {invalid && <p className="px-6 pt-10 text-center text-sm text-bvc-muted">{MSG_25}</p>}

        {!invalid && loading && (
          <div className="flex flex-col gap-3" aria-busy>
            <div className="grid grid-cols-2 gap-2.5 md:gap-4">
              <SummarySkeleton />
              <SummarySkeleton />
            </div>
            <div className="h-[260px] animate-pulse rounded-bvc-xl border border-bvc-border bg-bvc-soft" aria-hidden />
          </div>
        )}

        {!invalid && !loading && error && (
          <div className="flex flex-col items-center gap-3 px-6 pt-10 text-center">
            <p className="text-sm text-bvc-muted" role="alert">
              {error}
            </p>
            <button
              type="button"
              onClick={reload}
              className="min-h-11 cursor-pointer rounded-full border border-bvc-border-strong bg-white px-5 text-sm font-medium text-bvc-ink"
            >
              Thử lại
            </button>
          </div>
        )}

        {data && (
          <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-6">
            <div className="flex min-w-0 flex-col gap-3 md:gap-4">
              <div className="grid shrink-0 grid-cols-2 gap-2.5 md:gap-4">
                <SummaryCard side="older" item={data.older} />
                <SummaryCard side="newer" item={data.newer} />
              </div>

              <section className="flex shrink-0 flex-col gap-2.5 rounded-bvc-xl border border-bvc-border bg-white px-3 pt-4 pb-3.5">
                <h2 className="px-1 text-sm font-semibold">Cao độ theo thời gian</h2>
                <SubmissionCompareChart
                  chart={data.chart}
                  segments={data.segments}
                  selectedId={highlightedId}
                  visible={visible}
                  onSelectSegment={selectSegment}
                />
                <div className="flex flex-col gap-2 px-1">
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-bvc-muted">
                    {LINES.map(({ key, label, Swatch }) => (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={visible[key]}
                        onClick={() => setVisible((current) => ({ ...current, [key]: !current[key] }))}
                        className={cn(
                          "flex min-h-9 cursor-pointer items-center gap-[7px] rounded-full px-1",
                          !visible[key] && "line-through opacity-45"
                        )}
                      >
                        <Swatch />
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ImprovedPill />
                    <RepeatedPill />
                  </div>
                </div>
              </section>
            </div>

            <section className="flex shrink-0 flex-col gap-2 lg:sticky lg:top-6">
              <h2 className="text-sm font-semibold">Các đoạn lỗi</h2>
              {data.noSegmentsToCompare && <NoticeBanner message={MSG_27} />}
              {data.segments.map((segment) => (
                <SegmentCard
                  key={segment.id}
                  segment={segment}
                  highlighted={segment.id === highlightedId}
                  onPractice={practiceSegment}
                />
              ))}
            </section>
          </div>
        )}
      </div>

      <footer className="sticky bottom-0 z-10 border-t border-bvc-border-strong bg-white">
        <div className="mx-auto flex w-full max-w-[1200px] justify-end px-[18px] pt-3.5 pb-6 md:px-14 md:py-4">
          <button
            type="button"
            onClick={backToSelect}
            className="flex min-h-[50px] w-full cursor-pointer items-center justify-center rounded-2xl border border-bvc-border-strong bg-bvc-soft text-[15px] font-medium text-bvc-ink md:w-auto md:min-w-64 md:px-8"
          >
            Chọn bài khác
          </button>
        </div>
      </footer>
    </StudentShell>
  );
}
