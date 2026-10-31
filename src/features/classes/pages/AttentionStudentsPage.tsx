import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AttentionStudentRow } from "@/features/classes/components/AttentionStudentRow";
import { FilterCombobox } from "@/features/classes/components/FilterCombobox";
import { FilterSelect } from "@/features/classes/components/FilterSelect";
import { ListState } from "@/features/classes/components/ListState";
import { SearchInput } from "@/features/classes/components/SearchInput";
import { useActiveClassProgress } from "@/features/classes/hooks/useActiveClassProgress";
import {
  ALL_FILTER,
  ATTENTION_STATUS_LABELS,
  filterAttentionStudents,
  type AttentionFilters,
  type AttentionStatus,
} from "@/features/classes/utils/teacherHomeFormat";
import { TeacherPageHeader } from "@/shared/components/bvc/TeacherPageHeader";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";

const PAGE_PATH = "/teacher/attention-students";
const STATUS_OPTIONS = [
  { value: ALL_FILTER, label: "Tất cả" },
  ...(Object.keys(ATTENTION_STATUS_LABELS) as AttentionStatus[]).map((status) => ({
    value: status,
    label: ATTENTION_STATUS_LABELS[status],
  })),
];

// "Xem tất cả" of the home card: every student at risk / behind in the running classes.
export function AttentionStudentsPage() {
  const navigate = useNavigate();
  const { classes, attentionStudents, isLoading, error, reload } = useActiveClassProgress();
  const [filters, setFilters] = useState<AttentionFilters>({ q: "", classId: ALL_FILTER, status: ALL_FILTER });
  const students = filterAttentionStudents(attentionStudents, filters);
  const isFiltered = filters.q.trim() !== "" || filters.classId !== ALL_FILTER || filters.status !== ALL_FILTER;

  return (
    <TeacherScreen>
      <TeacherPageHeader title="Sinh viên cần chú ý" subtitle="Trang chủ" onBack={() => navigate("/teacher/home")} />
      <div className="flex flex-col gap-[14px] px-[18px] pb-[22px] lg:px-[32px] lg:pt-[22px]">
        <div className="flex flex-wrap items-center gap-[10px]">
          <SearchInput
            id="attention-search"
            label="Tìm theo tên hoặc mã sinh viên"
            value={filters.q}
            onChange={(q) => setFilters((current) => ({ ...current, q }))}
          />
          <FilterCombobox
            label="Lớp"
            value={filters.classId}
            allValue={ALL_FILTER}
            options={classes.map((cls) => ({ value: cls.id, label: cls.name }))}
            onChange={(classId) => setFilters((current) => ({ ...current, classId }))}
          />
          <FilterSelect
            label="Trạng thái"
            value={filters.status}
            allValue={ALL_FILTER}
            options={STATUS_OPTIONS}
            onChange={(status) =>
              setFilters((current) => ({ ...current, status: status as AttentionFilters["status"] }))
            }
          />
        </div>

        <ListState
          isLoading={isLoading}
          error={error}
          isEmpty={students.length === 0}
          emptyMessage={isFiltered ? "Không có sinh viên nào khớp bộ lọc." : "Không có sinh viên nào cần chú ý."}
          onRetry={reload}
        >
          <span className="text-[13px] text-bvc-muted">{students.length} sinh viên</span>
          <ul className="m-0 list-none rounded-[20px] border border-bvc-border bg-white p-0">
            {students.map((student) => (
              <AttentionStudentRow
                key={`${student.classId}:${student.userId}`}
                student={student}
                onOpen={(item) =>
                  navigate(`/teacher/classes/${item.classId}/students/${item.userId}`, { state: { from: PAGE_PATH } })
                }
              />
            ))}
          </ul>
        </ListState>
      </div>
    </TeacherScreen>
  );
}
