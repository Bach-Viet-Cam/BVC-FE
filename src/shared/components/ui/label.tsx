import { type LabelHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return <label {...props} className={cn("text-xs font-medium text-on-surface-variant", className)} />;
}
