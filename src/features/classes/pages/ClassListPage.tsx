import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Plus, Upload } from "lucide-react";
import { ClassCard } from "@/features/classes/components/ClassCard";
import { ClassCreateDialog } from "@/features/classes/components/ClassCreateDialog";
import { ClassFileImportDialog } from "@/features/classes/components/ClassFileImportDialog";
import { FilterSelect } from "@/features/classes/components/FilterSelect";
import { ListState } from "@/features/classes/components/ListState";
import { SearchInput } from "@/features/classes/components/SearchInput";
import { useClassList } from "@/features/classes/hooks/useClassList";
import { type ClassStatus, type ClassSummary } from "@/features/classes/types/classTypes";
import { CLASS_STATUS_LABELS, formatCurrentWeek } from "@/features/classes/utils/classFormat";
import { DesktopPageHeader } from "@/shared/components/bvc";
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

const ALL = "ALL";
const EMPTY_MESSAGE = "Bạn chưa có lớp học nào.";
const NO_MATCH_MESSAGE = "Không tìm thấy lớp phù hợp.";
const STATUS_OPTIONS = [
  { value: ALL, label: "Tất cả" },
  ...(Object.entries(CLASS_STATUS_LABELS) as Array<[ClassStatus, string]>).map(([value, label]) => ({ value, label })),
];

interface ClassFilters {
  searchText: string;
  cohort: string;
  status: string;
}

interface ClassToolbarProps {
  filters: ClassFilters;
  cohorts: string[];
  onChange: (filters: ClassFilters) => void;
}

function ClassToolbar({ filters, cohorts, onChange }: ClassToolbarProps) {
  const cohortOptions = [
    { value: ALL, label: "Tất cả" },
    ...cohorts.map((cohort) => ({ value: cohort, label: cohort })),
  ];
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-[8px]">
      <div className="flex min-w-0 basis-full md:basis-auto md:grow lg:max-w-[420px]">
        <SearchInput
          id="class-search"
          label="Tìm tên lớp"
          value={filters.searchText}
          onChange={(searchText) => onChange({ ...filters, searchText })}
        />
      </div>
      <div className="no-scrollbar flex min-w-0 gap-[7px] overflow-x-auto">
        <FilterSelect
          label="Khóa"
          value={filters.cohort}
          allValue={ALL}
          options={cohortOptions}
          onChange={(cohort) => onChange({ ...filters, cohort })}
        />
        <FilterSelect
          label="Trạng thái"
          value={filters.status}
          allValue={ALL}
          options={STATUS_OPTIONS}
          onChange={(status) => onChange({ ...filters, status })}
        />
      </div>
    </div>
  );
}

interface ClassListViewProps {
  classes: ClassSummary[];
  summary: string;
  toolbar: React.ReactNode;
  emptyMessage: string;
  listState: { isLoading: boolean; error: string | null; onRetry: () => void };
  onCreate: () => void;
  onImport: () => void;
}

