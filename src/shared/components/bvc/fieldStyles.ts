import { cn } from "@/shared/utils/cn";

export function fieldClass(hasError?: boolean, className?: string) {
  return cn(
    "w-full rounded-[13px] border bg-white px-[13px] text-[14.5px] text-bvc-ink placeholder:text-bvc-faint",
    "focus:border-bvc-ink focus:outline-none disabled:cursor-not-allowed disabled:bg-bvc-surface disabled:text-bvc-muted",
    hasError ? "border-bvc-error" : "border-bvc-border-strong",
    className
  );
}
