import { useState } from "react";
import { LeaderboardPanel } from "@/features/community/components/LeaderboardPanel";
import { LEADERBOARD_TABS } from "@/features/community/constants/leaderboardConstants";
import { type LeaderboardCategory } from "@/features/community/types/leaderboardTypes";
import { MobileHeader } from "@/shared/components/bvc/MobileHeader";
import { PillTabs } from "@/shared/components/bvc/PillTabs";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { useAuth } from "@/shared/context/AuthContext";
import { useIsMobile } from "@/shared/hooks/use-mobile";

// UC-17 student screen: web layout first (podium + table in the student shell), the PWA frame below 768 px.
// Either way the viewer's own standing sits on top.
export function LeaderboardPage() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [category, setCategory] = useState<LeaderboardCategory>("overall");
  const viewerId = user?.userId ?? null;
  const tabs = <PillTabs label="Hạng mục xếp hạng" tabs={LEADERBOARD_TABS} value={category} onChange={setCategory} />;

  if (isMobile) {
    return (
      <div className="flex min-h-dvh justify-center bg-bvc-surface">
        <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">
          <MobileHeader title="Bảng xếp hạng" variant="back" />
          <div className="shrink-0 px-3.5 pb-3">{tabs}</div>
          <div className="flex-1 overflow-y-auto px-3.5 pb-6">
            <LeaderboardPanel category={category} viewerId={viewerId} showMyRank />
          </div>
        </div>
      </div>
    );
  }

  return (
    <StudentShell>
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-14 pt-8 pb-10">
        <h1 className="text-[40px] leading-tight font-extrabold tracking-[-0.03em] text-bvc-ink">Bảng xếp hạng</h1>
        {tabs}
        <LeaderboardPanel category={category} viewerId={viewerId} showMyRank layout="table" />
      </div>
    </StudentShell>
  );
}
