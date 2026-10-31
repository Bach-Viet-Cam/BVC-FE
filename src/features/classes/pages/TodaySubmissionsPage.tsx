import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FilterCombobox } from "@/features/classes/components/FilterCombobox";
import { FilterSelect } from "@/features/classes/components/FilterSelect";
import { ListState } from "@/features/classes/components/ListState";
import { SearchInput } from "@/features/classes/components/SearchInput";
import { TodaySubmissionRow } from "@/features/classes/components/TodaySubmissionRow";
import { useClassList } from "@/features/classes/hooks/useClassList";
import { useTodaySubmissions } from "@/features/classes/hooks/useTodaySubmissions";
import {
  ALL_FILTER,
  filterTodaySubmissions,
  type SubmissionActivity,
  type TodaySubmissionFilters,
} from "@/features/classes/utils/teacherHomeFormat";
import { TeacherPageHeader } from "@/shared/components/bvc/TeacherPageHeader";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";

const ACTIVITY_OPTIONS: { value: SubmissionActivity; label: string }[] = [
  { value: ALL_FILTER, label: "Tất cả" },
  { value: "SUBMITTED", label: "Có lượt nộp" },
  { value: "NONE", label: "Chưa có lượt nộp" },
];

// "Xem tất cả" of the home card: today's solo / ensemble submitters of every running class.
export function TodaySubmissionsPage() {
  const navigate = useNavigate();
  const classList = useClassList({ status: "ACTIVE" });
  const classes = classList.result?.items ?? [];
  const today = useTodaySubmissions(classes);
  const [filters, setFilters] = useState<TodaySubmissionFilters>({ q: "", cohort: ALL_FILTER, activity: ALL_FILTER });

  const cohorts = [...new Set(classes.map((cls) => cls.cohort))];
  const rows = filterTodaySubmissions(today.rows, filters);
  const isFiltered = filters.q.trim() !== "" || filters.cohort !== ALL_FILTER || filters.activity !== ALL_FILTER;
  const soloTotal = rows.reduce((sum, row) => sum + (row.solo ?? 0), 0);
  const ensembleTotal = rows.reduce((sum, row) => sum + (row.ensemble ?? 0), 0);

  return (
    <TeacherScreen>
      <TeacherPageHeader
        title="Lượt nộp bài mới"
        subtitle="Trang chủ · Hôm nay"
        onBack={() => navigate("/teacher/home")}
      />
      <div className="flex flex-col gap-[14px] px-[18px] pb-[22px] lg:px-[32px] lg:pt-[22px]">
        <div className="flex flex-wrap items-center gap-[10px]">
          <SearchInput
            id="today-search"
            label="Tìm theo tên lớp"
            value={filters.q}
            onChange={(q) => setFilters((current) => ({ ...current, q }))}
          />
          <FilterCombobox
            label="Kỳ"
            value={filters.cohort}
            allValue={ALL_FILTER}
            options={cohorts.map((cohort) => ({ value: cohort, label: cohort }))}
            onChange={(cohort) => setFilters((current) => ({ ...current, cohort }))}
          />
          <FilterSelect
            label="Tình trạng"
            value={filters.activity}
            allValue={ALL_FILTER}
            options={ACTIVITY_OPTIONS}
            onChange={(activity) => setFilters((current) => ({ ...current, activity: activity as SubmissionActivity }))}
          />
        </div>

        <ListState
          isLoading={classList.isLoading || today.isLoading}
          error={classList.error ?? today.error}
          isEmpty={rows.length === 0}
          emptyMessage={isFiltered ? "Không có lớp nào khớp bộ lọc." : "Bạn chưa có lớp nào đang dạy."}
          onRetry={() => {
            classList.reload();
            today.reload();
          }}
        >
          <span className="text-[13px] text-bvc-muted">
            {rows.length} lớp · {soloTotal} sinh viên nộp Độc tấu · {ensembleTotal} sinh viên nộp Hòa tấu
          </span>
          <ul className="m-0 list-none rounded-[20px] border border-bvc-border bg-white p-0">
            {rows.map((row) => (
              <TodaySubmissionRow key={row.classId} row={row} />
            ))}
          </ul>
        </ListState>
      </div>
    </TeacherScreen>
  );
}
