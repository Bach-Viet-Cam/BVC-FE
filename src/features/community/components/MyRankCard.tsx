import { type LeaderboardCategory, type LeaderboardMe } from "@/features/community/types/leaderboardTypes";
import { formatLeaderboardValue, getUnrankedMessage } from "@/features/community/utils/leaderboardFormat";

interface MyRankCardProps {
  me: LeaderboardMe;
  category: LeaderboardCategory;
  categoryTotal: number;
}

// "Hạng của bạn": rank / total / value, or MSG-50 / 51 / 52 when the student is not ranked on this tab.
export function MyRankCard({ me, category, categoryTotal }: MyRankCardProps) {
  return (
    <section aria-label="Hạng của bạn" className="rounded-bvc-xl bg-bvc-accent-tint px-4 py-3.5 text-bvc-ink">
      <h2 className="text-[12px] font-bold tracking-[0.12em] text-bvc-accent-text uppercase">Hạng của bạn</h2>
      {me.status === "RANKED" ? (
        <div className="mt-1 flex items-end justify-between gap-3">
          <p className="font-bvc-mono text-[28px] leading-none font-extrabold">
            {me.rank}
            <span className="text-[15px] font-semibold text-bvc-muted"> / {categoryTotal}</span>
          </p>
          <p className="font-bvc-mono text-[20px] font-bold">{formatLeaderboardValue(category, me.value)}</p>
        </div>
      ) : (
        <p className="mt-1 text-[14px] leading-snug">{getUnrankedMessage(me)}</p>
      )}
    </section>
  );
}
