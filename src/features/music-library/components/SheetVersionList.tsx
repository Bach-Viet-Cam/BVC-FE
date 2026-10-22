import { Link } from "react-router-dom";
import { AudioLines, ChevronRight } from "lucide-react";
import { Chip } from "@/shared/components/bvc/Chip";
import type { SheetVersion } from "@/features/music-library/types/musicLibraryTypes";
import { formatDuration } from "@/features/music-library/utils/mediaUtils";

interface SheetVersionListProps {
  title: string;
  sheets: SheetVersion[];
  hrefOf: (sheet: SheetVersion) => string;
}

export function SheetVersionList({ title, sheets, hrefOf }: SheetVersionListProps) {
  if (sheets.length === 0) return null;

  return (
    <div className="flex flex-col">
      <span className="flex items-center gap-2 px-1 pb-2 text-xs font-bold tracking-[0.06em] text-bvc-muted uppercase md:px-[18px]">
        {title}
        <span className="font-bvc-mono">{sheets.length}</span>
      </span>
      {sheets.map((sheet, index) => (
        <Link
          key={sheet.id}
          to={hrefOf(sheet)}
          className="flex items-center gap-3 border-t border-bvc-border px-1 py-[13px] text-bvc-ink hover:bg-bvc-surface hover:text-bvc-ink md:px-[18px]"
        >
          <span className="hidden w-[18px] font-bvc-mono text-[13px] text-bvc-muted sm:inline">{index + 2}</span>
          <span className="min-w-0 flex-1 truncate text-[15px] font-bold">{sheet.name}</span>
          <Chip>{sheet.level.name}</Chip>
          {sheet.referenceRecording && (
            <span title="Có bản thu mẫu" className="text-bvc-accent">
              <AudioLines className="size-4" strokeWidth={1.8} aria-label="Có bản thu mẫu" />
            </span>
          )}
          <span className="font-bvc-mono text-[13px] text-bvc-muted">
            {formatDuration(sheet.referenceRecording?.durationSec)}
          </span>
          <ChevronRight className="size-4 shrink-0 text-bvc-muted" aria-hidden />
        </Link>
      ))}
    </div>
  );
}
