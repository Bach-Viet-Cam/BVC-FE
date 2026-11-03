import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { ClassCard } from "@/features/classes/components/ClassCard";
import { ClassCreateDialog } from "@/features/classes/components/ClassCreateDialog";
import { ListState } from "@/features/classes/components/ListState";
import { useClassList } from "@/features/classes/hooks/useClassList";
import { type ClassSummary } from "@/features/classes/types/classTypes";
import { formatCurrentWeek } from "@/features/classes/utils/classFormat";
import { DesktopPageHeader, StatCard } from "@/shared/components/bvc";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { PageHeader } from "@/shared/components/bvc/PageHeader";
import { StatusDot } from "@/shared/components/bvc/StatusDot";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
} from "@/shared/components/ui/table";
import { useCreateDialog } from "@/shared/hooks/useCreateDialog";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/utils/cn";

const ALL_COHORTS = "ALL";
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
              ? "shrink-0 cursor-pointer rounded-full bg-bvc-ink px-3 py-1.5 text-[13px] font-semibold text-white"
              : "shrink-0 cursor-pointer rounded-full border border-bvc-border-strong px-3 py-1.5 text-[13px] text-bvc-muted"
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
  onCreate: () => void;
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
  onCreate,
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
            <ActionButton onClick={onCreate}>Tạo lớp mới</ActionButton>
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
          <Table className="min-w-[760px]">
            <TableHead>
              <TableHeaderRow>
                {["Tên lớp", "Nhạc cụ", "Khóa", "Sĩ số", "Tuần hiện tại", "Trạng thái", "Hành động"].map((label) => (
                  <TableHeaderCell key={label}>{label}</TableHeaderCell>
                ))}
              </TableHeaderRow>
            </TableHead>
            <TableBody>
              {classes.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="max-w-[240px] truncate font-medium">{cls.name}</TableCell>
                  <TableCell>{cls.instrument.name}</TableCell>
                  <TableCell className="text-bvc-muted">{cls.cohort}</TableCell>
                  <TableCell className="font-bvc-mono">{cls.memberCount}</TableCell>
                  <TableCell className="font-bvc-mono">{formatCurrentWeek(cls.startDate, cls.status)}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-[13px]">
                      <StatusDot status={cls.status === "ACTIVE" ? "ok" : "muted"} size={7} />
                      {cls.status === "ACTIVE" ? "Đang học" : "Kết thúc"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => navigate(`/teacher/classes/${cls.id}`)}
                      className="cursor-pointer text-[13px] font-medium text-bvc-accent-text"
                    >
                      Xem lớp
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
  onCreate,
}: ClassListViewProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[14px] px-[18px] pb-[24px] pt-[18px]">
      <PageHeader
        title="Lớp học của tôi"
        description={`${activeClasses} lớp đang hoạt động`}
        actions={
          <ActionButton onClick={onCreate}>
            <Plus size={16} strokeWidth={2.2} aria-hidden />
            Tạo mới
          </ActionButton>
        }
      />

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
  const createDialog = useCreateDialog("class");

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
    onCreate: () => createDialog.open(),
  };

  return (
    <>
      {isMobile ? <MobileClassList {...viewProps} /> : <DesktopClassList {...viewProps} />}
      <ClassCreateDialog open={createDialog.isOpen} onClose={createDialog.close} />
    </>
  );
}
