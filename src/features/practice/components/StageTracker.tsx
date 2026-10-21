import { Check, X } from "lucide-react";
import { STAGE_ACTIVE_LABELS, STAGE_LABELS } from "@/features/practice/constants/practiceConstants";
import type { StageState } from "@/features/practice/types/practiceTypes";
import { cn } from "@/shared/utils/cn";

interface StageTrackerProps {
  stage: number;
  failed: boolean;
}

function stateOf(index: number, stage: number, failed: boolean): StageState {
  if (index < stage) return "done";
  if (index > stage) return "pending";
  return failed ? "fail" : "active";
}

export function StageTracker({ stage, failed }: StageTrackerProps) {
  return (
    <ol className="flex flex-col rounded-[18px] border border-bvc-border bg-white p-3.5">
      {STAGE_LABELS.map((label, index) => {
        const state = stateOf(index, stage, failed);
        const isLast = index === STAGE_LABELS.length - 1;
        return (
          <li key={label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-[26px] shrink-0 items-center justify-center rounded-full border-2",
                  state === "done" && "border-bvc-ink bg-bvc-ink text-white",
                  state === "active" && "border-bvc-ink bg-white",
                  state === "fail" && "border-bvc-error bg-bvc-error text-white",
                  state === "pending" && "border-bvc-border-strong bg-white"
                )}
              >
                {state === "done" && <Check size={14} strokeWidth={3} />}
                {state === "fail" && <X size={14} strokeWidth={3} />}
                {state === "active" && <span className="size-2 animate-pulse rounded-full bg-bvc-ink" />}
              </span>
              {!isLast && <span className="w-0.5 flex-1 bg-bvc-border" />}
            </div>

            <div className={cn("flex flex-col gap-0.5", isLast ? "pb-0" : "pb-4")}>
              <span
                className={cn(
                  "text-sm",
                  state === "pending" && "font-medium text-bvc-faint",
                  state === "done" && "font-semibold text-bvc-ink",
                  state === "active" && "font-bold text-bvc-ink",
                  state === "fail" && "font-bold text-bvc-accent-text"
                )}
              >
                {label}
              </span>
              {state === "active" && <span className="text-xs text-bvc-muted">{STAGE_ACTIVE_LABELS[index]}</span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
