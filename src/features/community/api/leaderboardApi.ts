import { axiosClient } from "@/shared/api/axiosClient";
import { type ApiResponse } from "@/shared/types/commonTypes";
import { type LeaderboardParams, type LeaderboardResult } from "@/features/community/types/leaderboardTypes";

export const leaderboardApi = {
  getCurrent: (params: LeaderboardParams) =>
    axiosClient.get<ApiResponse<LeaderboardResult>>("/leaderboards/current", { params }),
};
