import { Play } from "lucide-react";
import { toast } from "@/shared/components/ui/toast";
import type { MediaFile } from "@/features/music-library/types/musicLibraryTypes";
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
      {!video ? (
        <p className="rounded-2xl bg-bvc-surface px-4 py-6 text-center text-[13px] text-bvc-muted">
          Bản này chưa có video hướng dẫn.
        </p>
      ) : video.url ? (
        <video src={video.url} controls className="aspect-video w-full rounded-2xl bg-bvc-ink" />
      ) : (
        <div
          role="img"
          aria-label="Khung video hướng dẫn (ảnh tạm)"
          className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-bvc-ink lg:aspect-auto lg:h-[196px]"
        >
          <button
            type="button"
            aria-label="Phát video hướng dẫn"
            onClick={() => toast.info("Video mẫu", "Dữ liệu mock chưa có file video thật.")}
            className="flex size-[60px] cursor-pointer items-center justify-center rounded-full bg-white text-bvc-ink"
          >
            <Play className="size-6 translate-x-0.5" fill="currentColor" />
          </button>
          <span className="absolute bottom-2.5 left-3 text-[11px] font-bold tracking-[0.08em] text-white opacity-80">
            VIDEO · ẢNH TẠM
          </span>
        </div>
      )}
    </div>
  );
}
