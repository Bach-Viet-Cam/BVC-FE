import { useState } from "react";
import { LeaderboardPanel } from "@/features/community/components/LeaderboardPanel";
import { LEADERBOARD_TABS } from "@/features/community/constants/leaderboardConstants";
import { type LeaderboardCategory } from "@/features/community/types/leaderboardTypes";
import { PillTabs } from "@/shared/components/bvc/PillTabs";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { useAuth } from "@/shared/context/AuthContext";
import { useIsMobile } from "@/shared/hooks/use-mobile";

// UC-17 student screen inside the student shell at every width: podium + table on web,
// a compact ranked list below 768 px. Either way the viewer's own standing sits on top.
export function LeaderboardPage() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [category, setCategory] = useState<LeaderboardCategory>("overall");
  const viewerId = user?.userId ?? null;

  return (
    <StudentShell>
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-5 px-[18px] pt-5 pb-10 md:gap-6 md:px-14 md:pt-8">
        <h1 className="text-[27px] leading-tight font-extrabold tracking-[-0.025em] text-bvc-ink md:text-[40px] md:tracking-[-0.03em]">
          Bảng xếp hạng
        </h1>
        <PillTabs label="Hạng mục xếp hạng" tabs={LEADERBOARD_TABS} value={category} onChange={setCategory} />
        <LeaderboardPanel category={category} viewerId={viewerId} showMyRank layout={isMobile ? undefined : "table"} />
      </div>
    </StudentShell>
  );
}
