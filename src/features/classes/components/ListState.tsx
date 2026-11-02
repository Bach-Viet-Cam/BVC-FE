import { ActionButton } from "@/shared/components/bvc/ActionButton";

interface ListStateProps {
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  emptyMessage: string;
  onRetry: () => void;
  skeletonCount?: number;
  children: React.ReactNode;
}

// Loading skeleton, MSG-09 load error with retry, MSG-06 / MSG-07 empty messages.
export function ListState({
  isLoading,
  error,
  isEmpty,
  emptyMessage,
  onRetry,
  skeletonCount = 3,
  children,
}: ListStateProps) {
  if (isLoading) {
    return (
      <div aria-busy="true" aria-label="Đang tải" className="flex flex-col gap-[10px]">
        {Array.from({ length: skeletonCount }, (_, index) => (
          <div key={index} className="h-[104px] animate-pulse rounded-bvc-xl bg-bvc-soft" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-[10px] rounded-bvc-xl border border-bvc-border p-[15px] text-[13.5px]"
      >
        <span>{error}</span>
        <ActionButton variant="secondary" onClick={onRetry}>
          Thử lại
        </ActionButton>
      </div>
    );
  }
  if (isEmpty) {
    return <p className="rounded-bvc-xl bg-bvc-soft p-[15px] text-[13.5px] text-bvc-muted">{emptyMessage}</p>;
  }
  return <>{children}</>;
}
