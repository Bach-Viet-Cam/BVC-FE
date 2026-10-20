import { Bookmark } from "lucide-react";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { cn } from "@/shared/utils/cn";

interface SaveToggleButtonProps {
  isSaved: boolean;
  onToggle: () => void;
  itemName: string;
  variant?: "icon" | "full";
  savedLabel?: string;
  unsavedLabel?: string;
  disabled?: boolean;
  className?: string;
}

export function SaveToggleButton({
  isSaved,
  onToggle,
  itemName,
  variant = "full",
  savedLabel = "Đã lưu",
  unsavedLabel = "Lưu",
  disabled,
  className,
}: SaveToggleButtonProps) {
  const icon = (
    <Bookmark className="size-[18px]" strokeWidth={1.8} fill={isSaved ? "currentColor" : "none"} aria-hidden />
  );

  if (variant === "icon") {
    return (
      <button
        type="button"
        aria-pressed={isSaved}
        aria-label={isSaved ? `Bỏ lưu ${itemName}` : `Lưu ${itemName}`}
        disabled={disabled}
        onClick={onToggle}
        className={cn(
          "flex size-10 cursor-pointer items-center justify-center rounded-full bg-white text-bvc-ink transition-transform hover:scale-105 disabled:opacity-60",
          className
        )}
      >
        {icon}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={isSaved}
      disabled={disabled}
      onClick={onToggle}
      className={actionButtonClass(isSaved ? "soft" : "secondary", "lg", className)}
    >
      {icon}
      {isSaved ? savedLabel : unsavedLabel}
    </button>
  );
}
