import { ActionButton } from "@/shared/components/bvc/ActionButton";

interface LeaderboardLoadMoreProps {
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMoreError: string | null;
  onLoadMore: () => void;
}

// Error of the failed page plus the "Xem thêm" button that appends the next one.
export function LeaderboardLoadMore({ hasMore, isLoadingMore, loadMoreError, onLoadMore }: LeaderboardLoadMoreProps) {
  return (
    <>
      {loadMoreError && (
        <p role="alert" className="px-3.5 pt-2 text-[13px] text-bvc-error">
          {loadMoreError}
        </p>
      )}
      {hasMore && (
        <div className="flex justify-center py-3">
          <ActionButton variant="secondary" onClick={onLoadMore} isLoading={isLoadingMore}>
            Xem thêm
          </ActionButton>
        </div>
      )}
    </>
  );
}
