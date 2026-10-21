import { ChevronRight } from "lucide-react";
import { CentsMeter } from "@/features/practice/components/CentsMeter";
import { centsColor } from "@/features/practice/utils/tunerColor";
import { CollapsibleCard } from "@/features/practice/components/CollapsibleCard";
import { NoticeBanner } from "@/features/practice/components/NoticeBanner";
import { MSG, TUNER_TOLERANCE_CENTS } from "@/features/practice/constants/practiceConstants";
import { signed } from "@/features/practice/utils/practiceFormat";
import type { NoteInfo } from "@/features/practice/types/practiceTypes";
import { cn } from "@/shared/utils/cn";

interface TunerCardProps {
  open: boolean;
  onToggle: () => void;
  live: boolean;
  cents: number;
  detectedNote: NoteInfo | null;
  detectedHz: number | null;
  expectedNote: NoteInfo;
  canOpenDetail: boolean;
  onOpenTuner: () => void;
  micDenied: boolean;
}

export function TunerCard({
  open,
  onToggle,
  live,
  cents,
  detectedNote,
  detectedHz,
  expectedNote,
  canOpenDetail,
  onOpenTuner,
  micDenied,
}: TunerCardProps) {
  const color = centsColor(cents, live);
  const centsWord = !live
    ? ""
    : Math.abs(cents) <= TUNER_TOLERANCE_CENTS
      ? "Chuẩn"
      : cents > 0
        ? "Hơi cao"
        : "Hơi thấp";

  const subText = micDenied
    ? "Chưa có micro"
    : live && detectedNote && detectedHz !== null
      ? `${detectedNote.en} · ${detectedHz.toFixed(1)} Hz`
      : "Đang lắng nghe";

  return (
    <CollapsibleCard
      label="Tuner"
      open={open}
      onToggle={onToggle}
      summary={
        open ? <span className="text-xs text-bvc-muted">{live ? `${signed(cents)} cent` : "-- cent"}</span> : null
      }
    >
      <button
        type="button"
        aria-label="Mở tuner lên dây"
        onClick={onOpenTuner}
        disabled={!canOpenDetail}
        className={cn("flex items-center gap-3 p-0 text-left", canOpenDetail ? "cursor-pointer" : "cursor-default")}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[11px] font-bold tracking-[0.1em] text-bvc-faint uppercase">Đang đo</span>
          <span className="flex items-baseline gap-2.5">
            <span
              className="text-[40px] leading-none font-extrabold tracking-[-0.03em]"
              style={{ color: live ? color : "var(--color-bvc-faint)" }}
            >
              {live && detectedNote ? detectedNote.vn : "--"}
            </span>
            <span className="flex flex-col gap-px">
              <span className="text-[12.5px] text-bvc-muted">{subText}</span>
              {centsWord && (
                <span className="text-[12.5px] font-bold" style={{ color }}>
                  {centsWord}
                </span>
              )}
            </span>
          </span>
        </span>

        <span className="flex min-w-[104px] shrink-0 flex-col items-center gap-px rounded-bvc-lg bg-bvc-ink px-3.5 pt-[9px] pb-2.5 text-white">
          <span className="text-[10.5px] font-bold tracking-[0.12em] text-bvc-bar uppercase">Cần chơi</span>
          <span className="text-[32px] leading-[1.1] font-extrabold">{expectedNote.vn}</span>
          <span className="text-[12.5px] text-bvc-bar">{expectedNote.en}</span>
        </span>

        {canOpenDetail && <ChevronRight size={16} strokeWidth={2} className="shrink-0 text-bvc-muted" />}
      </button>

      <CentsMeter cents={cents} live={live} />

      {micDenied && <NoticeBanner message={MSG.mic} />}
    </CollapsibleCard>
  );
}
