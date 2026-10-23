import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LeaderboardPanel } from "@/features/community/components/LeaderboardPanel";
import { LEADERBOARD_TABS } from "@/features/community/constants/leaderboardConstants";
import { type LeaderboardCategory } from "@/features/community/types/leaderboardTypes";
import { PillTabs } from "@/shared/components/bvc/PillTabs";
import { TeacherPageHeader } from "@/shared/components/bvc/TeacherPageHeader";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";
import { useIsMobile } from "@/shared/hooks/use-mobile";

// UC-17 lecturer / admin screen: web table with podium, the mobile list below 768 px. No personal rank card.
export function LeaderboardDesktopPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [category, setCategory] = useState<LeaderboardCategory>("overall");

  return (
    <TeacherScreen>
      <TeacherPageHeader title="Bảng xếp hạng" subtitle="Cộng đồng" onBack={() => navigate(-1)} />
      <div className="flex flex-col gap-4 px-[18px] pt-2 pb-6 lg:px-[32px] lg:pt-5">
        <PillTabs label="Hạng mục xếp hạng" tabs={LEADERBOARD_TABS} value={category} onChange={setCategory} />
        <LeaderboardPanel category={category} viewerId={null} showMyRank={false} layout={isMobile ? "list" : "table"} />
      </div>
    </TeacherScreen>
  );
}
