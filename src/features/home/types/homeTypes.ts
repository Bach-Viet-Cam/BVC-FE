// GET /practice/dashboard - số liệu trang "Hôm nay" của sinh viên.
// Độ chính xác chỉ tính các bài đã phân tích xong; null khi chưa có bài nào như vậy.

export interface DashboardToday {
  submitted: number;
  completed: number;
  bestAccuracy: number | null;
  averageAccuracy: number | null;
}

export interface DashboardDay {
  // yyyy-MM-dd theo giờ Việt Nam
  date: string;
  submitted: number;
  averageAccuracy: number | null;
}

export interface DashboardAssignment {
  assignmentId: string;
  title: string;
  submissionCount: number;
  firstAccuracy: number | null;
  latestAccuracy: number | null;
  // Lần gần nhất trừ lần đầu; null khi chưa đủ 2 lần đã phân tích
  deltaPercent: number | null;
}

export interface DashboardPoint {
  accuracy: number;
  submittedAt: string;
}

export interface DashboardModeProgress {
  completed: number;
  // Các lần đã phân tích gần nhất, cũ trước mới sau
  points: DashboardPoint[];
  latestAccuracy: number | null;
  averageAccuracy: number | null;
  deltaPercent: number | null;
}

export interface StudentDashboard {
  totalSubmissions: number;
  today: DashboardToday;
  recentDays: DashboardDay[];
  mostSubmittedAssignment: DashboardAssignment | null;
  mostImprovedAssignment: DashboardAssignment | null;
  solo: DashboardModeProgress;
  ensemble: DashboardModeProgress;
}
