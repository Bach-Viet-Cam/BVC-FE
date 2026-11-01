import { Link } from "react-router-dom";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { TagBadge } from "@/shared/components/bvc/TagBadge";
import type { AssignmentListItem } from "@/features/classes/types/assignmentTypes";
import { ASSIGNMENT_STATUS_META, formatShortDeadline } from "@/features/classes/utils/assignmentFormat";

interface UpcomingAssignmentsProps {
  items: AssignmentListItem[];
  isLoading: boolean;
  error: string | null;
}

// Bài tập chưa nộp, hạn gần nhất trước
export function UpcomingAssignments({ items, isLoading, error }: UpcomingAssignmentsProps) {
  return (
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
      ) : items.length === 0 ? (
        <EmptyState
          title="Không có bài tập cần nộp"
          description="Bài tập giảng viên giao sẽ hiện ở đây."
          className="py-8"
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => {
            const status = ASSIGNMENT_STATUS_META[item.status];
            return (
              <li key={item.id}>
                <Link
                  to={`/assignment/${item.id}`}
                  className="flex flex-col gap-1.5 rounded-bvc-xl border border-bvc-border bg-white p-4 text-bvc-ink hover:bg-bvc-soft hover:text-bvc-ink"
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-[15px] font-bold">{item.title}</span>
                    <TagBadge label={status.label} variant={status.variant} />
                  </span>
                  <span className="flex items-center justify-between gap-2 text-[12.5px]">
                    <span className="truncate text-bvc-muted">{item.className}</span>
                    <span className="shrink-0 font-semibold text-bvc-warn">
                      Hạn: {formatShortDeadline(item.deadline)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
