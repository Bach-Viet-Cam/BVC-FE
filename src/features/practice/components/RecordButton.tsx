import { Mic, Square } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface RecordButtonProps {
  variant: "record" | "stop" | "count";
  countNumber?: number;
  disabled?: boolean;
  onClick?: () => void;
}

export function RecordButton({ variant, countNumber, disabled, onClick }: RecordButtonProps) {
  if (variant === "count") {
    return (
      <div className="flex size-[84px] shrink-0 items-center justify-center rounded-full bg-bvc-accent text-[38px] font-bold text-white">
        {countNumber}
      </div>
    );
  }

  const isStop = variant === "stop";

  return (
    <button
      type="button"
      aria-label={isStop ? "Dừng ghi" : "Bắt đầu ghi âm"}
      aria-disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-[84px] shrink-0 items-center justify-center rounded-full border-[5px] text-white",
        isStop && "border-bvc-border bg-bvc-ink cursor-pointer",
        !isStop && disabled && "border-bvc-surface bg-bvc-bar-strong cursor-not-allowed",
        !isStop && !disabled && "border-bvc-accent-tint bg-bvc-accent cursor-pointer"
      )}
    >
      {isStop ? <Square size={26} fill="currentColor" strokeWidth={0} /> : <Mic size={30} strokeWidth={2} />}
    </button>
  );
}
