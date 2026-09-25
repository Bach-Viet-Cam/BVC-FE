import { type InputHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-base text-on-surface",
        "placeholder:text-outline/50",
        "transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    />
  );
}
