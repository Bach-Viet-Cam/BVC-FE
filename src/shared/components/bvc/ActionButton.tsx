import type { ButtonHTMLAttributes } from "react";
import { actionButtonClass, type ActionSize, type ActionVariant } from "@/shared/components/bvc/actionButtonStyles";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ActionVariant;
  size?: ActionSize;
  isLoading?: boolean;
}

export function ActionButton({
  variant = "primary",
  size = "md",
  isLoading,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ActionButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={actionButtonClass(variant, size, className)}
    >
      {isLoading ? "Đang xử lý..." : children}
    </button>
  );
}
