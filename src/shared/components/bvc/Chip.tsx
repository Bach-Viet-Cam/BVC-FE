import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/shared/utils/cn";

type ChipVariant = "tint" | "surface" | "ink" | "outline";

interface ChipProps {
  children: ReactNode;
  variant?: ChipVariant;
  to?: string;
  title?: string;
  className?: string;
}

const VARIANTS: Record<ChipVariant, string> = {
  tint: "bg-bvc-accent-tint text-bvc-accent-text",
  surface: "bg-bvc-surface text-bvc-ink",
  ink: "bg-bvc-ink font-bold text-white",
  outline: "border border-bvc-border-strong bg-white text-bvc-muted",
};

export function Chip({ children, variant = "tint", to, title, className }: ChipProps) {
  const classes = cn(
    "inline-flex min-h-[26px] items-center gap-1.5 rounded-lg px-[9px] py-1 text-xs whitespace-nowrap",
    VARIANTS[variant],
    to && "transition-opacity hover:opacity-80",
    className
  );

  if (to) {
    return (
      <Link to={to} title={title} className={cn(classes, "hover:text-current")}>
        {children}
      </Link>
    );
  }
  return (
    <span title={title} className={classes}>
      {children}
    </span>
  );
}
