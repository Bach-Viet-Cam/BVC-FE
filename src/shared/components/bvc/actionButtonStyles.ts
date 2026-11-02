import { cn } from "@/shared/utils/cn";

export type ActionVariant = "primary" | "secondary" | "soft" | "accent" | "dashed" | "ghost";
export type ActionSize = "sm" | "md" | "lg";

const VARIANTS: Record<ActionVariant, string> = {
  primary: "bg-bvc-ink text-white hover:bg-bvc-ink/90",
  secondary: "border border-bvc-border-strong bg-white text-bvc-ink hover:bg-bvc-surface",
  soft: "border border-bvc-border-strong bg-bvc-surface text-bvc-ink hover:bg-bvc-border",
  accent: "border border-bvc-accent-border bg-bvc-accent-tint text-bvc-accent-text hover:bg-bvc-accent-tint/70",
  dashed: "border-[1.5px] border-dashed border-bvc-accent bg-bvc-surface text-bvc-ink hover:bg-bvc-border",
  ghost: "text-bvc-accent-text hover:bg-bvc-accent-tint",
};

const SIZES: Record<ActionSize, string> = {
  sm: "min-h-10 rounded-full px-4 text-[13px]",
  md: "min-h-11 rounded-full px-5 text-sm",
  lg: "min-h-[50px] rounded-full px-6 text-[14.5px]",
};

// Dùng chung cho <button> và <Link> để nút và liên kết trông giống nhau
export function actionButtonClass(variant: ActionVariant = "primary", size: ActionSize = "md", className?: string) {
  return cn(
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 font-medium whitespace-nowrap transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bvc-accent",
    "disabled:cursor-not-allowed disabled:opacity-40",
    VARIANTS[variant],
    SIZES[size],
    className
  );
}
