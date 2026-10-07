import { cn } from "@/shared/utils/cn";
import type { Song, TeacherNote } from "@/features/practice/types/practiceTypes";

interface SheetViewerProps {
  song: Song;
  teacherNote: TeacherNote;
  barRange: { start: number; end: number };
  onMyNotes: () => void;
  onBookmark: () => void;
}

const STAFF_LINES = 5;

function StaffGroup() {
  return (
    <div className="flex flex-col gap-[11px]">
      {Array.from({ length: STAFF_LINES }).map((_, i) => (
        <div key={i} className="h-px bg-bvc-bar" />
      ))}
    </div>
  );
}

export function SheetViewer({
  song,
  teacherNote,
  barRange,
  onMyNotes,
  onBookmark,
}: SheetViewerProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-bvc-xl border border-bvc-border-strong bg-white">
      {/* Sheet content */}
      <div className="flex flex-1 flex-col gap-[13px] overflow-hidden p-[18px_16px]">
        <div className="text-[14px] font-bold leading-tight tracking-[-0.01em] text-bvc-ink">
          Bản nhạc PDF · {song.title} ({song.instrument})
        </div>

        {/* Staff line groups — placeholder for PDF render */}
        <StaffGroup />
        <StaffGroup />

        {/* Teacher annotation */}
        <div className="flex items-start gap-[10px] rounded-bvc-md border border-bvc-border-strong bg-bvc-surface p-[11px_12px]">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-[1px] shrink-0 text-bvc-muted"
          >
            <path d="M16.5 3.5 20.5 7.5 8 20H4v-4z" />
          </svg>
          <div className="flex flex-col gap-[3px]">
            <div className="text-[13px] font-bold text-bvc-ink">
              Ghi chú của {teacherNote.teacherName} · ô nhịp {teacherNote.barNumber}
            </div>
            <div className="text-[13.5px] leading-[1.45] text-bvc-ink">
              {teacherNote.content}
            </div>
          </div>
        </div>
      </div>

      {/* Sheet footer */}
      <div className="flex shrink-0 items-center justify-between border-t border-bvc-border bg-bvc-surface px-[14px] py-[9px]">
        <button
          type="button"
          onClick={onMyNotes}
          className={cn(
            "min-h-[34px] cursor-pointer rounded-bvc-sm border border-bvc-border-strong bg-white px-[12px]",
            "text-[13px] font-semibold text-bvc-ink"
          )}
        >
          Ghi chú của tôi
        </button>

        <span className="font-bvc-mono text-[13px] text-bvc-muted">
          Bar {barRange.start} — {barRange.end}
        </span>

        <button
          type="button"
          onClick={onBookmark}
          className={cn(
            "min-h-[34px] cursor-pointer rounded-bvc-sm border border-bvc-border-strong bg-white px-[12px]",
            "text-[13px] font-semibold text-bvc-ink"
          )}
        >
          Đánh dấu
        </button>
      </div>
    </div>
  );
}
