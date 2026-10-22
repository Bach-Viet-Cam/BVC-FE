import { LeaderboardLoadMore } from "@/features/community/components/LeaderboardLoadMore";
import { type LeaderboardCategory, type LeaderboardRow } from "@/features/community/types/leaderboardTypes";
import { formatLeaderboardValue } from "@/features/community/utils/leaderboardFormat";
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

const HEAD_CELL = "px-5 py-3 text-left text-[12px] font-bold uppercase tracking-[0.08em] text-bvc-muted";

// Web layout (primary): Hạng, Họ tên, Lớp, Giá trị.
export function LeaderboardTable({ rows, category, viewerId, ...loadMore }: LeaderboardTableProps) {
  return (
    <div className="flex flex-col">
      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-[20px] border border-bvc-border bg-white">
          <table className="w-full min-w-[560px] border-collapse text-[14px]">
            <thead className="bg-bvc-surface">
              <tr>
                <th scope="col" className={HEAD_CELL}>
                  Hạng
                </th>
                <th scope="col" className={HEAD_CELL}>
                  Họ tên
                </th>
                <th scope="col" className={HEAD_CELL}>
                  Lớp
                </th>
                <th scope="col" className={`${HEAD_CELL} text-right`}>
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
                    className={cn("border-t border-bvc-line", isViewer && "bg-bvc-accent-tint")}
                  >
                    <td className="px-5 py-3 font-bvc-mono text-bvc-muted">{row.rank}</td>
                    <td className="px-5 py-3 font-semibold text-bvc-ink">{row.fullName}</td>
                    <td className="px-5 py-3 text-bvc-muted">{row.className}</td>
                    <td className="px-5 py-3 text-right font-bvc-mono font-bold text-bvc-ink">
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
