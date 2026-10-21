import { cn } from "@/shared/utils/cn";

interface StatusLabelProps {
  label: string;
  tone: "ok" | "warn" | "muted";
  className?: string;
}

const DOT_CLASSES = {
  ok: "bg-bvc-dot-ok",
  warn: "bg-bvc-dot-warn",
  muted: "bg-bvc-bar-strong",
} as const;

export function StatusLabel({ label, tone, className }: StatusLabelProps) {
  return (
    <span className={cn("inline-flex items-center gap-[6px] whitespace-nowrap text-[12.5px] text-bvc-ink", className)}>
      <span className={cn("size-[7px] shrink-0 rounded-full", DOT_CLASSES[tone])} />
      {label}
    </span>
  );
}
