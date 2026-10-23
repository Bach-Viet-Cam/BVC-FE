import { ChevronRight, Music2, Scissors, Sparkles, X } from "lucide-react";
import {
  PracticeBottomSheet,
  PracticeSheetClose,
  PracticeSheetDescription,
  PracticeSheetTitle,
} from "@/features/practice/components/PracticeBottomSheet";
import { RESULT_MOCK } from "@/features/practice/constants/resultsMockData";

interface PracticeModeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFullSong: () => void;
  onSegment: () => void;
}

// "Luyện tập lại": chọn luyện cả bài hay một đoạn (AI gợi ý đoạn)
export function PracticeModeSheet({ open, onOpenChange, onFullSong, onSegment }: PracticeModeSheetProps) {
  return (
    <PracticeBottomSheet open={open} onOpenChange={onOpenChange}>
      <div className="flex flex-col gap-4 overflow-y-auto px-6 pt-4 pb-6">
        <header className="flex items-start justify-between gap-2">
          <div>
            <PracticeSheetTitle className="font-bvc-display text-xl font-bold tracking-tight text-bvc-ink">
              Chọn chế độ luyện tập
            </PracticeSheetTitle>
            <PracticeSheetDescription className="mt-1 text-xs leading-relaxed text-bvc-muted">
              Chọn cách bạn muốn ôn tập và cải thiện bài hát {RESULT_MOCK.pieceTitle}
            </PracticeSheetDescription>
          </div>
          <PracticeSheetClose
            aria-label="Đóng"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-bvc-surface text-bvc-muted"
          >
            <X className="size-4" strokeWidth={2.5} />
          </PracticeSheetClose>
        </header>

        <div className="flex flex-col gap-3.5 pt-2">
          <button
            type="button"
            onClick={onSegment}
            className="relative flex cursor-pointer items-center gap-3.5 rounded-2xl border-2 border-bvc-ink bg-bvc-soft p-4 text-left"
          >
            <span className="absolute -top-2.5 left-4 flex items-center gap-1 rounded-full bg-bvc-ink px-2.5 py-0.5 text-[10px] font-semibold text-white">
              <Sparkles className="size-3" aria-hidden />
              Khuyến nghị từ AI
            </span>
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-bvc-ink text-white">
              <Scissors className="size-6" strokeWidth={2} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-bvc-ink">Luyện tập theo phân đoạn</span>
              <span className="mt-0.5 block text-xs leading-snug text-bvc-muted">
                Tập trung sửa các ô nhịp có lỗi (như Bar 18–24 hoặc tùy chọn đoạn tuỳ ý)
              </span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-bvc-ink" strokeWidth={2.5} aria-hidden />
          </button>

          <button
            type="button"
            onClick={onFullSong}
            className="flex cursor-pointer items-center gap-3.5 rounded-2xl border border-bvc-border bg-white p-4 text-left hover:bg-bvc-soft"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-bvc-surface text-bvc-ink">
              <Music2 className="size-6" strokeWidth={2} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-bvc-ink">Luyện tập toàn bộ bài hát</span>
              <span className="mt-0.5 block text-xs leading-snug text-bvc-muted">
                Luyện từ đầu đến cuối ({RESULT_MOCK.durationLabel}) để kiểm tra độ ổn định
              </span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-bvc-faint" strokeWidth={2.5} aria-hidden />
          </button>
        </div>

        <PracticeSheetClose className="min-h-12 w-full cursor-pointer rounded-xl bg-bvc-surface text-sm font-semibold text-bvc-muted">
          Đóng
        </PracticeSheetClose>
      </div>
    </PracticeBottomSheet>
  );
}
