import { Switch } from "@/shared/components/ui/switch";
import { LIBRARY_MESSAGES, VISIBILITY_LABELS } from "@/features/music-library/constants/musicLibraryConstants";
import type { Visibility } from "@/features/music-library/types/musicLibraryTypes";
import { cn } from "@/shared/utils/cn";

interface VisibilitySwitchProps {
  visibility: Visibility;
  itemName: string;
  onRequestChange: (nextVisible: boolean) => void;
  disabled?: boolean;
  className?: string;
}

// Admin đã ẩn thì khóa công tắc, giảng viên không tự bật lại được
export function VisibilitySwitch({
  visibility,
  itemName,
  onRequestChange,
  disabled,
  className,
}: VisibilitySwitchProps) {
  const lockedByAdmin = visibility === "ADMIN_HIDDEN";

  return (
    <span
      className={cn("flex items-center gap-2.5", className)}
      title={lockedByAdmin ? LIBRARY_MESSAGES.hiddenByAdmin : undefined}
    >
      <Switch
        checked={visibility === "PUBLIC"}
        disabled={disabled || lockedByAdmin}
        onCheckedChange={(checked) => onRequestChange(checked)}
        aria-label={`Trạng thái hiển thị của ${itemName}`}
        className="bg-bvc-border-strong hover:bg-bvc-bar-strong focus-visible:outline-bvc-accent data-checked:bg-bvc-ink data-checked:hover:bg-bvc-ink"
      />
      <span
        className={cn(
          "text-[12.5px] whitespace-nowrap",
          lockedByAdmin ? "font-semibold text-bvc-accent-text" : "text-bvc-ink"
        )}
      >
        {VISIBILITY_LABELS[visibility]}
      </span>
    </span>
  );
}
