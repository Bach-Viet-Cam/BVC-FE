import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { ClassCard } from "@/features/classes/components/ClassCard";
import { ListState } from "@/features/classes/components/ListState";
import { useClassList } from "@/features/classes/hooks/useClassList";
import { type ClassSummary } from "@/features/classes/types/classTypes";
import { formatCurrentWeek } from "@/features/classes/utils/classFormat";
import { DesktopPageHeader, StatCard } from "@/shared/components/bvc";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/utils/cn";

const ALL_COHORTS = "ALL";
const ROW_GRID = "grid grid-cols-[2.2fr_1.2fr_1fr_0.8fr_1fr_1.1fr_0.8fr] items-center gap-[14px] px-[20px]";
const EMPTY_MESSAGE = "Bạn chưa có lớp học nào.";

interface CohortChipsProps {
  cohorts: string[];
  activeCohort: string;
  onSelect: (cohort: string) => void;
  className?: string;
}

function CohortChips({ cohorts, activeCohort, onSelect, className }: CohortChipsProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      {[ALL_COHORTS, ...cohorts].map((cohort) => (
        <button
          key={cohort}
          type="button"
          onClick={() => onSelect(cohort)}
          className={
            activeCohort === cohort
              ? "shrink-0 cursor-pointer rounded-[11px] bg-bvc-ink px-3 py-1.5 text-[13px] font-bold text-white"
              : "shrink-0 cursor-pointer rounded-[11px] border border-bvc-border-strong px-3 py-1.5 text-[13px] text-bvc-muted"
          }
        >
          {cohort === ALL_COHORTS ? "Tất cả" : cohort}
        </button>
      ))}
    </div>
  );
}

interface ClassListViewProps {
  classes: ClassSummary[];
  cohorts: string[];
  activeCohort: string;
  onSelectCohort: (cohort: string) => void;
  totalClasses: number;
  activeClasses: number;
  totalStudents: number;
  listState: { isLoading: boolean; error: string | null; onRetry: () => void };
}

// Web layout (primary): page header with filters + stats row + table.
function DesktopClassList({
  classes,
  cohorts,
  activeCohort,
  onSelectCohort,
  totalClasses,
  activeClasses,
  totalStudents,
  listState,
}: ClassListViewProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <DesktopPageHeader
        breadcrumb="Lớp học"
        title="Danh sách lớp học"
        actions={
          <>
            <CohortChips cohorts={cohorts} activeCohort={activeCohort} onSelect={onSelectCohort} />
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
          isLoading={listState.isLoading}
          error={listState.error}
          isEmpty={classes.length === 0}
          emptyMessage={EMPTY_MESSAGE}
          onRetry={listState.onRetry}
          skeletonCount={4}
        >
          <div className="flex flex-1 flex-col overflow-x-auto rounded-[20px] border border-bvc-border bg-white">
            <div className="flex min-w-[760px] flex-col">
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
                <div key={cls.id} className={`${ROW_GRID} h-[54px] border-b border-bvc-line text-[14px] transition-colors last:border-0 hover:bg-bvc-surface`}>
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
          </div>
        </ListState>
      </div>
    </div>
  );
}

// PWA layout: compact title, horizontally scrolling chips and a card per class.
function MobileClassList({
  classes,
  cohorts,
  activeCohort,
  onSelectCohort,
  activeClasses,
  listState,
}: ClassListViewProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[14px] px-[18px] pb-[24px] pt-[18px]">
      <div className="flex items-end justify-between gap-[12px]">
        <div className="flex min-w-0 flex-col gap-[3px]">
          <h1 className="font-bvc-display text-[24px] font-extrabold tracking-[-0.025em] text-bvc-ink">
            Lớp học của tôi
          </h1>
          <span className="text-[13px] text-bvc-muted">{activeClasses} lớp đang hoạt động</span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/teacher/classes/new")}
          className="flex min-h-[44px] shrink-0 cursor-pointer items-center gap-[6px] rounded-[14px] bg-bvc-ink px-[14px] text-[14px] font-bold text-white"
        >
          <Plus size={16} strokeWidth={2.4} aria-hidden />
          Tạo mới
        </button>
      </div>

      <CohortChips
        cohorts={cohorts}
        activeCohort={activeCohort}
        onSelect={onSelectCohort}
        className="-mx-[18px] overflow-x-auto px-[18px] [scrollbar-width:none]"
      />

      <ListState
        isLoading={listState.isLoading}
        error={listState.error}
        isEmpty={classes.length === 0}
        emptyMessage={EMPTY_MESSAGE}
        onRetry={listState.onRetry}
        skeletonCount={3}
      >
        <div className="flex flex-col gap-[10px]">
          {classes.map((cls) => (
            <ClassCard key={cls.id} classSummary={cls} />
          ))}
        </div>
      </ListState>
    </div>
  );
}

export function ClassListPage() {
  const isMobile = useIsMobile();
  const [activeCohort, setActiveCohort] = useState<string>(ALL_COHORTS);
  const { result, isLoading, error, reload } = useClassList({ status: "ALL" });

  const allClasses = result?.items ?? [];
  const viewProps: ClassListViewProps = {
    classes: activeCohort === ALL_COHORTS ? allClasses : allClasses.filter((cls) => cls.cohort === activeCohort),
    cohorts: result?.cohorts ?? [],
    activeCohort,
    onSelectCohort: setActiveCohort,
    totalClasses: result?.pagination.total ?? 0,
    activeClasses: result?.activeCount ?? 0,
    totalStudents: allClasses.reduce((sum, cls) => sum + cls.memberCount, 0),
    listState: { isLoading, error, onRetry: reload },
  };

  return isMobile ? <MobileClassList {...viewProps} /> : <DesktopClassList {...viewProps} />;
}
