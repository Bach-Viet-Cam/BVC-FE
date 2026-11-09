import { ChevronRight } from "lucide-react";
import { CollapsibleCard } from "@/features/practice/components/CollapsibleCard";
import { NoticeBanner } from "@/features/practice/components/NoticeBanner";
import { COUNT_IN_BEATS, MSG } from "@/features/practice/constants/practiceConstants";
import { cn } from "@/shared/utils/cn";

interface TempoCardProps {
  open: boolean;
  onToggle: () => void;
  // Tốc độ mục tiêu: BPM bài tập của lớp hoặc mặc định 60
  targetBpm: number;
  liveBpm: number | null;
  bpmHint: string;
  hintTone: "ok" | "warn" | "idle";
  litBeat: number;
  // Bỏ cả hai thì ẩn công tắc tiếng gõ nhịp (nơi không phát click, vd. phòng hòa tấu)
  clickOn?: boolean;
  onToggleClick?: () => void;
  canOpenDetail: boolean;
  onOpenMetronome: () => void;
  micDenied: boolean;
  // Thu nhỏ theo điện thoại để đứng cạnh thẻ Tuner trên một dòng
  compact?: boolean;
}

const TONE_CLASS = {
  ok: "text-bvc-ok",
  warn: "text-bvc-error",
  idle: "text-bvc-faint",
};

export function TempoCard({
  open,
  onToggle,
  targetBpm,
  liveBpm,
  bpmHint,
  hintTone,
  litBeat,
  clickOn,
  onToggleClick,
  canOpenDetail,
  onOpenMetronome,
  micDenied,
  compact,
}: TempoCardProps) {
  return (
    <CollapsibleCard
      label="Nhịp"
      className="h-full"
      compact={compact}
      open={open}
      onToggle={onToggle}
      summary={<span className={cn("text-xs text-bvc-muted", compact && "max-md:hidden")}>4/4 · {targetBpm} BPM</span>}
    >
      <button
        type="button"
        aria-label="Mở metronome"
        onClick={onOpenMetronome}
        disabled={!canOpenDetail}
        className={cn(
          "flex items-center gap-3 rounded-bvc-md p-0 text-left",
          compact && "max-md:gap-2",
          canOpenDetail ? "cursor-pointer" : "cursor-default"
        )}
      >
        <span className={cn("flex min-w-[92px] flex-col gap-0.5", compact && "max-md:min-w-0")}>
          <span className="text-[11px] font-semibold text-bvc-faint">Mục tiêu</span>
          <span className="flex items-baseline gap-[5px]">
            <span
              className={cn(
                "text-[30px] leading-[1.1] font-medium text-bvc-ink md:text-[72px]",
                compact && "max-md:text-[22px]"
              )}
            >
              {targetBpm}
            </span>
            <span className="text-xs text-bvc-muted">BPM</span>
          </span>
        </span>

        <span className="w-px self-stretch bg-bvc-border" />

        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[11px] font-semibold text-bvc-faint">Đang đo</span>
          <span
            className={cn("flex items-baseline gap-2", compact && "max-md:flex-col max-md:items-start max-md:gap-0")}
          >
            <span
              className={cn(
                "text-[30px] leading-[1.1] font-medium",
                compact && "max-md:text-[22px]",
                TONE_CLASS[hintTone]
              )}
            >
              {liveBpm ?? "--"}
            </span>
            <span
              className={cn(
                "text-[12.5px] font-semibold",
                compact && "max-md:truncate max-md:text-[10.5px]",
                TONE_CLASS[hintTone]
              )}
            >
              {bpmHint || " "}
            </span>
          </span>
        </span>

        {canOpenDetail && (
          <span
            className={cn(
              "flex shrink-0 items-center gap-0.5 text-[12.5px] font-medium text-bvc-muted",
              compact && "max-md:hidden"
            )}
          >
            Chỉnh
            <ChevronRight size={16} strokeWidth={2} />
          </span>
        )}
      </button>

      <div className="grid grid-cols-4 gap-[5px]">
        {Array.from({ length: COUNT_IN_BEATS }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-[3px]",
              compact && "max-md:h-1",
              i === litBeat ? "bg-bvc-accent" : "bg-bvc-border"
            )}
          />
        ))}
      </div>

      {onToggleClick && (
        <button
          type="button"
          aria-pressed={clickOn}
          onClick={onToggleClick}
          className={cn(
            "flex min-h-11 cursor-pointer items-center justify-between rounded-full border px-3 text-sm font-medium text-bvc-ink",
            compact && "max-md:min-h-8 max-md:gap-1 max-md:px-2 max-md:text-[11px]",
            clickOn ? "border-bvc-ink bg-bvc-surface" : "border-bvc-border-strong bg-white"
          )}
        >
          <span className={cn(compact && "max-md:truncate")}>
            <span className={cn(compact && "max-md:hidden")}>Bật/Tắt tiếng gõ nhịp</span>
            {compact && <span className="hidden max-md:inline">Gõ nhịp</span>}
          </span>
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
      )}

      {micDenied && <NoticeBanner message={MSG.mic} />}
    </CollapsibleCard>
  );
}
