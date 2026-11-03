import { Link } from "react-router-dom";
import { Bookmark, ClipboardList, LibraryBig, Music2, Trophy, Users } from "lucide-react";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { StatCard } from "@/shared/components/bvc/StatCard";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { PageHero } from "@/shared/components/bvc/PageHero";
import { PillLink } from "@/shared/components/bvc/PillLink";
import { useAuth } from "@/shared/context/AuthContext";
import { formatDate } from "@/shared/utils/formatDate";
import { useMyAssignments } from "@/features/classes/hooks/useMyAssignments";
import { AccuracyTrendCard } from "@/features/home/components/AccuracyTrendCard";
import { ActivityChart } from "@/features/home/components/ActivityChart";
import { AssignmentHighlights } from "@/features/home/components/AssignmentHighlights";
import { LibrarySuggestions } from "@/features/home/components/LibrarySuggestions";
import { RecentSubmissionsCard } from "@/features/home/components/RecentSubmissionsCard";
import { UpcomingAssignments } from "@/features/home/components/UpcomingAssignments";
import { useStudentDashboard } from "@/features/home/hooks/useStudentDashboard";
import { formatPercent, summarizeAssignments } from "@/features/home/utils/homeFormat";
import { SectionTitle } from "@/shared/components/bvc/SectionTitle";

const UPCOMING_LIMIT = 3;

const QUICK_LINKS = [
  { label: "Thư viện bài hát", description: "Tìm bản nhạc để luyện", to: "/library", icon: LibraryBig },
  { label: "Bài tập của tôi", description: "Xem hạn nộp và kết quả", to: "/assignments", icon: ClipboardList },
  { label: "Đã lưu", description: "Bài hát và bản nhạc đã lưu", to: "/saved", icon: Bookmark },
  { label: "Bảng xếp hạng", description: "Thứ hạng của bạn trong học kỳ", to: "/community/leaderboard", icon: Trophy },
];

// Trang "Hôm nay" của sinh viên: số liệu luyện tập trong ngày, lần nộp gần nhất, bài tập sắp đến hạn
// và tổng hợp tiến bộ. Tài khoản chưa nộp bài nào thì thay phần số liệu bằng gợi ý từ thư viện.
export function HomePage() {
  const { user } = useAuth();
  const assignments = useMyAssignments("NON_BONUS");
  const { dashboard, isLoading, error, reload, recentSubmissions, isRecentLoading, recentError } =
    useStudentDashboard();
  const upcoming = assignments.items.filter((item) => item.status === "NOT_SUBMITTED").slice(0, UPCOMING_LIMIT);
  const hasActivity = (dashboard?.totalSubmissions ?? 0) > 0;

  const upcomingSection = (
    <UpcomingAssignments items={upcoming} isLoading={assignments.isLoading} error={assignments.error} />
  );

  return (
    <StudentShell>
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-8 px-[18px] pt-4 pb-8 md:px-14 md:pt-8">
        <PageHero
          eyebrow={`Hôm nay · ${formatDate(new Date().toISOString(), "EEEE, dd/MM")}`}
          title={`Xin chào, ${user?.username ?? "bạn"}`}
          description="Luyện một bài mỗi ngày, nộp bản thu và theo dõi sự tiến bộ của bạn ngay tại đây."
          actions={
            <>
              <PillLink to="/library" label="Luyện tập ngay" variant="light" size="md" />
              <PillLink to="/assignments" label="Bài tập" variant="glass" size="md" />
            </>
          }
        />

        {isLoading ? (
          <p className="text-[14px] text-bvc-muted">Đang tải số liệu luyện tập...</p>
        ) : error ? (
          <EmptyState
            title="Không tải được số liệu luyện tập"
            description={error}
            actions={<ActionButton onClick={reload}>Thử lại</ActionButton>}
          />
        ) : !dashboard || !hasActivity ? (
          <>
            {upcomingSection}
            <LibrarySuggestions />
          </>
        ) : (
          <>
            <section aria-labelledby="today-heading" className="flex flex-col gap-3">
              <SectionTitle id="today-heading">Luyện tập hôm nay</SectionTitle>
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Lượt nộp" value={dashboard.today.submitted} />
                  <StatCard label="Đã chấm xong" value={dashboard.today.completed} />
                  <StatCard
                    label="Điểm cao nhất"
                    value={formatPercent(dashboard.today.bestAccuracy)}
                    variant={dashboard.today.bestAccuracy === null ? "default" : "ok"}
                  />
                  <StatCard label="Điểm trung bình" value={formatPercent(dashboard.today.averageAccuracy)} />
                </div>
                <ActivityChart days={dashboard.recentDays} />
              </div>
            </section>

            <div className="grid gap-8 lg:grid-cols-2 lg:gap-6">
              <RecentSubmissionsCard items={recentSubmissions} isLoading={isRecentLoading} error={recentError} />
              {upcomingSection}
            </div>

            <section aria-labelledby="summary-heading" className="flex flex-col gap-3">
              <SectionTitle id="summary-heading">Tổng hợp bài tập</SectionTitle>
              <AssignmentHighlights
                summary={summarizeAssignments(assignments.items)}
                mostSubmitted={dashboard.mostSubmittedAssignment}
                mostImproved={dashboard.mostImprovedAssignment}
              />
              <div className="grid gap-3 md:grid-cols-2">
                <AccuracyTrendCard
                  title="Tiến bộ độc tấu"
                  icon={<Music2 className="size-4" aria-hidden />}
                  progress={dashboard.solo}
                  emptyText="Chưa có bài độc tấu nào được chấm."
                />
                <AccuracyTrendCard
                  title="Tiến bộ hòa tấu"
                  icon={<Users className="size-4" aria-hidden />}
                  progress={dashboard.ensemble}
                  emptyText="Chưa có bài hòa tấu nào được chấm. Mở một bài trong thư viện và chọn Luyện hòa tấu."
                />
              </div>
            </section>
          </>
        )}

        <section aria-labelledby="quick-heading" className="flex flex-col gap-3">
          <SectionTitle id="quick-heading">Truy cập nhanh</SectionTitle>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_LINKS.map(({ label, description, to, icon: Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="flex h-full items-center gap-3 rounded-bvc-xl bg-bvc-surface p-4 text-bvc-ink hover:bg-bvc-border hover:text-bvc-ink"
                >
                  <Icon className="size-5 shrink-0 text-bvc-accent-text" strokeWidth={1.8} aria-hidden />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[14.5px] font-semibold">{label}</span>
                    <span className="text-[12.5px] text-bvc-muted">{description}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </StudentShell>
  );
}
