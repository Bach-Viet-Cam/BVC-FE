import { LeaderboardMetaLine } from "@/features/community/components/LeaderboardMetaLine";
import { LeaderboardPodium } from "@/features/community/components/LeaderboardPodium";
import { LeaderboardRankList } from "@/features/community/components/LeaderboardRankList";
import { LeaderboardTable } from "@/features/community/components/LeaderboardTable";
import { MyRankCard } from "@/features/community/components/MyRankCard";
import { LEADERBOARD_MESSAGES } from "@/features/community/constants/leaderboardConstants";
import { useLeaderboard } from "@/features/community/hooks/useLeaderboard";
import { type LeaderboardCategory } from "@/features/community/types/leaderboardTypes";
import { getEmptyCategoryMessage } from "@/features/community/utils/leaderboardFormat";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { EmptyState } from "@/shared/components/bvc/EmptyState";

interface LeaderboardPanelProps {
  category: LeaderboardCategory;
  viewerId: string | null;
  // Only students have a standing of their own
  showMyRank: boolean;
  // "table" is the web layout of lecturers and admins; phones always use the list
  layout?: "list" | "table";
}

// Body of the leaderboard screens: loading, MSG-09 style error, MSG-49 / 51 / 52 empties, podium and list.
export function LeaderboardPanel({ category, viewerId, showMyRank, layout = "list" }: LeaderboardPanelProps) {
  const board = useLeaderboard(category);

  if (board.isLoading) {
    return (
      <div aria-busy="true" aria-label="Đang tải" className="flex flex-col gap-2.5">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-[52px] animate-pulse rounded-bvc-md bg-bvc-soft" />
        ))}
      </div>
    );
  }
  if (board.error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-2.5 rounded-bvc-lg border border-bvc-border p-4 text-[13.5px]"
      >
        <span>{board.error}</span>
        <ActionButton variant="secondary" onClick={board.reload}>
          Thử lại
        </ActionButton>
      </div>
    );
  }
  const { result } = board;
  if (!result) return null;

  const hasNoRanking = result.generatedAt === null || result.totalRanked === 0;
  return (
    <div className="flex flex-col gap-3.5">
      <LeaderboardMetaLine semesterLabel={result.semester?.label ?? null} generatedAt={result.generatedAt} />
      {hasNoRanking ? (
        <EmptyState title={LEADERBOARD_MESSAGES.NO_RANKING} />
      ) : (
        <>
          {showMyRank && result.me && (
            <MyRankCard me={result.me} category={category} categoryTotal={result.categoryTotal} />
          )}
          {result.categoryTotal === 0 ? (
            <EmptyState title={getEmptyCategoryMessage(category)} />
          ) : (
            <>
              <LeaderboardPodium rows={result.top3} category={category} viewerId={viewerId} layout={layout} />
              {layout === "table" ? (
                <LeaderboardTable
                  viewerId={viewerId}
                  rows={board.items}
                  category={category}
                  hasMore={board.hasMore}
                  isLoadingMore={board.isLoadingMore}
                  loadMoreError={board.loadMoreError}
                  onLoadMore={() => void board.loadMore()}
                />
              ) : (
                <LeaderboardRankList
                  rows={board.items}
                  category={category}
                  viewerId={viewerId}
                  hasMore={board.hasMore}
                  isLoadingMore={board.isLoadingMore}
                  loadMoreError={board.loadMoreError}
                  onLoadMore={() => void board.loadMore()}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
