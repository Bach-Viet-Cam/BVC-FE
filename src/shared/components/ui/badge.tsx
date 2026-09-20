import { type HTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
        variant === "default" && "bg-surface-container text-on-surface-variant",
        variant === "success" && "bg-primary/10 text-primary",
        variant === "warning" && "bg-secondary-container/20 text-secondary",
        variant === "danger" && "bg-error/10 text-error",
        variant === "info" && "bg-secondary/10 text-secondary",
        className
      )}
    />
  );
}
