import { formatGeneratedAt } from "@/features/community/utils/leaderboardFormat";

interface LeaderboardMetaLineProps {
  semesterLabel: string | null;
  generatedAt: string | null;
}

export function LeaderboardMetaLine({ semesterLabel, generatedAt }: LeaderboardMetaLineProps) {
  const parts = [semesterLabel, generatedAt ? `Cập nhật ${formatGeneratedAt(generatedAt)}` : null].filter(Boolean);
  if (parts.length === 0) return null;
  return <p className="text-[12.5px] text-bvc-muted">{parts.join(" · ")}</p>;
}
