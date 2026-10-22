import type { MediaFile } from "@/features/music-library/types/musicLibraryTypes";
import { claimPlayback } from "@/features/music-library/utils/exclusivePlayback";
import { formatDuration } from "@/features/music-library/utils/mediaUtils";

interface TutorialVideoCardProps {
  video?: MediaFile;
}

export function TutorialVideoCard({ video }: TutorialVideoCardProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[15px] font-bold text-bvc-ink">Video hướng dẫn</span>
        {video && (
          <span className="font-bvc-mono text-[12.5px] text-bvc-muted">{formatDuration(video.durationSec)}</span>
        )}
      </div>
      {video?.url ? (
        <video
          src={video.url}
          controls
          onPlay={(event) => claimPlayback(event.currentTarget)}
          className="aspect-video w-full rounded-2xl bg-bvc-ink"
        />
      ) : (
        <p className="rounded-2xl bg-bvc-surface px-4 py-6 text-center text-[13px] text-bvc-muted">
          {video ? "Video hướng dẫn đang được xử lý." : "Bản này chưa có video hướng dẫn."}
        </p>
      )}
    </div>
  );
}
