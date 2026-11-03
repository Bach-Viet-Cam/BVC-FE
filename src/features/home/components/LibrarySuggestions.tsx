import { Link } from "react-router-dom";
import { Music2 } from "lucide-react";
import { PillLink } from "@/shared/components/bvc/PillLink";
import { SongCard } from "@/features/music-library/components/SongCard";
import { TrendingCarousel } from "@/features/music-library/components/TrendingCarousel";
import { useLibrarySongs } from "@/features/music-library/hooks/useLibrarySongs";
import { useTrendingSongs } from "@/features/music-library/hooks/useTrendingSongs";
import type { LibrarySongQuery } from "@/features/music-library/types/musicLibraryTypes";
import { SectionTitle } from "@/shared/components/bvc/SectionTitle";

const NEWEST_QUERY: LibrarySongQuery = {
  keyword: "",
  genreId: "",
  instrumentIds: [],
  levelId: "",
  sort: "newest",
  page: 1,
};
const NEWEST_LIMIT = 4;

// Tài khoản chưa có lần nộp nào: thay phần số liệu bằng lời mời luyện tập và gợi ý bài từ thư viện
// (bài đang hot tuần này; tuần chưa ai nộp thì lấy các bài mới nhất)
export function LibrarySuggestions() {
  const trending = useTrendingSongs();
  const newest = useLibrarySongs(NEWEST_QUERY);
  const newestSongs = (newest.result?.data ?? []).slice(0, NEWEST_LIMIT);

  return (
    <div className="flex flex-col gap-7">
      <section className="flex flex-col items-start gap-4 rounded-bvc-xl border border-bvc-accent-border bg-bvc-accent-tint p-5 text-bvc-ink md:flex-row md:items-center md:justify-between md:p-7">
        <span className="flex items-start gap-3">
          <Music2 className="mt-0.5 size-6 shrink-0 text-bvc-accent-text" strokeWidth={1.8} aria-hidden />
          <span className="flex flex-col gap-1">
            <span className="font-bvc-display text-[18px] font-semibold md:text-[22px]">Bạn chưa có lần nộp nào</span>
            <span className="text-[14px] text-bvc-muted">
              Chọn một bài trong thư viện, thu âm và nộp để xem điểm và sự tiến bộ của bạn tại đây.
            </span>
          </span>
        </span>
        <PillLink to="/library" label="Khám phá thư viện" size="md" />
      </section>

      {trending.songs.length > 0 ? (
        <TrendingCarousel songs={trending.songs} title="Bài đang hot tuần này" />
      ) : (
        newestSongs.length > 0 && (
          <section aria-labelledby="newest-heading" className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <SectionTitle id="newest-heading">Bài mới trong thư viện</SectionTitle>
              <Link to="/library" className="text-[13.5px] font-medium text-bvc-accent-text">
                Xem tất cả
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-3.5 gap-y-4 md:grid-cols-4 lg:gap-6">
              {newestSongs.map((song) => (
                <SongCard key={song.id} song={song} showSave={false} onToggleSave={() => undefined} />
              ))}
            </div>
          </section>
        )
      )}
    </div>
  );
}
