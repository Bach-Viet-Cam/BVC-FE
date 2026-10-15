import { Link } from "react-router-dom";
import { Video } from "lucide-react";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { ReferencePlayer } from "@/features/music-library/components/ReferencePlayer";
import { SheetBadges } from "@/features/music-library/components/SheetBadges";
import type { SheetVersion } from "@/features/music-library/types/musicLibraryTypes";
import { formatDuration } from "@/features/music-library/utils/mediaUtils";

interface FeaturedSheetCardProps {
  sheet: SheetVersion;
  viewerHref: string;
}

export function FeaturedSheetCard({ sheet, viewerHref }: FeaturedSheetCardProps) {
  return (
    <div className="flex flex-col gap-3.5 rounded-bvc-xl bg-bvc-surface p-4 md:px-5 md:py-[18px]">
      <SheetBadges sheet={sheet} recording={sheet.referenceRecording} />
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Link to={viewerHref} className="text-[19px] font-extrabold text-bvc-ink hover:text-bvc-accent-text">
          {sheet.name}
        </Link>
        <span className="hidden flex-1 md:block" />
        {sheet.tutorialVideo && (
          <span className="inline-flex items-center gap-1.5 text-[13px] text-bvc-ink">
            <Video className="size-4" strokeWidth={1.8} aria-hidden />
            Video hướng dẫn · <span className="font-bvc-mono">{formatDuration(sheet.tutorialVideo.durationSec)}</span>
          </span>
        )}
        <Link to={viewerHref} className={actionButtonClass("primary", "md", "hover:text-white")}>
          Mở bản nhạc
        </Link>
      </div>
      {sheet.referenceRecording ? (
        <ReferencePlayer
          key={sheet.id}
          recording={sheet.referenceRecording}
          title="Bản thu mẫu"
          subtitle="Bản thu của giảng viên cho bản này"
        />
      ) : (
        <p className="rounded-2xl bg-white px-4 py-3 text-[13px] text-bvc-muted">Bản này chưa có bản thu mẫu.</p>
      )}
    </div>
  );
}
