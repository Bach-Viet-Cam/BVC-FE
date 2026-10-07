import { cn } from "@/shared/utils/cn";

interface StatCardProps {
  label: string;
  value: string | number;
  variant?: "default" | "surface" | "accent" | "ok";
  labelColor?: string;
  valueColor?: string;
}

const VARIANTS = {
  default: "border-bvc-border bg-white",
  surface: "border-bvc-border-strong bg-bvc-surface",
  accent: "border-[#F9D2C2] bg-bvc-accent-tint",
  ok: "border-bvc-border-strong bg-bvc-surface",
} as const;

const LABEL_COLORS: Record<string, string> = {
  default: "text-bvc-muted",
  surface: "text-bvc-muted font-semibold",
  accent: "text-bvc-accent-text font-semibold",
  ok: "text-bvc-ok font-semibold",
};

const VALUE_COLORS: Record<string, string> = {
  default: "text-bvc-ink",
  surface: "text-bvc-muted",
  accent: "text-bvc-accent-text",
  ok: "text-bvc-ok",
};

export function StatCard({ label, value, variant = "default", labelColor, valueColor }: StatCardProps) {
  return (
    <div className={cn("flex flex-col gap-[5px] rounded-[18px] border p-[15px_16px]", VARIANTS[variant])}>
      <span
        className={cn("text-[12.5px]", labelColor ?? LABEL_COLORS[variant])}
      >
        {label}
      </span>
      <span
        className={cn("font-bvc-mono text-[29px] font-semibold leading-none", valueColor ?? VALUE_COLORS[variant])}
      >
        {value}
      </span>
    </div>
  );
}
