import { ArrowLeftRight } from "lucide-react";
import { BarTimeline, type BarAccuracy } from "@/features/practice/components/BarTimeline";
import { IssueCard } from "@/features/practice/components/IssueCard";
import { PracticeFrame } from "@/features/practice/components/PracticeFrame";
import { SAMPLE } from "@/features/practice/constants/practiceConstants";
import { MobileHeader } from "@/shared/components/bvc/MobileHeader";
import { ScoreBar } from "@/shared/components/bvc/ScoreBar";
import { ScoreRing } from "@/shared/components/bvc/ScoreRing";

const TIMELINE: { h: number; tone: BarAccuracy }[] = [
  { h: 88, tone: "ok" },
  { h: 94, tone: "ok" },
  { h: 90, tone: "ok" },
  { h: 82, tone: "ok" },
  { h: 96, tone: "ok" },
  { h: 85, tone: "ok" },
  { h: 79, tone: "ok" },
  { h: 88, tone: "ok" },
  { h: 76, tone: "attention" },
  { h: 71, tone: "attention" },
  { h: 84, tone: "ok" },
  { h: 58, tone: "bad" },
  { h: 52, tone: "bad" },
  { h: 61, tone: "bad" },
  { h: 55, tone: "bad" },
  { h: 73, tone: "attention" },
  { h: 86, tone: "ok" },
  { h: 62, tone: "bad" },
  { h: 59, tone: "bad" },
  { h: 57, tone: "bad" },
  { h: 64, tone: "bad" },
  { h: 60, tone: "bad" },
  { h: 66, tone: "bad" },
  { h: 45, tone: "bad" },
  { h: 81, tone: "ok" },
  { h: 89, tone: "ok" },
  { h: 92, tone: "ok" },
  { h: 87, tone: "ok" },
  { h: 78, tone: "attention" },
  { h: 74, tone: "attention" },
  { h: 72, tone: "attention" },
  { h: 75, tone: "attention" },
  { h: 90, tone: "ok" },
  { h: 93, tone: "ok" },
  { h: 85, tone: "ok" },
  { h: 91, tone: "ok" },
];

const ISSUES = [
  {
    id: "rhythm",
    rangeLabel: "18–24",
    title: "Sai nhịp / phách — 61%",
    description: "Vào sớm ở phách 3 lặp lại 6 lần",
    highlighted: true,
  },
  {
    id: "tempo",
    rangeLabel: "31–34",
    title: "Nhanh hơn bản mẫu 14%",
    description: "96 BPM so với 84 BPM yêu cầu",
    highlighted: false,
  },
  {
    id: "pitch",
    rangeLabel: "Bar 9",
    title: "Lệch cao độ — nốt Sol thấp 24¢",
    description: "Kiểm tra lại dây 4 trước khi luyện",
    highlighted: false,
  },
];

export function ResultsPage() {
  // TODO: mở màn luyện đoạn theo ô nhịp (màn hình chưa có spec)
  const openSectionPractice = () => {};
  // TODO: mở màn chi tiết bài tập để nộp (màn hình chưa có spec)
  const openAssignment = () => {};
  // TODO: mở màn so sánh với bản mẫu (màn hình chưa có spec)
  const openCompare = () => {};

  return (
    <PracticeFrame>
      <MobileHeader title="Kết quả phân tích" subtitle={`${SAMPLE.piece} · lần thu 14:32 · 2 phút 41`} />

      <div className="flex-1 overflow-y-auto px-3.5 pb-4">
        <section className="flex items-center gap-4.5 rounded-[22px] border border-bvc-border bg-white p-4.5">
          <ScoreRing score={82} size={110} strokeWidth={10} label="Độ chính xác" />
          <div className="flex flex-1 flex-col gap-2.75">
            <ScoreBar label="Cao độ" score={91} />
            <ScoreBar label="Nhịp / phách" score={74} />
            <ScoreBar label="Tempo" score={86} />
          </div>
        </section>

        <div className="mt-3.25">
          <BarTimeline bars={TIMELINE} rangeLabel="Bar 1 — 36" />
        </div>

        <p className="mt-3.25 text-sm font-bold text-bvc-ink">AI phát hiện {ISSUES.length} vấn đề</p>
        <div className="mt-2 flex flex-col gap-2">
          {ISSUES.map((issue) => (
            <IssueCard
              key={issue.id}
              rangeLabel={issue.rangeLabel}
              title={issue.title}
              description={issue.description}
              highlighted={issue.highlighted}
              onClick={openSectionPractice}
            />
          ))}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2.25 border-t border-bvc-border-strong bg-white px-3.5 pt-3.5 pb-5.5">
        <button
          type="button"
          onClick={openSectionPractice}
          className="flex min-h-12.5 w-full cursor-pointer items-center justify-center gap-2 rounded-bvc-lg bg-bvc-ink text-base font-bold text-white"
        >
          <ArrowLeftRight size={18} strokeWidth={2} />
          Luyện đoạn Bar 18–24
        </button>
        <div className="flex gap-2.25">
          <button
            type="button"
            onClick={openCompare}
            className="flex min-h-11.5 flex-1 cursor-pointer items-center justify-center rounded-[15px] border border-bvc-border-strong bg-bvc-surface text-sm font-semibold text-bvc-ink"
          >
            So với bản mẫu
          </button>
          <button
            type="button"
            onClick={openAssignment}
            className="flex min-h-11.5 flex-1 cursor-pointer items-center justify-center rounded-[15px] border border-bvc-border-strong bg-bvc-surface text-sm font-semibold text-bvc-ink"
          >
            Nộp bài
          </button>
        </div>
      </div>
    </PracticeFrame>
  );
}
