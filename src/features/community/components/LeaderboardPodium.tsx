import { UserAvatar } from "@/shared/components/bvc/UserAvatar";
import { cn } from "@/shared/utils/cn";
import { type LeaderboardCategory, type LeaderboardRow } from "@/features/community/types/leaderboardTypes";
import { formatLeaderboardValue } from "@/features/community/utils/leaderboardFormat";

interface LeaderboardPodiumProps {
  rows: LeaderboardRow[];
  category: LeaderboardCategory;
  viewerId: string | null;
  // "table" = web podium (2nd, 1st, 3rd with pedestals); "list" = compact PWA cards
  layout?: "list" | "table";
}

// Web order puts the winner in the middle; equal ranks keep the BE order.
function arrangeForWeb(rows: LeaderboardRow[]): LeaderboardRow[] {
  if (rows.length < 3) return rows;
  return [rows[1], rows[0], rows[2]];
}

export function LeaderboardPodium({ rows, category, viewerId, layout = "list" }: LeaderboardPodiumProps) {
  if (rows.length === 0) return null;
  const isWeb = layout === "table";
  const shown = isWeb ? arrangeForWeb(rows) : rows;

  return (
    <ol
      aria-label="Top 3"
      className={cn("grid grid-cols-3", isWeb ? "mx-auto w-full max-w-3xl items-end gap-5" : "gap-2")}
    >
      {shown.map((row) => {
        const isViewer = row.studentId === viewerId;
        const isFirst = row.rank === 1;
        return (
          <li
            key={row.studentId}
            aria-current={isViewer ? "true" : undefined}
            className={cn(
              "flex min-w-0 flex-col items-center text-center",
              isWeb
                ? cn(
                    "justify-end gap-1.5 rounded-t-bvc-xl border px-4 pt-6 pb-5",
                    isFirst ? "min-h-[230px]" : "min-h-[190px]"
                  )
                : "gap-1 rounded-bvc-lg border px-2 py-3",
              isViewer ? "border-bvc-accent-border bg-bvc-accent-tint" : "border-bvc-border bg-white"
            )}
          >
            <span
              className={cn(
                "font-bvc-mono font-extrabold",
                isWeb ? "text-[32px]" : "text-[20px]",
                isFirst ? "text-bvc-gold" : "text-bvc-ink"
              )}
            >
              {row.rank}
            </span>
            <UserAvatar name={row.fullName} className={isWeb ? "size-14 text-[17px]" : undefined} />
            <span className={cn("w-full truncate font-bold text-bvc-ink", isWeb ? "text-[16px]" : "text-[13px]")}>
              {row.fullName}
            </span>
            <span className={cn("w-full truncate text-bvc-muted", isWeb ? "text-[13px]" : "text-[11px]")}>
              {row.className}
            </span>
            <span className={cn("font-bvc-mono font-bold text-bvc-ink", isWeb ? "text-[20px]" : "text-[14px]")}>
              {formatLeaderboardValue(category, row.value)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
