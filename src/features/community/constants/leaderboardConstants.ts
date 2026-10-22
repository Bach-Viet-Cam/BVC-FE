import { type LeaderboardCategory } from "@/features/community/types/leaderboardTypes";

// MSG-49..52 (UC-17); the BE only returns a status, the text lives here.
export const LEADERBOARD_MESSAGES = {
  NO_RANKING: "Học kỳ này chưa có dữ liệu xếp hạng.",
  NO_ACTIVITY: "Bạn chưa có hoạt động nào trong học kỳ này nên chưa được xếp hạng.",
  NO_DATA: "Hạng mục này chưa có dữ liệu.",
  NO_PREVIOUS_WEEK: "Chưa có dữ liệu tuần trước để so sánh tiến bộ.",
  LOAD_ERROR: "Tải bảng xếp hạng thất bại. Vui lòng thử lại.",
} as const;

export const LEADERBOARD_TABS: { value: LeaderboardCategory; label: string }[] = [
  { value: "overall", label: "Xếp hạng tổng" },
  { value: "accuracy", label: "Chính xác nhất" },
  { value: "improvement", label: "Tiến bộ nhất" },
  { value: "streak", label: "Chuỗi luyện tập" },
  { value: "activity", label: "Tích cực nhất" },
];

export const LEADERBOARD_PAGE_SIZE = 50;
