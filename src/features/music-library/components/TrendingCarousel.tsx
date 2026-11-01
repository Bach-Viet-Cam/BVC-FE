import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Flame, Music } from "lucide-react";
import { COVER_TONE_CLASSES } from "@/features/music-library/constants/musicLibraryConstants";
import type { TrendingSong } from "@/features/music-library/types/musicLibraryTypes";
import { cn } from "@/shared/utils/cn";

interface TrendingCarouselProps {
  songs: TrendingSong[];
  title?: string;
}

const AUTOPLAY_MS = 6000;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

interface TrendingSlideProps {
  song: TrendingSong;
  rank: number;
  total: number;
}

// Một slide: ảnh bìa phóng to làm nền (mờ), ảnh bìa rõ bên trái và thông tin bài bên phải
function TrendingSlide({ song, rank, total }: TrendingSlideProps) {
  const tone = COVER_TONE_CLASSES[song.coverTone];

  return (
    <Link
      to={`/library/${song.id}`}
      aria-roledescription="slide"
      aria-label={`Hạng ${rank} trên ${total}: ${song.title}`}
      className={cn(
        "group relative flex h-full w-full shrink-0 snap-center overflow-hidden rounded-bvc-xl text-white hover:text-white",
        song.coverUrl ? "bg-bvc-ink" : tone.bg
      )}
    >
      {song.coverUrl && (
        <img
          src={song.coverUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full scale-110 object-cover opacity-55 blur-2xl"
        />
      )}
      <span className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-black/10" aria-hidden />

      <span className="relative flex w-full flex-col justify-end gap-4 p-5 md:flex-row md:items-center md:justify-start md:gap-8 md:p-8">
        <span className="hidden aspect-square h-full max-h-[260px] shrink-0 overflow-hidden rounded-[18px] shadow-2xl ring-1 ring-white/15 md:block">
          {song.coverUrl ? (
            <img
              src={song.coverUrl}
              alt=""
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span className={cn("flex size-full items-center justify-center", tone.bg, tone.fg)}>
              <Music className="size-16 opacity-70" strokeWidth={1.5} aria-hidden />
            </span>
          )}
        </span>

        <span className="flex min-w-0 flex-col gap-2">
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-white/15 px-3 py-1 text-[12px] font-bold tracking-[0.06em] uppercase backdrop-blur">
            <Flame className="size-3.5" strokeWidth={2.2} aria-hidden />
            Top {rank} tuần này
          </span>
          <span className="line-clamp-2 text-[26px] leading-tight font-extrabold tracking-[-0.025em] md:text-[40px]">
            {song.title}
          </span>
          <span className="truncate text-[14px] text-white/80 md:text-[15px]">
            {song.composer || "Chưa rõ tác giả"} · {song.genre.name}
          </span>
          {song.description && (
            <span className="line-clamp-2 hidden max-w-[560px] text-[14px] text-white/75 md:block">
              {song.description}
            </span>
          )}
          <span className="mt-1 flex flex-wrap items-center gap-3 text-[13px] font-semibold">
            <span className="font-bvc-mono">{song.weeklySubmissionCount} lượt nộp</span>
            <span className="text-white/60">·</span>
            <span>{song.instrumentCount} nhạc cụ</span>
            <span className="ml-auto rounded-full bg-white px-4 py-2 text-[13.5px] font-bold text-bvc-ink md:ml-2">
              Luyện bài này
            </span>
          </span>
        </span>
      </span>
    </Link>
  );
}

// Banner top bài hot: vuốt ngang (scroll-snap), nút trước / sau, chấm chọn slide, tự chuyển khi không tương tác
export function TrendingCarousel({ songs, title = "Đang hot tuần này" }: TrendingCarouselProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = songs.length;

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track || total === 0) return;
      const target = (index + total) % total;
      track.scrollTo({ left: target * track.clientWidth, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      setActiveIndex(target);
    },
    [total]
  );

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setActiveIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  useEffect(() => {
    if (total < 2 || isPaused || prefersReducedMotion()) return;
    const timer = window.setInterval(() => goTo(activeIndex + 1), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [activeIndex, goTo, isPaused, total]);

  if (total === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-labelledby="trending-heading"
      className="flex flex-col gap-3"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="trending-heading" className="text-xl font-extrabold tracking-[-0.02em] text-bvc-ink md:text-2xl">
          {title}
        </h2>
        {total > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Bài trước"
              onClick={() => goTo(activeIndex - 1)}
              className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-bvc-border-strong bg-white text-bvc-ink hover:bg-bvc-surface"
            >
              <ChevronLeft className="size-4.5" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Bài tiếp theo"
              onClick={() => goTo(activeIndex + 1)}
              className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-bvc-border-strong bg-white text-bvc-ink hover:bg-bvc-surface"
            >
              <ChevronRight className="size-4.5" aria-hidden />
            </button>
          </div>
        )}
      </div>

      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex h-[300px] snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] md:h-[320px] [&::-webkit-scrollbar]:hidden"
      >
        {songs.map((song, index) => (
          <TrendingSlide key={song.id} song={song} rank={index + 1} total={total} />
        ))}
      </div>

      {total > 1 && (
        <div className="flex justify-center gap-1.5">
          {songs.map((song, index) => (
            <button
              key={song.id}
              type="button"
              aria-label={`Xem bài hạng ${index + 1}: ${song.title}`}
              aria-current={index === activeIndex}
              onClick={() => goTo(index)}
              className="flex h-6 cursor-pointer items-center px-0.5"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-all",
                  index === activeIndex ? "w-6 bg-bvc-ink" : "w-1.5 bg-bvc-bar-strong"
                )}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
