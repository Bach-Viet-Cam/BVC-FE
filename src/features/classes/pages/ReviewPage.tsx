import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ListState } from "@/features/classes/components/ListState";
import { SubmissionCard } from "@/features/classes/components/SubmissionCard";
import { useAssignmentList } from "@/features/classes/hooks/useAssignmentList";
import { useClassList } from "@/features/classes/hooks/useClassList";
import { useCommentHandler } from "@/features/classes/hooks/useCommentHandler";
import { useStudentSubmissions } from "@/features/classes/hooks/useStudentSubmissions";
import { useTeacherAssignmentDetail } from "@/features/classes/hooks/useTeacherAssignmentDetail";
import { buildReviewQueue, formatQueueScore, formatQueueSubtitle } from "@/features/classes/utils/reviewFormat";
import { cn } from "@/shared/utils/cn";

const SELECT_CLASSES =
  "h-[40px] w-full rounded-[12px] border border-bvc-border-strong bg-white px-3 text-[13px] text-bvc-ink focus:outline-none disabled:opacity-60";
const NAV_BUTTON_CLASSES =
  "min-h-[42px] flex-1 cursor-pointer rounded-[14px] border border-bvc-border-strong bg-white px-[15px] text-[14px] disabled:cursor-default disabled:opacity-50 sm:flex-none";

