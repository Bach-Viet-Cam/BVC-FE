import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CoverArt } from "@/features/music-library/components/CoverArt";
import { useLibrarySongs } from "@/features/music-library/hooks/useLibrarySongs";
import { useTrendingSongs } from "@/features/music-library/hooks/useTrendingSongs";
import type { LibrarySong, LibrarySongQuery } from "@/features/music-library/types/musicLibraryTypes";
import { PillLink } from "@/shared/components/bvc/PillLink";
import { Accent, SectionBadge, SectionHeading } from "@/shared/components/bvc/SectionIntro";
import { cn } from "@/shared/utils/cn";

const NEWEST_QUERY: LibrarySongQuery = {
  keyword: "",
  genreId: "",
  instrumentIds: [],
  levelId: "",
  sort: "newest",
  page: 1,
};
const SHOWCASE_LIMIT = 2;

interface ShowcaseCardProps {
  song: LibrarySong;
  badge?: string;
  isCoverTop: boolean;
  delay: number;
}

function ShowcaseCard({ song, badge, isCoverTop, delay }: ShowcaseCardProps) {
  const cover = (
    <span className="block h-[260px] w-full overflow-hidden md:h-[380px]">
      <CoverArt
        title={song.title}
        tone={song.coverTone}
        url={song.coverUrl}
        size="hero"
        className="aspect-auto size-full rounded-none transition-transform duration-700 group-hover:scale-105"
      />
    </span>
  );

  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="w-full"
    >
      <Link
        to={`/library/${song.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-bvc-ink/10 bg-white text-bvc-ink shadow-[0_4px_24px_rgba(18,63,51,0.03)] transition-all duration-500 hover:bg-bvc-soft hover:text-bvc-ink hover:shadow-[0_20px_60px_rgba(18,63,51,0.1)]"
      >
        {isCoverTop && cover}
        <span className="flex flex-col gap-4 p-6 md:p-10">
          <span className="text-base text-bvc-ink/70 md:text-[17px]">{song.composer || "Chưa rõ tác giả"}</span>
          <span className="font-bvc-display text-[28px] leading-tight font-semibold tracking-[-0.025em] md:text-[34px]">
            {song.title}
          </span>
          <span className="flex flex-wrap gap-3">
            {[song.genre.name, `${song.instrumentCount} nhạc cụ`, badge].filter(Boolean).map((tag, index) => (
              <span
                key={tag}
                className={cn(
                  "rounded-md px-2.5 py-0.5 text-[14px] font-medium",
                  index === 0 && "bg-bvc-accent-tint text-bvc-accent-text",
                  index === 1 && "bg-bvc-surface text-bvc-ink",
                  index === 2 && "bg-bvc-accent/10 text-bvc-accent"
                )}
              >
                {tag}
              </span>
            ))}
          </span>
        </span>
        {!isCoverTop && <span className="mt-auto">{cover}</span>}
      </Link>
    </motion.li>
  );
}

// Bài thật trong thư viện: ưu tiên bài đang hot tuần này, chưa có thì lấy bài mới nhất
export function LandingLibraryShowcase() {
  const trending = useTrendingSongs();
  const newest = useLibrarySongs(NEWEST_QUERY);
  const trendingSongs = trending.songs.slice(0, SHOWCASE_LIMIT);
  // Bài chưa có bản nhạc công khai nào (0 nhạc cụ) không đưa lên trang giới thiệu
  const newestSongs = (newest.result?.data ?? []).filter((song) => song.instrumentCount > 0);
  const songs = trendingSongs.length > 0 ? trendingSongs : newestSongs.slice(0, SHOWCASE_LIMIT);

  if (songs.length === 0) return null;

  return (
    <section id="library" aria-labelledby="library-heading" className="w-full scroll-mt-6 bg-white py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1248px] px-6">
        <div className="mb-12 flex flex-col items-center text-center md:mb-16">
          <SectionBadge className="mb-6">Thư viện</SectionBadge>
          <SectionHeading id="library-heading" className="mb-5 max-w-3xl">
            {trendingSongs.length > 0 ? (
              <>
                Bài đang được <Accent>luyện nhiều</Accent> tuần này
              </>
            ) : (
              <>
                Bài mới <Accent>vừa lên</Accent> thư viện
              </>
            )}
          </SectionHeading>
          <p className="max-w-[600px] text-base leading-relaxed text-bvc-ink/70 md:text-lg">
            Mỗi bài có bản nhạc theo từng nhạc cụ và trình độ, kèm bản thu mẫu để nghe trước khi luyện.
          </p>
        </div>

        <ul className="grid gap-6 lg:grid-cols-2">
          {songs.map((song, index) => (
            <ShowcaseCard
              key={song.id}
              song={song}
              isCoverTop={index % 2 === 0}
              delay={0.2 + index * 0.1}
              badge={"weeklySubmissionCount" in song ? `${song.weeklySubmissionCount} lượt nộp tuần này` : undefined}
            />
          ))}
        </ul>

        <div className="mt-12 flex justify-center">
          <PillLink to="/library" label="Xem toàn bộ thư viện" />
        </div>
      </div>
    </section>
  );
}
