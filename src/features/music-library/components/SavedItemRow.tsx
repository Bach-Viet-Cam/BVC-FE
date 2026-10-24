import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { Chip } from "@/shared/components/bvc/Chip";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { formatDate } from "@/shared/utils/formatDate";
import { cn } from "@/shared/utils/cn";
import { LIBRARY_MESSAGES } from "@/features/music-library/constants/musicLibraryConstants";

interface SavedItemRowProps {
  cover: ReactNode;
  title: string;
  subtitle: string;
  instruments: string;
  // Chỉ bản nhạc có trình độ, bài hát để trống
  level?: string;
  savedAt: string;
  href: string;
  isAvailable: boolean;
  isPending: boolean;
  onUnsave: () => void;
}

export const SAVED_GRID_COLUMNS = "md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_120px_80px_110px] md:gap-4";

// Nội dung đã bị ẩn: hiện xám, không mở được nhưng vẫn bỏ lưu được
export function SavedItemRow({
  cover,
  title,
  subtitle,
  instruments,
  level,
  savedAt,
  href,
  isAvailable,
  isPending,
  onUnsave,
}: SavedItemRowProps) {
  const savedDate = formatDate(savedAt, "dd/MM");
  const titleBlock = (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate text-[15px] font-bold">{title}</span>
      <span className="truncate text-[12.5px] text-bvc-muted">
        {subtitle}
        <span className="md:hidden"> · đã lưu {savedDate}</span>
      </span>
    </span>
  );

  return (
    <li
      title={isAvailable ? undefined : LIBRARY_MESSAGES.unavailable}
      className={cn(
        "flex items-center gap-3 border-t border-bvc-border py-3 md:items-center md:px-3.5",
        SAVED_GRID_COLUMNS
      )}
    >
      <span className={cn("flex min-w-0 flex-1 items-center gap-3", !isAvailable && "opacity-50 grayscale")}>
        {cover}
        {isAvailable ? (
          <Link to={href} className="min-w-0 text-bvc-ink hover:text-bvc-accent-text">
            {titleBlock}
          </Link>
        ) : (
          <span className="min-w-0 text-bvc-ink" aria-disabled>
            {titleBlock}
          </span>
        )}
      </span>
      <span className={cn("hidden truncate text-[13px] text-bvc-muted md:block", !isAvailable && "opacity-50")}>
        {instruments}
      </span>
      <span className="hidden md:block">
        {!isAvailable ? <Chip variant="outline">Không khả dụng</Chip> : level && <Chip>{level}</Chip>}
      </span>
      <span className="hidden font-bvc-mono text-[13px] text-bvc-muted md:block">{savedDate}</span>
      <span className="flex shrink-0 items-center justify-end gap-2">
        {!isAvailable && (
          <Chip variant="outline" className="md:hidden">
            Không khả dụng
          </Chip>
        )}
        <button
          type="button"
          onClick={onUnsave}
          disabled={isPending}
          aria-label={`Bỏ lưu ${title}`}
          className={actionButtonClass("secondary", "sm", "max-md:size-10 max-md:rounded-full max-md:px-0")}
        >
          <Bookmark className="size-4 md:hidden" fill="currentColor" aria-hidden />
          <span className="hidden md:inline">Bỏ lưu</span>
        </button>
      </span>
    </li>
  );
}
