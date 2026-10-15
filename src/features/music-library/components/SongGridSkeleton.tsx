interface SongGridSkeletonProps {
  count?: number;
}

export function SongGridSkeleton({ count = 10 }: SongGridSkeletonProps) {
  return (
    <div
      aria-hidden
      className="grid grid-cols-2 gap-x-3.5 gap-y-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex animate-pulse flex-col gap-2.5">
          <span className="aspect-square w-full rounded-[18px] bg-bvc-surface" />
          <span className="h-4 w-3/4 rounded bg-bvc-surface" />
          <span className="h-3 w-1/2 rounded bg-bvc-surface" />
        </div>
      ))}
    </div>
  );
}
