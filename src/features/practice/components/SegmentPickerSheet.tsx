import { useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { ChevronLeft, Info, Lightbulb, Music2, Play, X } from "lucide-react";
import {
  PracticeBottomSheet,
  PracticeSheetClose,
  PracticeSheetTitle,
} from "@/features/practice/components/PracticeBottomSheet";
import type { PitchChart, ResultIssue } from "@/features/practice/types/practiceResultTypes";
import { issuesInRange, segmentSuggestions } from "@/features/practice/utils/resultFormat";
import type { SegmentSuggestion } from "@/features/practice/utils/resultFormat";
import { fmtTime } from "@/features/practice/utils/practiceFormat";
import { cn } from "@/shared/utils/cn";

// Đoạn luyện theo giây của bản mẫu
export interface PracticeSegment {
  start: number;
  end: number;
  countIn: boolean;
}

interface SegmentPickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  onStart: (segment: PracticeSegment) => void;
  durationSec: number;
  issues: ResultIssue[];
  chart: PitchChart | null;
}

// Chưa có dữ liệu ô nhịp nên dải được chia thành các ô thời gian bằng nhau
const SLOT_COUNT = 36;
const QUIET_HEIGHT = 18;
const ISSUE_COLOR = { warn: "var(--color-bvc-warn)", bad: "var(--color-bvc-dot-warn)" };

