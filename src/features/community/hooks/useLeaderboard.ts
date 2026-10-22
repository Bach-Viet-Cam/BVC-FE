import { useCallback, useState } from "react";
import { leaderboardApi } from "@/features/community/api/leaderboardApi";
import { LEADERBOARD_MESSAGES, LEADERBOARD_PAGE_SIZE } from "@/features/community/constants/leaderboardConstants";
import { type LeaderboardCategory, type LeaderboardRow } from "@/features/community/types/leaderboardTypes";
import { useApiQuery } from "@/shared/hooks/useApiQuery";

interface MoreState {
  category: LeaderboardCategory;
  items: LeaderboardRow[];
  page: number;
  isLoading: boolean;
  hasError: boolean;
}

const initialMore = (category: LeaderboardCategory): MoreState => ({
  category,
  items: [],
  page: 1,
  isLoading: false,
  hasError: false,
});

// Current-semester leaderboard (UC-17) of one tab; "Xem thêm" appends the next page to the first one.
export function useLeaderboard(category: LeaderboardCategory) {
  const query = useApiQuery(
    `leaderboard:${category}`,
    async () => (await leaderboardApi.getCurrent({ category, page: 1, limit: LEADERBOARD_PAGE_SIZE })).data.data
  );
  const [more, setMore] = useState<MoreState>(initialMore(category));
  // A tab switch leaves the previous tab's extra pages behind
  const activeMore = more.category === category ? more : initialMore(category);

  const { data, reload: reloadFirstPage } = query;
  const loadedCount = (data?.items.length ?? 0) + activeMore.items.length;
  const hasMore = data !== null && loadedCount < data.pagination.total;

  const loadMore = useCallback(async () => {
    if (activeMore.isLoading) return;
    const nextPage = activeMore.page + 1;
    setMore({ ...activeMore, isLoading: true, hasError: false });
    try {
      const result = (await leaderboardApi.getCurrent({ category, page: nextPage, limit: LEADERBOARD_PAGE_SIZE })).data
        .data;
      setMore({
        category,
        items: [...activeMore.items, ...result.items],
        page: nextPage,
        isLoading: false,
        hasError: false,
      });
    } catch {
      setMore({ ...activeMore, isLoading: false, hasError: true });
    }
  }, [activeMore, category]);

  const reload = useCallback(() => {
    setMore(initialMore(category));
    reloadFirstPage();
  }, [category, reloadFirstPage]);

  return {
    result: query.isLoading ? null : data,
    items: [...(data?.items ?? []), ...activeMore.items],
    isLoading: query.isLoading,
    error: query.error ? LEADERBOARD_MESSAGES.LOAD_ERROR : null,
    reload,
    hasMore,
    isLoadingMore: activeMore.isLoading,
    loadMoreError: activeMore.hasError ? LEADERBOARD_MESSAGES.LOAD_ERROR : null,
    loadMore,
  };
}
