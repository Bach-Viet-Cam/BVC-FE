import { Clock } from "lucide-react";
import { Chip } from "@/shared/components/bvc/Chip";
import type { SheetVersion } from "@/features/music-library/types/musicLibraryTypes";
import { formatDuration } from "@/features/music-library/utils/mediaUtils";

interface SheetBadgesProps {
  sheet: Pick<SheetVersion, "isMain" | "level">;
  durationSec?: number | null;
}

// Thời lượng của bản lấy từ bản thu mẫu
export function SheetBadges({ sheet, durationSec }: SheetBadgesProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {sheet.isMain && <Chip variant="ink">Bản chính · GV</Chip>}
      <Chip>{sheet.level.name}</Chip>
      <span
        className="inline-flex items-center gap-1.5 font-bvc-mono text-[12.5px] whitespace-nowrap text-bvc-ink"
        title="Thời lượng lấy từ bản thu mẫu"
      >
        <Clock className="size-3.5" strokeWidth={1.8} aria-hidden />
        {formatDuration(durationSec)}
      </span>
    </div>
  );
}
