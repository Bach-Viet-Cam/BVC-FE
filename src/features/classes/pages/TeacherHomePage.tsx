import { useNavigate } from "react-router-dom";
import { AttentionStudentsCard } from "@/features/classes/components/AttentionStudentsCard";
import { ListState } from "@/features/classes/components/ListState";
import { TodaySubmissionsCard } from "@/features/classes/components/TodaySubmissionsCard";
import { useTeacherHome } from "@/features/classes/hooks/useTeacherHome";
import { buildHomeTasks } from "@/features/classes/utils/teacherHomeFormat";
import { DesktopPageHeader, StatCard } from "@/shared/components/bvc";

export function TeacherHomePage() {
  const navigate = useNavigate();
  const { classes, attentionStudents, todaySubmissions, publishedCount, draftCount, isLoading, error, reload } =
    useTeacherHome();
  const tasks = buildHomeTasks(classes, draftCount);

  return (
    <>
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DesktopPageHeader
          breadcrumb="Trang chủ giảng viên"
          title="Trang chủ"
          actions={
            <button
              type="button"
              onClick={() => navigate("/teacher/assignments/new")}
              className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] bg-bvc-ink px-[18px] text-[14px] font-bold text-white"
            >
              Giao bài tập mới
            </button>
          }
        />

        <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto p-[22px_32px_26px]">
          <ListState isLoading={isLoading} error={error} isEmpty={false} emptyMessage="" onRetry={reload}>
            <div className="grid grid-cols-2 gap-[12px]">
              <StatCard label="Lớp đang dạy" value={classes.length} />
              <div className="flex flex-col gap-[5px] rounded-[18px] border border-bvc-accent bg-bvc-accent-tint p-[15px_16px]">
                <span className="text-[12.5px] font-semibold text-bvc-accent-text">Bài tập đang mở</span>
                <span className="font-mono text-[29px] font-semibold leading-none text-bvc-accent-text">
                  {publishedCount}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-[14px] xl:grid-cols-2">
              <AttentionStudentsCard
                students={attentionStudents}
                onOpenStudent={(student) => navigate(`/teacher/classes/${student.classId}/students/${student.userId}`)}
                onShowAll={() => navigate("/teacher/attention-students")}
              />
              <TodaySubmissionsCard
                classes={todaySubmissions}
                onShowAll={() => navigate("/teacher/today-submissions")}
              />
            </div>

            <div className="flex flex-col gap-[14px]">
              <div className="flex items-center justify-between">
                <span className="text-[17px] font-extrabold tracking-[-0.025em]">Lớp đang dạy</span>
                <button
                  type="button"
                  onClick={() => navigate("/teacher/classes")}
                  className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] border border-bvc-border-strong bg-white px-[18px] text-[14px] font-semibold text-bvc-ink"
                >
                  Xem tất cả lớp
                </button>
              </div>

              {classes.length === 0 ? (
                <p className="rounded-[18px] bg-bvc-soft p-[15px] text-[13.5px] text-bvc-muted">
                  Bạn chưa có lớp nào đang dạy.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-[14px]">
                  {classes.map((cls) => (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => navigate(`/teacher/classes/${cls.id}`)}
                      className="flex cursor-pointer flex-col gap-[10px] rounded-[20px] border border-bvc-border p-[16px] text-left"
                    >
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-bvc-muted">
                          {cls.cohort}
                        </span>
                        <div className="mt-1 text-[16px] font-bold text-bvc-ink">{cls.name}</div>
                        <div className="mt-1 text-[13px] text-bvc-muted">
                          {cls.weekLabel} · {cls.memberCount} sinh viên
                        </div>
                      </div>
                      <div className="flex items-center gap-[14px]">
                        <span className="flex items-center gap-[6px] text-[13px] text-bvc-ink">
                          <span className="size-[7px] shrink-0 rounded-full bg-bvc-ok" />
                          {cls.onTrack}
                        </span>
                        <span className="flex items-center gap-[6px] text-[13px] text-bvc-ink">
                          <span className="size-[7px] shrink-0 rounded-full bg-bvc-warn" />
                          {cls.atRisk}
                        </span>
                        <span className="flex items-center gap-[6px] text-[13px] text-bvc-ink">
                          <span className="size-[7px] shrink-0 rounded-full bg-bvc-error" />
                          {cls.behind}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col rounded-[20px] border border-bvc-border bg-white">
              <div className="border-b border-bvc-border px-[20px] py-[14px]">
                <span className="text-[15px] font-extrabold tracking-[-0.025em]">Cần xử lý hôm nay</span>
              </div>

              {tasks.length === 0 ? (
                <p className="px-[20px] text-[14px] text-bvc-muted min-h-[52px] flex items-center">
                  Hôm nay không có việc cần xử lý.
                </p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 border-b border-bvc-line px-[20px] min-h-[52px] last:border-0"
                  >
                    <span
                      className={`size-[7px] shrink-0 rounded-full ${task.tone === "warn" ? "bg-bvc-warn" : "bg-bvc-ok"}`}
                    />
                    <span className="flex-1 text-[14px] text-bvc-ink">{task.message}</span>
                    <button
                      type="button"
                      onClick={() => navigate(task.path)}
                      className="flex min-h-[36px] cursor-pointer items-center rounded-[12px] border border-bvc-border-strong bg-white px-[14px] text-[13px] font-semibold text-bvc-ink"
                    >
                      {task.actionLabel}
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center gap-[10px]">
              <button
                type="button"
                onClick={() => navigate("/teacher/assignments/new")}
                className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] bg-bvc-ink px-[18px] text-[14px] font-bold text-white"
              >
                Giao bài tập mới
              </button>
              <button
                type="button"
                onClick={() => navigate("/teacher/review")}
                className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] border border-bvc-border-strong bg-white px-[18px] text-[14px] font-semibold text-bvc-ink"
              >
                Duyệt bài nộp
              </button>
              <button
                type="button"
                onClick={() => navigate("/songs")}
                className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] border border-bvc-border-strong bg-white px-[18px] text-[14px] font-semibold text-bvc-ink"
              >
                Thư viện của tôi
              </button>
            </div>
          </ListState>
        </div>
      </main>
    </>
  );
}
