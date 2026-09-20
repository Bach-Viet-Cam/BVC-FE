import { type LabelHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      {...props}
      className={cn(
        "text-xs font-semibold uppercase tracking-wider text-on-surface-variant",
        className
      )}
    />
  );
}
