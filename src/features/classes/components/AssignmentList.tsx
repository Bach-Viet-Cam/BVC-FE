import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { AssignmentCard } from "@/features/classes/components/AssignmentCard";
import { FilterSelect } from "@/features/classes/components/FilterSelect";
import { ListState } from "@/features/classes/components/ListState";
import { SearchInput } from "@/features/classes/components/SearchInput";
import { useAssignmentList } from "@/features/classes/hooks/useAssignmentList";
import { useLecturerClasses } from "@/features/classes/hooks/useLecturerClasses";
import { type AssignmentKind, type AssignmentStatus } from "@/features/classes/types/assignmentTypes";
import { ASSIGNMENT_KIND_LABELS, ASSIGNMENT_STATUS_LABELS } from "@/features/classes/utils/assignmentFormat";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

interface AssignmentListProps {
  // Set in the class hub tab: the list is fixed to that class.
  classId?: string;
  canCreate: boolean;
}

const ALL = "ALL";
const ALL_OPTION = { value: ALL, label: "Tất cả" };
const KIND_OPTIONS = [
  ALL_OPTION,
  ...Object.entries(ASSIGNMENT_KIND_LABELS).map(([value, label]) => ({ value, label })),
];
const STATUS_OPTIONS = [
  ALL_OPTION,
  ...Object.entries(ASSIGNMENT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

export function AssignmentList({ classId, canCreate }: AssignmentListProps) {
  const [searchText, setSearchText] = useState("");
  const [selectedClassId, setSelectedClassId] = useState(ALL);
  const [kind, setKind] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const debouncedSearch = useDebouncedValue(searchText.trim());
  const { classes } = useLecturerClasses();
  const effectiveClassId = classId ?? (selectedClassId === ALL ? undefined : selectedClassId);
  const { result, isLoading, error, reload } = useAssignmentList({
    classId: effectiveClassId,
    kind: kind === ALL ? undefined : (kind as AssignmentKind),
    status: status === ALL ? undefined : (status as AssignmentStatus),
    q: debouncedSearch || undefined,
  });

  const classOptions = useMemo(
    () => [ALL_OPTION, ...classes.map((item) => ({ value: item.id, label: item.name }))],
    [classes]
  );
  const isFiltered =
    Boolean(debouncedSearch) || kind !== ALL || status !== ALL || (!classId && selectedClassId !== ALL);
  const emptyMessage = isFiltered
    ? "Không tìm thấy bài tập phù hợp."
    : classId
      ? "Lớp chưa có bài tập nào."
      : "Bạn chưa có bài tập nào.";
  const createPath = classId ? `/teacher/assignments/new?classId=${classId}` : "/teacher/assignments/new";

  return (
    <div className="flex grow flex-col gap-[10px] px-[18px] pb-[18px] pt-[14px]">
      {canCreate && (
        <div className="flex justify-end">
          <Link
            to={createPath}
            className="inline-flex min-h-[44px] items-center justify-center gap-[8px] rounded-[14px] bg-bvc-ink px-[18px] text-[14px] font-semibold text-white"
          >
            <Plus size={16} strokeWidth={2} aria-hidden="true" /> Tạo bài tập
          </Link>
        </div>
      )}
      <SearchInput id="assignment-search" label="Tìm bài tập" value={searchText} onChange={setSearchText} />
      <div className="no-scrollbar flex gap-[7px] overflow-x-auto">
        {!classId && (
          <FilterSelect
            label="Lớp"
            value={selectedClassId}
            allValue={ALL}
            options={classOptions}
            onChange={setSelectedClassId}
          />
        )}
        <FilterSelect label="Loại" value={kind} allValue={ALL} options={KIND_OPTIONS} onChange={setKind} />
        <FilterSelect label="Trạng thái" value={status} allValue={ALL} options={STATUS_OPTIONS} onChange={setStatus} />
      </div>
      <ListState
        isLoading={isLoading}
        error={error}
        isEmpty={(result?.items.length ?? 0) === 0}
        emptyMessage={emptyMessage}
        onRetry={reload}
      >
        <div className="grid gap-[10px] lg:grid-cols-2">
          {result?.items.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      </ListState>
    </div>
  );
}
