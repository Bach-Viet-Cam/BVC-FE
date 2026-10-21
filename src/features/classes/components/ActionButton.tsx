import { cn } from "@/shared/utils/cn";

type ActionButtonVariant = "outline" | "primary" | "accent";
type ActionButtonSize = "md" | "lg";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ActionButtonVariant;
  size?: ActionButtonSize;
}

const VARIANT_CLASSES: Record<ActionButtonVariant, string> = {
  outline: "border border-bvc-border-strong bg-white text-bvc-ink",
  primary: "border border-bvc-ink bg-bvc-ink text-white",
  accent: "border border-bvc-accent-border bg-bvc-accent-tint text-bvc-accent-text",
};

// md = card/toolbar buttons (design 40px, raised to the 44px touch target); lg = footer buttons (50px).
const SIZE_CLASSES: Record<ActionButtonSize, string> = {
  md: "min-h-[44px] rounded-[12px] px-[12px] text-[13px]",
  lg: "min-h-[50px] flex-1 rounded-[15px] px-[16px] text-[14.5px]",
};

export function ActionButton({
  variant = "outline",
  size = "md",
  className,
  type = "button",
  ...props
}: ActionButtonProps) {
  return (
    <button
      type={type}
      {...props}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-[6px] font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
    />
  );
}
