import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, ChevronUp, Video, X } from "lucide-react";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { BvcDialogPopup } from "@/shared/components/bvc/BvcDialogPopup";
import { Dialog, DialogClose, DialogTitle } from "@/shared/components/ui/dialog";
import { ReferenceTile } from "@/features/music-library/components/ReferenceTile";
import { SecondarySheetCard, sheetPillClass } from "@/features/music-library/components/SecondarySheetCard";
import { useSheetRecording } from "@/features/music-library/hooks/useSheetRecording";
import type { CategoryRef, SheetVersion } from "@/features/music-library/types/musicLibraryTypes";
import { formatDuration } from "@/features/music-library/utils/mediaUtils";
import { cn } from "@/shared/utils/cn";

const MAX_INLINE_SECONDARY = 5;

interface FeaturedSheetCardProps {
  instrument: CategoryRef;
  sheet: SheetVersion;
  isAssigned?: boolean;
  secondary: SheetVersion[];
  hrefOf: (sheet: SheetVersion) => string;
  practiceOf: (sheet: SheetVersion) => ReactNode;
}

export function FeaturedSheetCard({
  instrument,
  sheet,
  isAssigned = false,
  secondary,
  hrefOf,
  practiceOf,
}: FeaturedSheetCardProps) {
  const [isExpanded, setExpanded] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const usesModal = secondary.length > MAX_INLINE_SECONDARY;
  const practiceAction = practiceOf(sheet);
  const recording = useSheetRecording(sheet);
  const secondaryCards = secondary.map((item) => (
    <SecondarySheetCard key={item.id} sheet={item} viewerHref={hrefOf(item)} practiceAction={practiceOf(item)} />
  ));

  return (
    <article className="flex flex-col overflow-hidden rounded-[28px] border border-bvc-border/80 bg-white shadow-[0_12px_32px_-18px_rgb(18_63_51/0.35)]">
      <div className="flex flex-col gap-3.5 p-4 md:p-5">
        <ReferenceTile
          key={sheet.id}
          title={instrument.name}
          subtitle={sheet.name}
          recording={recording}
          badges={
            <>
              {isAssigned && (
                <span
                  className={cn(sheetPillClass, "border border-bvc-accent bg-white/80 font-semibold text-bvc-accent")}
                >
                  Bài tập của bạn
                </span>
              )}
              {sheet.isMain && (
                <span className={cn(sheetPillClass, "bg-bvc-ink font-semibold text-white")}>Bản chính · GV</span>
              )}
              <span className={cn(sheetPillClass, "bg-white/85 text-bvc-ink")}>{sheet.level.name}</span>
            </>
          }
        />

        {sheet.tutorialVideo && (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-bvc-ink">
            <Video className="size-4" strokeWidth={1.8} aria-hidden />
            Video hướng dẫn · <span className="font-bvc-mono">{formatDuration(sheet.tutorialVideo.durationSec)}</span>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-bvc-border/80 px-4 py-3 md:px-5">
        {practiceAction}
        <Link
          to={hrefOf(sheet)}
          className={
            practiceAction
              ? actionButtonClass("secondary", "sm", "hover:text-bvc-ink")
              : actionButtonClass("primary", "sm", "hover:text-white")
          }
        >
          Mở bản nhạc
        </Link>
        {secondary.length > 0 && (
          <button
            type="button"
            aria-expanded={usesModal ? undefined : isExpanded}
            aria-haspopup={usesModal ? "dialog" : undefined}
            onClick={() => (usesModal ? setModalOpen(true) : setExpanded((value) => !value))}
            className="ml-auto inline-flex min-h-10 cursor-pointer items-center gap-0.5 rounded-full px-1.5 text-[12.5px] font-semibold whitespace-nowrap text-bvc-ink transition-colors hover:bg-bvc-soft"
          >
            {isExpanded ? (
              "Thu gọn"
            ) : (
              <>
                Xem thêm <span className="font-bvc-mono">{secondary.length}</span> bản phụ
              </>
            )}
            {usesModal ? (
              <ChevronRight className="size-4 shrink-0 text-bvc-muted" aria-hidden />
            ) : isExpanded ? (
              <ChevronUp className="size-4 shrink-0 text-bvc-muted" aria-hidden />
            ) : (
              <ChevronDown className="size-4 shrink-0 text-bvc-muted" aria-hidden />
            )}
          </button>
        )}
      </div>

      {!usesModal && isExpanded && (
        <div className="flex flex-col gap-3 border-t border-bvc-border/80 bg-bvc-soft/70 p-3 md:p-4">
          {secondaryCards}
        </div>
      )}

      {usesModal && (
        <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
          <BvcDialogPopup className="max-w-[1040px] gap-0 p-0 sm:p-0">
            <div className="flex items-center gap-4 border-b border-bvc-border px-6 py-4 sm:px-[30px]">
              <DialogTitle className="min-w-0 flex-1 truncate text-[20px] leading-tight font-semibold tracking-[-0.02em] text-bvc-ink">
                Bản phụ · {instrument.name}
              </DialogTitle>
              <DialogClose
                aria-label="Đóng"
                className="-mr-2 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-bvc-muted transition-colors hover:bg-bvc-surface hover:text-bvc-ink"
              >
                <X className="size-5" aria-hidden />
              </DialogClose>
            </div>
            <div className="grid gap-3 overflow-y-auto bg-bvc-soft/70 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
              {secondaryCards}
            </div>
          </BvcDialogPopup>
        </Dialog>
      )}
    </article>
  );
}
