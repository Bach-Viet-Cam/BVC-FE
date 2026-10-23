import { ChevronRight } from "lucide-react";
import { CollapsibleCard } from "@/features/practice/components/CollapsibleCard";
import { NoticeBanner } from "@/features/practice/components/NoticeBanner";
import { COUNT_IN_BEATS, MSG, PRACTICE_DEFAULTS } from "@/features/practice/constants/practiceConstants";
import { cn } from "@/shared/utils/cn";

interface TempoCardProps {
  open: boolean;
  onToggle: () => void;
  liveBpm: number | null;
  bpmHint: string;
  hintTone: "ok" | "warn" | "idle";
  litBeat: number;
  clickOn: boolean;
  onToggleClick: () => void;
  canOpenDetail: boolean;
  onOpenMetronome: () => void;
  micDenied: boolean;
}

const TONE_CLASS = {
  ok: "text-bvc-ok",
  warn: "text-bvc-error",
  idle: "text-bvc-faint",
};

export function TempoCard({
  open,
  onToggle,
  liveBpm,
  bpmHint,
  hintTone,
  litBeat,
  clickOn,
  onToggleClick,
  canOpenDetail,
  onOpenMetronome,
  micDenied,
}: TempoCardProps) {
  return (
    <CollapsibleCard
      label="Nhịp"
      open={open}
      onToggle={onToggle}
      summary={<span className="text-xs text-bvc-muted">4/4 · {PRACTICE_DEFAULTS.targetBpm} BPM</span>}
    >
      <button
        type="button"
        aria-label="Mở metronome"
        onClick={onOpenMetronome}
        disabled={!canOpenDetail}
        className={cn(
          "flex items-center gap-3 rounded-bvc-md p-0 text-left",
          canOpenDetail ? "cursor-pointer" : "cursor-default"
        )}
      >
        <span className="flex min-w-[92px] flex-col gap-0.5">
          <span className="text-[11px] font-bold tracking-[0.1em] text-bvc-faint uppercase">Mục tiêu</span>
          <span className="flex items-baseline gap-[5px]">
            <span className="text-[30px] leading-[1.1] font-semibold text-bvc-ink md:text-[72px]">
              {PRACTICE_DEFAULTS.targetBpm}
            </span>
            <span className="text-xs text-bvc-muted">BPM</span>
          </span>
        </span>

        <span className="w-px self-stretch bg-bvc-border" />

        <span className="flex flex-1 flex-col gap-0.5">
          <span className="text-[11px] font-bold tracking-[0.1em] text-bvc-faint uppercase">Đang đo</span>
          <span className="flex items-baseline gap-2">
            <span className={cn("text-[30px] leading-[1.1] font-semibold", TONE_CLASS[hintTone])}>
              {liveBpm ?? "--"}
            </span>
            <span className={cn("text-[12.5px] font-bold", TONE_CLASS[hintTone])}>{bpmHint}</span>
          </span>
        </span>

        {canOpenDetail && (
          <span className="flex shrink-0 items-center gap-0.5 text-[12.5px] font-semibold text-bvc-muted">
            Chỉnh
            <ChevronRight size={16} strokeWidth={2} />
          </span>
        )}
      </button>

      <div className="grid grid-cols-4 gap-[5px]">
        {Array.from({ length: COUNT_IN_BEATS }).map((_, i) => (
          <span key={i} className={cn("h-1.5 rounded-[3px]", i === litBeat ? "bg-bvc-accent" : "bg-bvc-border")} />
        ))}
      </div>

      <button
        type="button"
        aria-pressed={clickOn}
        onClick={onToggleClick}
        className={cn(
          "flex min-h-11 cursor-pointer items-center justify-between rounded-bvc-md border px-3 text-sm font-semibold text-bvc-ink",
          clickOn ? "border-bvc-ink bg-bvc-surface" : "border-bvc-border-strong bg-white"
        )}
      >
        <span>Bật/Tắt tiếng gõ nhịp</span>
        <span
          className={cn(
            "relative block h-[26px] w-11 shrink-0 rounded-[13px]",
            clickOn ? "bg-bvc-accent" : "bg-bvc-border-strong"
          )}
        >
          <span
            className="absolute top-[3px] size-5 rounded-full bg-white transition-[left]"
            style={{ left: clickOn ? 21 : 3 }}
          />
        </span>
      </button>

      {micDenied && <NoticeBanner message={MSG.mic} />}
    </CollapsibleCard>
  );
}
