import { LeaderboardLoadMore } from "@/features/community/components/LeaderboardLoadMore";
import { UserAvatar } from "@/shared/components/bvc/UserAvatar";
import { cn } from "@/shared/utils/cn";
import { type LeaderboardCategory, type LeaderboardRow } from "@/features/community/types/leaderboardTypes";
import { formatLeaderboardValue } from "@/features/community/utils/leaderboardFormat";

interface LeaderboardRankListProps {
  rows: LeaderboardRow[];
  category: LeaderboardCategory;
  viewerId: string | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMoreError: string | null;
  onLoadMore: () => void;
}

// Ranks 4 and below, the viewer's own row tinted; "Xem thêm" appends the next page.
export function LeaderboardRankList({ rows, category, viewerId, ...loadMore }: LeaderboardRankListProps) {
  return (
    <div className="flex flex-col">
      {rows.length > 0 && (
        <ul aria-label="Danh sách xếp hạng">
          {rows.map((row) => {
            const isViewer = row.studentId === viewerId;
            return (
              <li
                key={row.studentId}
                aria-current={isViewer ? "true" : undefined}
                className={cn(
                  "flex min-h-[52px] items-center gap-3 border-b border-bvc-line px-3.5 py-1.5",
                  isViewer && "rounded-bvc-md bg-bvc-accent-tint"
                )}
              >
                <span className="w-8 shrink-0 font-bvc-mono text-[13px] text-bvc-muted">{row.rank}</span>
                <UserAvatar name={row.fullName} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[14px] font-semibold text-bvc-ink">{row.fullName}</span>
                  <span className="truncate text-[11px] text-bvc-muted">{row.className}</span>
                </span>
                <span className="font-bvc-mono text-[14px] font-bold text-bvc-ink">
                  {formatLeaderboardValue(category, row.value)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <LeaderboardLoadMore {...loadMore} />
    </div>
  );
}
