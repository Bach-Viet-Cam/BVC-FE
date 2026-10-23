import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import { ChevronLeft, Info, Lightbulb, Music2, Play, X } from "lucide-react";
import {
  PracticeBottomSheet,
  PracticeSheetClose,
  PracticeSheetTitle,
} from "@/features/practice/components/PracticeBottomSheet";
import { RESULT_MOCK } from "@/features/practice/constants/resultsMockData";
import type { SegmentSuggestion } from "@/features/practice/constants/resultsMockData";
import { fmtTime } from "@/features/practice/utils/practiceFormat";
import { cn } from "@/shared/utils/cn";

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
}

const { totalBars, durationSec, segments } = RESULT_MOCK;
const SECONDS_PER_BAR = durationSec / totalBars;

// Dạng sóng mẫu: chiều cao giả lập theo ô nhịp, một số ô lỗi (TODO(BE): lấy từ phân tích thật)
const BAR_HEIGHTS = Array.from({ length: totalBars }, (_, index) => 22 + ((index * 37) % 60));
const BAR_ISSUES: Record<number, "warn" | "bad"> = {
  19: "warn",
  20: "warn",
  22: "bad",
  23: "warn",
  31: "bad",
  33: "warn",
};
const ISSUE_COLOR = { warn: "var(--color-bvc-warn)", bad: "var(--color-bvc-dot-warn)" };

const DOT_CLASS: Record<SegmentSuggestion["dot"], string> = {
  star: "",
  orange: "bg-bvc-dot-warn",
  grey: "bg-bvc-faint",
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Chọn đoạn luyện tập: gợi ý của AI hoặc kéo hai tay nắm trên dạng sóng (dữ liệu mẫu)
export function SegmentPickerSheet({ open, onOpenChange, onBack, onStart }: SegmentPickerSheetProps) {
  const [range, setRange] = useState(segments.defaultRange);
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

  const startSec = Math.round((range.start - 1) * SECONDS_PER_BAR);
  const endSec = Math.round(range.end * SECONDS_PER_BAR);
  const left = ((range.start - 1) / totalBars) * 100;
  const width = ((range.end - range.start + 1) / totalBars) * 100;
  const rangeLabel = range.start === range.end ? `Bar ${range.start}` : `Bar ${range.start} – ${range.end}`;

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
            <span className="text-[11px] font-semibold text-bvc-ink">{segments.suggestions.length} đề xuất</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {segments.suggestions.map((suggestion) => {
              const selected = suggestion.start === range.start && suggestion.end === range.end;
              return (
                <button
                  key={suggestion.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setRange({ start: suggestion.start, end: suggestion.end })}
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
            <span className="text-xs font-bold text-bvc-ink">Kéo chọn dải ô nhịp cần luyện</span>
            <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-bvc-ink">{rangeLabel}</span>
          </div>

          <div
            ref={track}
            className="relative my-3 flex h-24 touch-none items-center rounded-xl border border-bvc-border bg-white px-1 select-none"
          >
            <div className="flex h-16 w-full items-center justify-between gap-[2px] px-1">
              {BAR_HEIGHTS.map((height, index) => {
                const bar = index + 1;
                const inRange = bar >= range.start && bar <= range.end;
                const issue = BAR_ISSUES[bar];
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
                aria-label="Bar bắt đầu"
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
                aria-label="Bar kết thúc"
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
            <span>00:00 (Bar 1)</span>
            <span className="rounded border border-bvc-border bg-white px-1.5 py-0.5 font-bold text-bvc-ink">
              {fmtTime(startSec)} — {fmtTime(endSec)}
            </span>
            <span>
              {fmtTime(durationSec)} (Bar {totalBars})
            </span>
          </div>

          <div className="mt-3 flex items-start gap-2.5 border-t border-bvc-border pt-3 text-xs text-bvc-muted">
            <span className="mt-0.5 shrink-0 rounded-md bg-white p-1 text-bvc-ink">
              <Info className="size-4" aria-hidden />
            </span>
            <p className="leading-relaxed">
              <strong className="text-bvc-ink">Đã chọn: {rangeLabel}</strong> (khoảng {Math.max(0, endSec - startSec)}{" "}
              giây) · Có{" "}
              <span className="font-semibold text-bvc-dot-warn underline decoration-bvc-dot-warn/40">
                {segments.issuesInRange} lỗi nhịp &amp; tempo
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
          onClick={() => onStart({ ...range, countIn })}
          className="flex min-h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-bvc-ink text-base font-bold text-white"
        >
          <Play className="size-5 fill-current" aria-hidden />
          Bắt đầu luyện tập
        </button>
      </div>
    </PracticeBottomSheet>
  );
}
