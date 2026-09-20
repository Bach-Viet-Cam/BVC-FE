import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        variant === "primary" && "bg-primary text-white shadow-sm hover:brightness-110 active:scale-[0.98]",
        variant === "secondary" && "border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container",
        variant === "danger" && "bg-error text-white shadow-sm hover:brightness-110 active:scale-[0.98]",
        variant === "ghost" && "bg-transparent text-on-surface-variant hover:bg-primary/5 hover:text-primary",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        className
      )}
    >
      {isLoading ? "Đang xử lý..." : children}
    </button>
  );
}
