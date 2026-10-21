import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListState } from "@/features/classes/components/ListState";
import { useClassList } from "@/features/classes/hooks/useClassList";
import { formatCurrentWeek } from "@/features/classes/utils/classFormat";
import { DesktopPageHeader, StatCard } from "@/shared/components/bvc";

const ALL_COHORTS = "ALL";
const ROW_GRID = "grid grid-cols-[2.2fr_1.2fr_1fr_0.8fr_1fr_1.1fr_0.8fr] items-center gap-[14px] px-[20px]";

export function ClassListPage() {
  const navigate = useNavigate();
  const [activeCohort, setActiveCohort] = useState<string>(ALL_COHORTS);
  const { result, isLoading, error, reload } = useClassList({ status: "ALL" });

  const allClasses = result?.items ?? [];
  const classes = activeCohort === ALL_COHORTS ? allClasses : allClasses.filter((cls) => cls.cohort === activeCohort);
  const totalClasses = result?.pagination.total ?? 0;
  const activeClasses = result?.activeCount ?? 0;
  const totalStudents = allClasses.reduce((sum, cls) => sum + cls.memberCount, 0);

  return (
    <>
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DesktopPageHeader
          breadcrumb="Lớp học"
          title="Danh sách lớp học"
          actions={
            <>
              <div className="flex gap-2">
                {[ALL_COHORTS, ...(result?.cohorts ?? [])].map((cohort) => (
                  <button
                    key={cohort}
                    type="button"
                    onClick={() => setActiveCohort(cohort)}
                    className={
                      activeCohort === cohort
                        ? "cursor-pointer rounded-[11px] bg-bvc-ink px-3 py-1.5 text-[13px] font-bold text-white"
                        : "cursor-pointer rounded-[11px] border border-bvc-border-strong px-3 py-1.5 text-[13px] text-bvc-muted"
                    }
                  >
                    {cohort === ALL_COHORTS ? "Tất cả" : cohort}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => navigate("/teacher/classes/new")}
                className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] bg-bvc-ink px-[18px] text-[14px] font-bold text-white"
              >
                Tạo lớp mới
              </button>
            </>
          }
        />

        <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto p-[22px_32px_26px]">
          <div className="grid grid-cols-4 gap-[12px]">
            <StatCard label="Tổng lớp" value={String(totalClasses)} />
            <StatCard label="Đang hoạt động" value={String(activeClasses)} variant="ok" />
            <StatCard label="Kết thúc" value={String(totalClasses - activeClasses)} variant="surface" />
            <StatCard label="Sinh viên" value={String(totalStudents)} />
          </div>

          <ListState
            isLoading={isLoading}
            error={error}
            isEmpty={classes.length === 0}
            emptyMessage="Bạn chưa có lớp học nào."
            onRetry={reload}
            skeletonCount={4}
          >
            <div className="flex flex-1 flex-col overflow-hidden rounded-[20px] border border-bvc-border bg-white">
              <div
                className={`${ROW_GRID} h-[46px] shrink-0 border-b border-bvc-border bg-bvc-surface text-[12px] font-bold uppercase tracking-[0.08em] text-bvc-muted`}
              >
                <span>Tên lớp</span>
                <span>Nhạc cụ</span>
                <span>Khóa</span>
                <span>Sĩ số</span>
                <span>Tuần hiện tại</span>
                <span>Trạng thái</span>
                <span>Hành động</span>
              </div>

              {classes.map((cls) => (
                <div key={cls.id} className={`${ROW_GRID} h-[54px] border-b border-bvc-line text-[14px] last:border-0`}>
                  <span className="truncate font-semibold text-bvc-ink">{cls.name}</span>
                  <span className="text-bvc-ink">{cls.instrument.name}</span>
                  <span className="text-bvc-muted">{cls.cohort}</span>
                  <span className="font-mono text-bvc-ink">{cls.memberCount}</span>
                  <span className="font-mono text-bvc-ink">{formatCurrentWeek(cls.startDate, cls.status)}</span>
                  <span className="flex items-center gap-[6px] text-[13px] text-bvc-ink">
                    {cls.status === "ACTIVE" ? (
                      <>
                        <span className="size-[7px] shrink-0 rounded-full bg-bvc-ok" />
                        Đang học
                      </>
                    ) : (
                      <>
                        <span className="size-[7px] shrink-0 rounded-full bg-bvc-bar-strong" />
                        Kết thúc
                      </>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/teacher/classes/${cls.id}`)}
                    className="cursor-pointer text-left text-[13px] font-semibold text-bvc-accent-text"
                  >
                    Xem lớp
                  </button>
                </div>
              ))}
            </div>
          </ListState>
        </div>
      </main>
    </>
  );
}