function DesktopClassList({
  classes,
  summary,
  toolbar,
  emptyMessage,
  listState,
  onCreate,
  onImport,
}: ClassListViewProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <DesktopPageHeader
        breadcrumb="Lớp học"
        title="Danh sách lớp học"
        actions={
          <div className="flex items-center gap-[10px]">
            <ActionButton variant="secondary" onClick={onImport}>
              <Upload size={16} strokeWidth={2.2} aria-hidden />
              Nhập file SV
            </ActionButton>
            <ActionButton onClick={onCreate}>
              <Plus size={16} strokeWidth={2.2} aria-hidden />
              Tạo lớp mới
            </ActionButton>
          </div>
        }
      />

      <div className="flex flex-1 flex-col gap-[14px] overflow-y-auto p-[18px_32px_26px]">
        {toolbar}
        <p className="text-[13px] text-bvc-muted">{summary}</p>
        <ListState
          isLoading={listState.isLoading}
          error={listState.error}
          isEmpty={classes.length === 0}
          emptyMessage={emptyMessage}
          onRetry={listState.onRetry}
          skeletonCount={4}
        >
          <Table className="min-w-[760px]">
            <TableHead>
              <TableHeaderRow>
                {["Tên lớp", "Nhạc cụ", "Khóa", "Sĩ số", "Tuần hiện tại", "Trạng thái"].map((label) => (
                  <TableHeaderCell key={label}>{label}</TableHeaderCell>
                ))}
                <TableHeaderCell className="w-[1%]">
                  <span className="sr-only">Mở lớp</span>
                </TableHeaderCell>
              </TableHeaderRow>
            </TableHead>
            <TableBody>
              {classes.map((cls) => {
                const detailPath = `/teacher/classes/${cls.id}`;
                return (
                  <TableRow
                    key={cls.id}
                    onClick={() => navigate(detailPath)}
                    className="cursor-pointer hover:bg-bvc-surface"
                  >
                    <TableCell className="max-w-[280px] truncate font-medium">
                      <Link to={detailPath} onClick={(event) => event.stopPropagation()} className="text-bvc-ink">
                        {cls.name}
                      </Link>
                    </TableCell>
                    <TableCell>{cls.instrument.name}</TableCell>
                    <TableCell className="text-bvc-muted">{cls.cohort}</TableCell>
                    <TableCell className="font-bvc-mono">{cls.memberCount}</TableCell>
                    <TableCell className="font-bvc-mono">{formatCurrentWeek(cls.startDate, cls.status)}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-[13px]">
                        <StatusDot status={cls.status === "ACTIVE" ? "ok" : "muted"} size={7} />
                        {CLASS_STATUS_LABELS[cls.status]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ChevronRight size={16} className="text-bvc-muted" aria-hidden />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ListState>
      </div>
    </div>
  );
}

function MobileClassList({
  classes,
  summary,
  toolbar,
  emptyMessage,
  listState,
  onCreate,
  onImport,
}: ClassListViewProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[14px] px-[18px] pb-[24px] pt-[18px]">
      <PageHeader
        title="Lớp học của tôi"
        description={summary}
        actions={
          <div className="flex items-center gap-[8px]">
            <ActionButton variant="secondary" onClick={onImport}>
              <Upload size={16} strokeWidth={2.2} aria-hidden />
              Nhập file SV
            </ActionButton>
            <ActionButton onClick={onCreate}>
              <Plus size={16} strokeWidth={2.2} aria-hidden />
              Tạo mới
            </ActionButton>
          </div>
        }
      />
      {toolbar}
      <ListState
        isLoading={listState.isLoading}
        error={listState.error}
        isEmpty={classes.length === 0}
        emptyMessage={emptyMessage}
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
  const [filters, setFilters] = useState<ClassFilters>({ searchText: "", cohort: ALL, status: ALL });
  const { result, isLoading, error, reload } = useClassList({ status: "ALL" });
  const createDialog = useCreateDialog("class");
  const importDialog = useCreateDialog("class-file-import");

  const allClasses = useMemo(() => result?.items ?? [], [result]);
  const classes = useMemo(() => {
    const keyword = filters.searchText.trim().toLocaleLowerCase("vi");
    return allClasses.filter(
      (cls) =>
        (filters.cohort === ALL || cls.cohort === filters.cohort) &&
        (filters.status === ALL || cls.status === filters.status) &&
        (!keyword || cls.name.toLocaleLowerCase("vi").includes(keyword))
    );
  }, [allClasses, filters]);
  const isFiltered = Boolean(filters.searchText.trim()) || filters.cohort !== ALL || filters.status !== ALL;
  const totalStudents = allClasses.reduce((sum, cls) => sum + cls.memberCount, 0);
  const summary = `${result?.pagination.total ?? 0} lớp · ${result?.activeCount ?? 0} đang học · ${totalStudents} sinh viên`;

  const viewProps: ClassListViewProps = {
    classes,
    summary,
    toolbar: <ClassToolbar filters={filters} cohorts={result?.cohorts ?? []} onChange={setFilters} />,
    emptyMessage: isFiltered ? NO_MATCH_MESSAGE : EMPTY_MESSAGE,
    listState: { isLoading, error, onRetry: reload },
    onCreate: () => createDialog.open(),
    onImport: () => importDialog.open(),
  };

  return (
    <>
      {isMobile ? <MobileClassList {...viewProps} /> : <DesktopClassList {...viewProps} />}
      <ClassCreateDialog open={createDialog.isOpen} onClose={createDialog.close} />
      <ClassFileImportDialog open={importDialog.isOpen} onClose={importDialog.close} onImported={reload} />
    </>
  );
}
