import { format, parseISO } from "date-fns";
import { LEADERBOARD_MESSAGES } from "@/features/community/constants/leaderboardConstants";
import { type LeaderboardCategory, type LeaderboardMe } from "@/features/community/types/leaderboardTypes";

const oneDecimal = (value: number) => (Math.round(value * 10) / 10).toString();

// Tab value shown next to every row: score, %, +x.x%, n ngày, n buổi.
export function formatLeaderboardValue(category: LeaderboardCategory, value: number): string {
  switch (category) {
    case "accuracy":
      return `${oneDecimal(value)}%`;
    case "improvement":
      return `${value > 0 ? "+" : ""}${oneDecimal(value)}%`;
    case "streak":
      return `${value} ngày`;
    case "activity":
      return `${value} buổi`;
    default:
      return oneDecimal(value);
  }
}

// HH:mm dd/MM/yyyy in the viewer's browser time zone
export function formatGeneratedAt(isoDate: string): string {
  return format(parseISO(isoDate), "HH:mm dd/MM/yyyy");
}

// MSG-50 / 51 / 52 for a viewer who is not ranked in the current tab
export function getUnrankedMessage(me: Exclude<LeaderboardMe, { status: "RANKED" }>): string {
  if (me.status === "NO_ACTIVITY") return LEADERBOARD_MESSAGES.NO_ACTIVITY;
  return me.reason === "NO_PREVIOUS_WEEK" ? LEADERBOARD_MESSAGES.NO_PREVIOUS_WEEK : LEADERBOARD_MESSAGES.NO_DATA;
}

// Message of a tab nobody is ranked in
export function getEmptyCategoryMessage(category: LeaderboardCategory): string {
  return category === "improvement" ? LEADERBOARD_MESSAGES.NO_PREVIOUS_WEEK : LEADERBOARD_MESSAGES.NO_DATA;
}
