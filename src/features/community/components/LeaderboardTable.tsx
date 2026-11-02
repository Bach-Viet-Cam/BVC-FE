import { LeaderboardLoadMore } from "@/features/community/components/LeaderboardLoadMore";
import { type LeaderboardCategory, type LeaderboardRow } from "@/features/community/types/leaderboardTypes";
import { formatLeaderboardValue } from "@/features/community/utils/leaderboardFormat";
import { TABLE_STYLES } from "@/shared/components/bvc/tableStyles";
import { cn } from "@/shared/utils/cn";

interface LeaderboardTableProps {
  rows: LeaderboardRow[];
  category: LeaderboardCategory;
  // A student's own row is tinted; null for lecturers and admins
  viewerId: string | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMoreError: string | null;
  onLoadMore: () => void;
}

const HEAD_CELL = TABLE_STYLES.headCell;

// Web layout (primary): Hạng, Họ tên, Lớp, Giá trị.
export function LeaderboardTable({ rows, category, viewerId, ...loadMore }: LeaderboardTableProps) {
  return (
    <div className="flex flex-col">
      {rows.length > 0 && (
        <div className={TABLE_STYLES.frame}>
          <table className={cn(TABLE_STYLES.table, "min-w-[560px]")}>
            <thead>
              <tr className={TABLE_STYLES.headRow}>
                <th scope="col" className={HEAD_CELL}>
                  Hạng
                </th>
                <th scope="col" className={HEAD_CELL}>
                  Họ tên
                </th>
                <th scope="col" className={HEAD_CELL}>
                  Lớp
                </th>
                <th scope="col" className={cn(HEAD_CELL, "text-right")}>
                  Giá trị
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isViewer = row.studentId === viewerId;
                return (
                  <tr
                    key={row.studentId}
                    aria-current={isViewer ? "true" : undefined}
                    className={cn(TABLE_STYLES.row, isViewer && "bg-bvc-accent-tint hover:bg-bvc-accent-tint")}
                  >
                    <td className={cn(TABLE_STYLES.cell, "font-bvc-mono text-bvc-muted")}>{row.rank}</td>
                    <td className={cn(TABLE_STYLES.cell, "font-medium")}>{row.fullName}</td>
                    <td className={cn(TABLE_STYLES.cell, "text-bvc-muted")}>{row.className}</td>
                    <td className={cn(TABLE_STYLES.cell, "text-right font-bvc-mono font-semibold")}>
                      {formatLeaderboardValue(category, row.value)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <LeaderboardLoadMore {...loadMore} />
    </div>
  );
}