const DOT_CLASS: Record<SegmentSuggestion["dot"], string> = {
  star: "",
  orange: "bg-bvc-dot-warn",
  grey: "bg-bvc-faint",
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Chiều cao mỗi ô = tỉ lệ khung có cao độ của bản mẫu trong ô (đoạn GV đang chơi thì cao, đoạn lặng thì thấp)
function slotHeights(chart: PitchChart | null, slotSec: number): number[] {
  return Array.from({ length: SLOT_COUNT }, (_, index) => {
    const points =
      chart?.points.filter(([seconds]) => seconds >= index * slotSec && seconds < (index + 1) * slotSec) ?? [];
    if (points.length === 0) return 50;
    const voiced = points.filter(([, teacherHz]) => teacherHz !== null).length / points.length;
    return Math.round(QUIET_HEIGHT + voiced * (90 - QUIET_HEIGHT));
  });
}

// Ô có lỗi cao độ tô đậm hơn ô chỉ lệch nhịp
function slotIssues(issues: ResultIssue[], slotSec: number): Record<number, "warn" | "bad"> {
  const marks: Record<number, "warn" | "bad"> = {};
  for (let slot = 1; slot <= SLOT_COUNT; slot += 1) {
    const inSlot = issuesInRange(issues, (slot - 1) * slotSec, slot * slotSec);
    if (inSlot.some((issue) => issue.kind === "pitch")) marks[slot] = "bad";
    else if (inSlot.length > 0) marks[slot] = "warn";
  }
  return marks;
}

// Chọn đoạn luyện tập: gợi ý từ các lỗi đã phân tích hoặc kéo hai tay nắm trên dải thời gian
export function SegmentPickerSheet({
  open,
  onOpenChange,
  onBack,
  onStart,
  durationSec,
  issues,
  chart,
}: SegmentPickerSheetProps) {
  const totalBars = SLOT_COUNT;
  const slotSec = Math.max(durationSec, 1) / SLOT_COUNT;
  const toSlotRange = (start: number, end: number) => {
    const first = clamp(Math.floor(start / slotSec) + 1, 1, SLOT_COUNT);
    return { start: first, end: clamp(Math.ceil(end / slotSec), first, SLOT_COUNT) };
  };
  const suggestions = useMemo(() => segmentSuggestions(issues, durationSec), [issues, durationSec]);
  const heights = useMemo(() => slotHeights(chart, slotSec), [chart, slotSec]);
  const marks = useMemo(() => slotIssues(issues, slotSec), [issues, slotSec]);
  const [range, setRange] = useState(() => toSlotRange(suggestions[0].start, suggestions[0].end));
  const [countIn, setCountIn] = useState(true);
  const track = useRef<HTMLDivElement | null>(null);

  const barAt = (clientX: number) => {
    const box = track.current?.getBoundingClientRect();
    if (!box) return 1;
    return clamp(((clientX - box.left) / box.width) * totalBars, 0, totalBars);
  };

  const dragStart = (event: PointerEvent<HTMLElement>) => {
    if (event.buttons === 0) return;
    const bar = clamp(Math.floor(barAt(event.clientX)) + 1, 1, range.end);
    setRange((current) => ({ ...current, start: bar }));
  };

  const dragEnd = (event: PointerEvent<HTMLElement>) => {
    if (event.buttons === 0) return;
    const bar = clamp(Math.ceil(barAt(event.clientX)), range.start, totalBars);
    setRange((current) => ({ ...current, end: bar }));
  };

  const startSec = Math.round((range.start - 1) * slotSec);
  const endSec = Math.round(range.end * slotSec);
  const issueCount = issuesInRange(issues, startSec, endSec).length;
  const left = ((range.start - 1) / totalBars) * 100;
  const width = ((range.end - range.start + 1) / totalBars) * 100;
  const rangeLabel = `${fmtTime(startSec)} - ${fmtTime(endSec)}`;

  return (
    <PracticeBottomSheet open={open} onOpenChange={onOpenChange}>
      <header className="flex shrink-0 items-center justify-between border-b border-bvc-border px-5 py-3">
        <button
          type="button"
          aria-label="Quay lại"
          onClick={onBack}
          className="flex size-10 cursor-pointer items-center justify-center rounded-full text-bvc-muted hover:bg-bvc-surface"
        >
          <ChevronLeft className="size-5" strokeWidth={2.5} />
        </button>
        <PracticeSheetTitle className="font-bvc-display text-base font-bold tracking-tight text-bvc-ink">
          Chọn đoạn luyện tập
        </PracticeSheetTitle>
        <PracticeSheetClose
          aria-label="Đóng"
          className="flex size-10 cursor-pointer items-center justify-center rounded-full text-bvc-faint hover:bg-bvc-surface"
        >
          <X className="size-5" strokeWidth={2.5} />
        </PracticeSheetClose>
      </header>

      <div className="flex flex-col gap-5 overflow-y-auto px-5 pt-4 pb-3">
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-bvc-muted uppercase">
              <Lightbulb className="size-3.5 text-bvc-ink" aria-hidden />
              Gợi ý tối ưu từ AI
            </span>
            <span className="text-[11px] font-semibold text-bvc-ink">{suggestions.length} đề xuất</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => {
              const slots = toSlotRange(suggestion.start, suggestion.end);
              const selected = slots.start === range.start && slots.end === range.end;
              return (
                <button
                  key={suggestion.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setRange(slots)}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold",
                    selected
                      ? "border-bvc-ink bg-bvc-soft text-bvc-ink ring-1 ring-bvc-ink/20"
                      : "border-bvc-border bg-white font-medium text-bvc-muted hover:bg-bvc-soft"
                  )}
                >
                  {suggestion.dot === "star" ? (
                    <span aria-hidden>⭐</span>
                  ) : (
                    <span aria-hidden className={cn("size-1.5 rounded-full", DOT_CLASS[suggestion.dot])} />
                  )}
                  {suggestion.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-bvc-border bg-bvc-soft p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-bvc-ink">Kéo chọn đoạn cần luyện</span>
            <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-bvc-ink">{rangeLabel}</span>
          </div>

          <div
            ref={track}
            className="relative my-3 flex h-24 touch-none items-center rounded-xl border border-bvc-border bg-white px-1 select-none"
          >
            <div className="flex h-16 w-full items-center justify-between gap-[2px] px-1">
              {heights.map((height, index) => {
                const bar = index + 1;
                const inRange = bar >= range.start && bar <= range.end;
                const issue = marks[bar];
                return (
                  <span
                    key={bar}
                    className="w-1 rounded-full"
                    style={{
                      height: `${height}%`,
                      backgroundColor: inRange && issue ? ISSUE_COLOR[issue] : "var(--color-bvc-ink)",
                      opacity: inRange ? 1 : 0.22,
                    }}
                  />
                );
              })}
            </div>

            <div
              className="pointer-events-none absolute inset-y-0 border-y-2 border-bvc-ink bg-bvc-ink/10"
              style={{ left: `${left}%`, width: `${width}%` }}
            >
              <span
                role="slider"
                aria-label="Điểm bắt đầu"
                aria-valuemin={1}
                aria-valuemax={range.end}
                aria-valuenow={range.start}
                onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
                onPointerMove={dragStart}
                className="pointer-events-auto absolute top-1/2 -left-2.5 flex h-16 w-5 -translate-y-1/2 cursor-ew-resize flex-col items-center justify-center gap-0.5 rounded-md bg-bvc-ink shadow-md"
              >
                <span className="h-4 w-0.5 rounded-full bg-white/70" />
                <span className="h-4 w-0.5 rounded-full bg-white/70" />
              </span>
              <span
                role="slider"
                aria-label="Điểm kết thúc"
                aria-valuemin={range.start}
                aria-valuemax={totalBars}
                aria-valuenow={range.end}
                onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
                onPointerMove={dragEnd}
                className="pointer-events-auto absolute top-1/2 -right-2.5 flex h-16 w-5 -translate-y-1/2 cursor-ew-resize flex-col items-center justify-center gap-0.5 rounded-md bg-bvc-ink shadow-md"
              >
                <span className="h-4 w-0.5 rounded-full bg-white/70" />
                <span className="h-4 w-0.5 rounded-full bg-white/70" />
              </span>
            </div>

            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-red-500"
              style={{ left: `${left + width / 2}%` }}
            />
          </div>

          <div className="flex items-center justify-between px-0.5 text-[10px] font-semibold text-bvc-faint">
            <span>00:00</span>
            <span className="rounded border border-bvc-border bg-white px-1.5 py-0.5 font-bold text-bvc-ink">
              {fmtTime(startSec)} - {fmtTime(endSec)}
            </span>
            <span>{fmtTime(durationSec)}</span>
          </div>

          <div className="mt-3 flex items-start gap-2.5 border-t border-bvc-border pt-3 text-xs text-bvc-muted">
            <span className="mt-0.5 shrink-0 rounded-md bg-white p-1 text-bvc-ink">
              <Info className="size-4" aria-hidden />
            </span>
            <p className="leading-relaxed">
              <strong className="text-bvc-ink">Đã chọn: {rangeLabel}</strong> (khoảng {Math.max(0, endSec - startSec)}{" "}
              giây) · Có{" "}
              <span className="font-semibold text-bvc-dot-warn underline decoration-bvc-dot-warn/40">
                {issueCount} lỗi cao độ &amp; nhịp
              </span>{" "}
              cần tập trung cải thiện.
            </p>
          </div>
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-bvc-border bg-white p-3.5">
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-bvc-soft text-bvc-ink">
              <Music2 className="size-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-bvc-ink">Phát âm mẫu đệm trước (Count-in 1 bar)</span>
              <span className="block text-[11px] text-bvc-faint">Gõ nhịp 4 phách dẫn vào chuẩn tempo</span>
            </span>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={countIn}
            onChange={(event) => setCountIn(event.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className={cn(
              "relative h-7 w-12 shrink-0 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-bvc-ink/40",
              countIn ? "bg-bvc-ink" : "bg-bvc-border-strong"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-6 rounded-full bg-white transition-[left]",
                countIn ? "left-[22px]" : "left-0.5"
              )}
            />
          </span>
        </label>
      </div>

      <div className="shrink-0 border-t border-bvc-border px-5 pt-3 pb-5">
        <button
          type="button"
          onClick={() => onStart({ start: startSec, end: endSec, countIn })}
          className="flex min-h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-bvc-ink text-base font-bold text-white"
        >
          <Play className="size-5 fill-current" aria-hidden />
          Bắt đầu luyện tập
        </button>
      </div>
    </PracticeBottomSheet>
  );
}
