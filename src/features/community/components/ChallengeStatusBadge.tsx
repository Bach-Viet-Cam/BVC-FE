import { type ChallengeDisplayStatus } from "@/features/community/types/challenge";
import { CHALLENGE_STATUS_LABELS } from "@/features/community/utils/challengeFormat";
import { cn } from "@/shared/utils/cn";

interface ChallengeStatusBadgeProps {
  status: ChallengeDisplayStatus;
}

const BADGE_CLASSES: Record<ChallengeDisplayStatus, string> = {
  DRAFT: "bg-bvc-surface text-bvc-muted",
  UPCOMING: "bg-bvc-soft text-bvc-ink",
  ACTIVE: "bg-bvc-accent-tint text-bvc-accent-text",
  ENDED: "bg-bvc-surface text-bvc-faint",
};

export function ChallengeStatusBadge({ status }: ChallengeStatusBadgeProps) {
  return (
    <span className={cn("inline-flex rounded-[9px] px-2 py-0.5 text-[12px] font-semibold", BADGE_CLASSES[status])}>
      {CHALLENGE_STATUS_LABELS[status]}
    </span>
  );
}
