import { useState } from "react";
import { MessageSquareText } from "lucide-react";
import { formatVietnamDateTime } from "@/features/classes/utils/teacherAssignmentFormat";
import { AccuracyLinesChart } from "@/features/practice/components/AccuracyLinesChart";
import { useMyStats } from "@/features/practice/hooks/useMyStats";

const CARD = "rounded-bvc-xl border border-bvc-border bg-white p-4 md:p-5.5";

// Đầu trang Lịch sử nộp bài: đánh giá chung của giảng viên (chỉ đọc) và đồ thị độ chính xác theo bài của lớp.
// Lỗi ở đây chỉ ảnh hưởng phần này, danh sách bài nộp bên dưới vẫn chạy.
export function MyStatsSection() {
  const [classId, setClassId] = useState<string | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const { stats, isLoading, error, reload } = useMyStats(classId);

  if (error && !stats) {
    return (
      <div className={`${CARD} flex flex-wrap items-center justify-between gap-3`}>
        <p className="text-[13px] text-bvc-muted">{error}</p>
        <button
          type="button"
          onClick={reload}
          className="min-h-9 cursor-pointer rounded-full border border-bvc-border-strong px-4 text-[13px] font-medium text-bvc-ink"
        >
          Thử lại
        </button>
      </div>
    );
  }
  if (!stats) {
    return isLoading && classId !== null ? <div className="h-40 animate-pulse rounded-bvc-xl bg-bvc-surface" /> : null;
  }

  const classes = stats.classes ?? [];
  const hasScores = stats.assignments.some((assignment) => assignment.bestAccuracy !== null);

  return (
    <div className="flex flex-col gap-3.5">
      {classes.length > 1 && (
        <select
          aria-label="Chọn lớp"
          value={stats.class.id}
          onChange={(event) => {
            setClassId(event.target.value);
            setSelectedAssignmentId(null);
          }}
          className="h-9 w-fit max-w-full rounded-full border border-bvc-border-strong bg-white px-3 text-[13px] text-bvc-ink focus:outline-none"
        >
          {classes.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {classItem.name} · {classItem.cohort}
            </option>
          ))}
        </select>
      )}

      {stats.evaluation && (
        <section className={`${CARD} flex flex-col gap-2`}>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-bvc-ink">
            <MessageSquareText className="size-4 text-bvc-accent" aria-hidden />
            Đánh giá của giảng viên
          </h2>
          <p className="text-[14px] leading-[1.55] whitespace-pre-line text-bvc-ink">{stats.evaluation.content}</p>
          <p className="text-[12px] text-bvc-muted">
            {stats.evaluation.lecturerName} · {formatVietnamDateTime(stats.evaluation.updatedAt)}
          </p>
        </section>
      )}

      {hasScores && (
        <AccuracyLinesChart
          key={stats.class.id}
          assignments={stats.assignments}
          selectedAssignmentId={selectedAssignmentId}
          onSelectAssignment={setSelectedAssignmentId}
        />
      )}
    </div>
  );
}
