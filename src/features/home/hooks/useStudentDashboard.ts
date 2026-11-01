import { homeApi } from "@/features/home/api/homeApi";
import { practiceSubmissionApi } from "@/features/practice/api/practiceSubmissionApi";
import { useAsyncData } from "@/shared/hooks/useAsyncData";

const RECENT_LIMIT = 3;
const LOAD_ERROR = "Tải số liệu luyện tập thất bại. Vui lòng thử lại.";

// Trang "Hôm nay": số liệu tổng hợp và 3 lần nộp gần nhất (mọi bài, mọi trạng thái)
export function useStudentDashboard() {
  const dashboard = useAsyncData(
    () => homeApi.getDashboard().then(({ data }) => data.data),
    "student-dashboard",
    LOAD_ERROR,
    { cache: true }
  );
  const recent = useAsyncData(
    () => practiceSubmissionApi.listHistory({ page: 1, limit: RECENT_LIMIT }).then(({ data }) => data.data.items),
    "student-dashboard-recent",
    LOAD_ERROR,
    { cache: true }
  );

  return {
    dashboard: dashboard.data,
    isLoading: dashboard.isFirstLoad,
    error: dashboard.error,
    reload: dashboard.reload,
    recentSubmissions: recent.data ?? [],
    isRecentLoading: recent.isFirstLoad,
    recentError: recent.error,
  };
}
