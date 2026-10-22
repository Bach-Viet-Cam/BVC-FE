import { type ChallengeDisplayStatus } from "@/features/community/types/challenge";

export const CHALLENGE_STATUS_LABELS: Record<ChallengeDisplayStatus, string> = {
  DRAFT: "Bản nháp",
  UPCOMING: "Sắp diễn ra",
  ACTIVE: "Đang diễn ra",
  ENDED: "Đã kết thúc",
};

const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

// Shifting by +7h lets the UTC getters read the Vietnam calendar day regardless of the browser zone.
function vietnamDate(iso: string): Date {
  return new Date(new Date(iso).getTime() + VIETNAM_OFFSET_MS);
}

// "28/12 - 03/01/2027". A start stored mid-week (current-week publish) is shown as that week's Monday.
export function formatWeekRange(startsAt: string, endsAt: string): string {
  const start = vietnamDate(startsAt);
  const monday = new Date(start.getTime() - ((start.getUTCDay() + 6) % 7) * DAY_MS);
  const end = vietnamDate(endsAt);
  const startText = `${pad(monday.getUTCDate())}/${pad(monday.getUTCMonth() + 1)}`;
  const endText = `${pad(end.getUTCDate())}/${pad(end.getUTCMonth() + 1)}/${end.getUTCFullYear()}`;
  return `${startText} - ${endText}`;
}