// Lecturer listens to the submissions of one student of one assignment and writes the comments;
// the queue is the students who have submitted, newest first.
export function ReviewPage() {
  const navigate = useNavigate();
  const [classId, setClassId] = useState<string | null>(null);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);

  const classList = useClassList({ status: "ALL" });
  const classes = classList.result?.items ?? [];
  const selectedClass =
    classes.find((cls) => cls.id === classId) ?? classes.find((cls) => cls.status === "ACTIVE") ?? classes[0] ?? null;

  const assignmentList = useAssignmentList(selectedClass ? { classId: selectedClass.id } : null);
  const assignments = (assignmentList.result?.items ?? []).filter((item) => item.status !== "DRAFT");
  const selectedAssignment =
    assignments.find((item) => item.id === assignmentId) ??
    assignments.find((item) => item.submittedCount > 0) ??
    assignments[0] ??
    null;

  const detail = useTeacherAssignmentDetail(selectedAssignment?.id);
  const queue = buildReviewQueue(detail.assignment?.students ?? []);
  const selectedStudent = queue.find((student) => student.studentId === studentId) ?? queue[0] ?? null;
  const selectedIndex = selectedStudent ? queue.indexOf(selectedStudent) : -1;

  const submissions = useStudentSubmissions(selectedAssignment?.id ?? null, selectedStudent?.studentId ?? null);
  const handleSaveComment = useCommentHandler(submissions.reload);
  const result = submissions.result;
  // Show the skeleton when switching student, but not on the reload after saving (it would drop unsent text).
  const isSwitchingStudent = submissions.isLoading && result?.student.id !== selectedStudent?.studentId;

  const isLoading = classList.isLoading || assignmentList.isLoading || detail.isLoading;
  const loadError = classList.error ?? assignmentList.error ?? detail.error;
  const emptyMessage = !selectedClass
    ? "Bạn chưa có lớp nào."
    : !selectedAssignment
      ? "Lớp chưa có bài tập nào đã đăng."
      : "Chưa có sinh viên nào nộp bài.";

  const goTo = (index: number) => setStudentId(queue[index]?.studentId ?? null);

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-white lg:min-h-0 lg:overflow-hidden">
      <header className="flex shrink-0 flex-wrap items-center gap-[12px] border-b border-bvc-border-strong px-[18px] py-[16px] lg:gap-[16px] lg:px-[32px] lg:py-[22px] lg:pb-[18px]">
        <button
          type="button"
          aria-label="Quay lại"
          onClick={() => navigate("/teacher/home")}
          className="flex size-[42px] shrink-0 cursor-pointer items-center justify-center rounded-[14px] border border-bvc-border-strong bg-white text-bvc-ink"
        >
          <ChevronLeft size={20} strokeWidth={1.8} />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-bvc-muted">
            {selectedStudent ? `Hàng đợi nhận xét · ${selectedIndex + 1} / ${queue.length}` : "Nhận xét bài nộp"}
          </div>
          <div className="truncate text-[19px] font-extrabold tracking-[-0.025em] lg:text-[24px]">
            {selectedStudent && selectedAssignment
              ? `${selectedStudent.fullName} - ${selectedAssignment.title}`
              : "Chọn bài nộp để nhận xét"}
          </div>
        </div>
        <div className="flex w-full gap-[9px] sm:w-auto">
          <button
            type="button"
            disabled={selectedIndex <= 0}
            onClick={() => goTo(selectedIndex - 1)}
            className={NAV_BUTTON_CLASSES}
          >
            Bài trước
          </button>
          <button
            type="button"
            disabled={selectedIndex < 0 || selectedIndex >= queue.length - 1}
            onClick={() => goTo(selectedIndex + 1)}
            className={NAV_BUTTON_CLASSES}
          >
            Bài sau
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
        <aside className="flex w-full shrink-0 flex-col gap-[10px] border-b border-bvc-border-strong bg-bvc-surface p-[16px_12px] lg:w-[290px] lg:overflow-y-auto lg:border-r lg:border-b-0">
          <select
            aria-label="Chọn lớp"
            value={selectedClass?.id ?? ""}
            disabled={classes.length === 0}
            onChange={(event) => {
              setClassId(event.target.value);
              setAssignmentId(null);
              setStudentId(null);
            }}
            className={SELECT_CLASSES}
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} · {cls.cohort}
              </option>
            ))}
          </select>
          <select
            aria-label="Chọn bài tập"
            value={selectedAssignment?.id ?? ""}
            disabled={assignments.length === 0}
            onChange={(event) => {
              setAssignmentId(event.target.value);
              setStudentId(null);
            }}
            className={SELECT_CLASSES}
          >
            {assignments.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} ({item.submittedCount}/{item.memberCount})
              </option>
            ))}
          </select>

          <div className="px-[6px] pt-[4px] text-[12px] font-bold uppercase tracking-[0.1em] text-bvc-muted">
            Đã nộp bài
          </div>
          <ListState
            isLoading={isLoading}
            error={loadError}
            isEmpty={queue.length === 0}
            emptyMessage={emptyMessage}
            onRetry={() => {
              classList.reload();
              assignmentList.reload();
              detail.reload();
            }}
            skeletonCount={4}
          >
            <div className="flex flex-col gap-[4px]">
              {queue.map((student) => {
                const isActive = student.studentId === selectedStudent?.studentId;
                return (
                  <button
                    key={student.studentId}
                    type="button"
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => setStudentId(student.studentId)}
                    className={cn(
                      "flex cursor-pointer flex-col gap-[3px] rounded-[14px] border p-[11px_12px] text-left",
                      isActive ? "border-bvc-accent-border bg-white" : "border-transparent"
                    )}
                  >
                    <span className="flex items-center justify-between gap-[8px]">
                      <span className={cn("text-[14px]", isActive && "font-bold text-bvc-accent-text")}>
                        {student.fullName}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-[13px] font-semibold",
                          student.status === "PASSED" ? "text-bvc-ok" : "text-bvc-muted"
                        )}
                      >
                        {formatQueueScore(student)}
                      </span>
                    </span>
                    <span className="text-[12px] text-bvc-muted">{formatQueueSubtitle(student)}</span>
                  </button>
                );
              })}
            </div>
          </ListState>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col gap-[10px] p-[18px] lg:overflow-y-auto lg:p-[22px_32px_26px]">
          {selectedStudent && (
            <ListState
              isLoading={isSwitchingStudent}
              error={result ? null : submissions.error}
              isEmpty={(result?.submissions.length ?? 0) === 0}
              emptyMessage="Sinh viên chưa có bài nộp nào."
              onRetry={submissions.reload}
            >
              <div className="grid gap-[10px] xl:grid-cols-2">
                {result?.submissions.map((submission) => (
                  <SubmissionCard
                    key={`${submission.id}:${submission.comment?.updatedAt ?? "new"}`}
                    submission={submission}
                    canComment={result.canComment}
                    onSaveComment={handleSaveComment(submission.id)}
                  />
                ))}
              </div>
            </ListState>
          )}
        </section>
      </div>
    </div>
  );
}
