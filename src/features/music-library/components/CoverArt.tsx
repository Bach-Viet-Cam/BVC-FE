import { Music } from "lucide-react";
import { COVER_TONE_CLASSES } from "@/features/music-library/constants/musicLibraryConstants";
import type { CoverTone } from "@/features/music-library/types/musicLibraryTypes";
import { cn } from "@/shared/utils/cn";

interface CoverArtProps {
  title: string;
  tone: CoverTone;
  url?: string;
  size?: "thumb" | "card" | "hero";
  className?: string;
}

const SIZES = {
  thumb: { box: "w-12 rounded-[10px]", icon: "size-5", showLabel: false },
  card: { box: "w-full rounded-[18px]", icon: "size-10", showLabel: true },
  hero: { box: "w-full rounded-bvc-xl", icon: "size-14", showLabel: true },
};

// Không có ảnh thì dùng ảnh mặc định theo tông màu của bài
export function CoverArt({ title, tone, url, size = "card", className }: CoverArtProps) {
  const config = SIZES[size];
  const colors = COVER_TONE_CLASSES[tone];

  return (
    <span
      role="img"
      aria-label={`Ảnh bìa ${title}`}
      className={cn(
        "relative flex aspect-square shrink-0 items-center justify-center overflow-hidden",
        config.box,
        colors.bg,
        colors.fg,
        className
      )}
    >
      {url ? (
        <img src={url} alt="" className="size-full object-cover" />
      ) : (
        <>
          <Music className={cn(config.icon, "opacity-70")} strokeWidth={1.5} aria-hidden />
          {config.showLabel && (
            <span className="absolute bottom-2 left-2.5 text-[11px] font-bold tracking-[0.08em] opacity-85">
              ẢNH BÌA
            </span>
          )}
        </>
      )}
    </span>
  );
}
