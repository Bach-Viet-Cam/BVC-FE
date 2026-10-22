import { Link } from "react-router-dom";
import { Bookmark, ClipboardList, LibraryBig, Trophy } from "lucide-react";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { TagBadge } from "@/shared/components/bvc/TagBadge";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { useAuth } from "@/shared/context/AuthContext";
import { formatDate } from "@/shared/utils/formatDate";
import { useMyAssignments } from "@/features/classes/hooks/useMyAssignments";
import { ASSIGNMENT_STATUS_META, formatShortDeadline } from "@/features/classes/utils/assignmentFormat";

const UPCOMING_LIMIT = 3;

const QUICK_LINKS = [
  { label: "Thư viện bài hát", description: "Tìm bản nhạc để luyện", to: "/library", icon: LibraryBig },
  { label: "Bài tập của tôi", description: "Xem hạn nộp và kết quả", to: "/assignments", icon: ClipboardList },
  { label: "Đã lưu", description: "Bài hát và bản nhạc đã lưu", to: "/saved", icon: Bookmark },
  { label: "Bảng xếp hạng", description: "Thứ hạng của bạn trong học kỳ", to: "/community/leaderboard", icon: Trophy },
];

// Trang chủ sinh viên: chỉ hiện dữ liệu BE đã có (bài tập); tiến độ luyện / chuỗi ngày chờ API M01
export function HomePage() {
  const { user } = useAuth();
  const { items, isLoading, error } = useMyAssignments("NON_BONUS");
  const upcoming = items.filter((item) => item.status === "NOT_SUBMITTED").slice(0, UPCOMING_LIMIT);

  return (
    <StudentShell>
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-7 px-[18px] pt-4 pb-8 md:px-14 md:pt-8">
        <div className="flex flex-col gap-1">
          <p className="text-[12px] font-semibold tracking-[0.12em] text-bvc-muted uppercase">
            Hôm nay · {formatDate(new Date().toISOString(), "EEEE, dd/MM")}
          </p>
          <h1 className="text-[27px] leading-tight font-extrabold tracking-[-0.025em] text-bvc-ink md:text-[40px] md:tracking-[-0.03em]">
            Xin chào, {user?.username}
          </h1>
        </div>

        <section aria-labelledby="upcoming-heading" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 id="upcoming-heading" className="text-xl font-extrabold tracking-[-0.02em] text-bvc-ink md:text-2xl">
              Bài tập sắp đến hạn
            </h2>
            <Link to="/assignments" className="text-[13.5px] font-semibold text-bvc-accent-text">
              Xem tất cả
            </Link>
          </div>
          {isLoading ? (
            <p className="text-[14px] text-bvc-muted">Đang tải...</p>
          ) : error ? (
            <p role="alert" className="text-[14px] text-bvc-error">
              {error}
            </p>
          ) : upcoming.length === 0 ? (
            <EmptyState title="Không có bài tập cần nộp" description="Bài tập giảng viên giao sẽ hiện ở đây." />
          ) : (
            <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((item) => {
                const status = ASSIGNMENT_STATUS_META[item.status];
                return (
                  <li key={item.id}>
                    <Link
                      to={`/assignment/${item.id}`}
                      className="flex h-full flex-col gap-2 rounded-bvc-xl border border-bvc-border p-4 text-bvc-ink hover:bg-bvc-surface hover:text-bvc-ink"
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-[15px] font-bold">{item.title}</span>
                        <TagBadge label={status.label} variant={status.variant} />
                      </span>
                      <span className="text-[13px] text-bvc-muted">{item.className}</span>
                      <span className="mt-auto text-[12.5px] font-semibold text-bvc-warn">
                        Hạn: {formatShortDeadline(item.deadline)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="quick-heading" className="flex flex-col gap-3">
          <h2 id="quick-heading" className="text-xl font-extrabold tracking-[-0.02em] text-bvc-ink md:text-2xl">
            Truy cập nhanh
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {QUICK_LINKS.map(({ label, description, to, icon: Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="flex h-full items-center gap-3 rounded-bvc-xl bg-bvc-surface p-4 text-bvc-ink hover:bg-bvc-border hover:text-bvc-ink"
                >
                  <Icon className="size-5 shrink-0 text-bvc-accent-text" strokeWidth={1.8} aria-hidden />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[14.5px] font-bold">{label}</span>
                    <span className="text-[12.5px] text-bvc-muted">{description}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <Link to="/library" className={actionButtonClass("primary", "lg", "self-start hover:text-white")}>
          Bắt đầu luyện tập
        </Link>
      </div>
    </StudentShell>
  );
}
