import { type ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

interface AssignSelectRowProps {
  pressed: boolean;
  onToggle: () => void;
  children: ReactNode;
  trailing?: ReactNode;
}

// Multi-select card of the assign dialog: checkbox mark, content and an optional trailing value.
export function AssignSelectRow({ pressed, onToggle, children, trailing }: AssignSelectRowProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      className={cn(
        "flex w-full cursor-pointer items-start gap-[12px] rounded-[16px] p-[14px] text-left text-bvc-ink",
        pressed ? "border-2 border-bvc-ink bg-bvc-soft p-[13px]" : "border border-bvc-border bg-white hover:bg-bvc-soft"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mt-[1px] flex size-[22px] shrink-0 items-center justify-center rounded-[7px] text-[14px] font-extrabold",
          pressed ? "bg-bvc-ink text-white" : "border-[1.5px] border-bvc-faint text-transparent"
        )}
      >
        ✓
      </span>
      <span className="flex min-w-0 grow flex-col gap-[4px]">{children}</span>
      {trailing}
    </button>
  );
}
