import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { FilterSelect } from "@/features/classes/components/FilterSelect";
import { ListState } from "@/features/classes/components/ListState";
import { MyAssignmentCard } from "@/features/classes/components/MyAssignmentCard";
import { NextAssignmentCard } from "@/features/classes/components/NextAssignmentCard";
import { useMyAssignments } from "@/features/classes/hooks/useMyAssignments";
import { type AssignmentListItem, type StudentAssignmentStatus } from "@/features/classes/types/assignmentTypes";
import { ASSIGNMENT_KIND_LABELS, assignmentKindOf } from "@/features/classes/utils/assignmentFormat";
import { groupAssignments, type AssignmentSort } from "@/features/classes/utils/myAssignmentGroups";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { PageHero } from "@/shared/components/bvc/PageHero";
import { MultiFilterPill } from "@/shared/components/bvc/MultiFilterPill";
import { PillTabs } from "@/shared/components/bvc/PillTabs";
import { RoleShell } from "@/shared/components/bvc/RoleShell";
import { SearchField } from "@/shared/components/bvc/SearchField";

type StatusFilter = "all" | StudentAssignmentStatus;

const ALL = "all";
const KIND_OPTIONS = Object.entries(ASSIGNMENT_KIND_LABELS).map(([value, label]) => ({ value, label }));

function kindsFromUrl(value: string | null) {
  return (value ?? "").split(",").filter((kind) => kind in ASSIGNMENT_KIND_LABELS);
}
const SORT_OPTIONS = [
  { value: "deadline", label: "Hạn nộp" },
  { value: "title", label: "Tên A-Z" },
];

interface AssignmentSectionProps {
  title: string;
  items: AssignmentListItem[];
  now: Date;
}

function AssignmentSection({ title, items, now }: AssignmentSectionProps) {
  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-bvc-display text-[17px] font-semibold text-bvc-ink">
        {title} <span className="font-normal text-bvc-muted tabular-nums">· {items.length}</span>
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 md:gap-4">
        {items.map((assignment) => (
          <MyAssignmentCard key={assignment.id} assignment={assignment} now={now} />
        ))}
      </div>
    </section>
  );
}

export function MyAssignmentsPage() {
  const { items, error, isLoading, reload, searchText, setSearchText } = useMyAssignments();
  const [searchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL);
  const [kindFilter, setKindFilter] = useState<string[]>(() => kindsFromUrl(searchParams.get("kind")));
  const [classFilter, setClassFilter] = useState(ALL);
  const [sort, setSort] = useState<AssignmentSort>("deadline");
  const [now] = useState(() => new Date());

  const classOptions = useMemo(
    () => [
      { value: ALL, label: "Tất cả" },
      ...Array.from(new Map(items.map((item) => [item.classId, item.className]))).map(([value, label]) => ({
        value,
        label,
      })),
    ],
    [items]
  );

  // Số trên tab phải khớp với lớp và loại bài đang chọn
  const scoped = useMemo(
    () =>
      items.filter(
        (item) =>
          (classFilter === ALL || item.classId === classFilter) &&
          (kindFilter.length === 0 || kindFilter.includes(assignmentKindOf(item)))
      ),
    [items, classFilter, kindFilter]
  );
  const countOf = (status: StudentAssignmentStatus) => scoped.filter((item) => item.status === status).length;
  const statusTabs: { value: StatusFilter; label: string; count: number }[] = [
    { value: ALL, label: "Tất cả", count: scoped.length },
    { value: "NOT_SUBMITTED", label: "Chưa nộp", count: countOf("NOT_SUBMITTED") },
    { value: "SUBMITTED", label: "Đã nộp", count: countOf("SUBMITTED") },
    { value: "PASSED", label: "Đạt", count: countOf("PASSED") },
    { value: "OVERDUE", label: "Quá hạn", count: countOf("OVERDUE") },
  ];

  const visible = scoped.filter((item) => statusFilter === ALL || item.status === statusFilter);
  const groups = useMemo(() => groupAssignments(visible, now, sort), [visible, now, sort]);

  const hasFilters = statusFilter !== ALL || kindFilter.length > 0 || classFilter !== ALL;
  const isBrowsingAll = !hasFilters && !searchText.trim() && sort === "deadline";
  const [nextAssignment, ...otherTodo] = groups.todo;
  const todoInList = isBrowsingAll ? otherTodo : groups.todo;

  const todoCount = useMemo(() => groupAssignments(items, now, "deadline").todo.length, [items, now]);
  const description =
    isLoading || items.length === 0
      ? undefined
      : todoCount > 0
        ? `Bạn còn ${todoCount} bài cần làm.`
        : "Bạn không còn bài nào cần làm lúc này.";

  const clearFilters = () => {
    setStatusFilter(ALL);
    setKindFilter([]);
    setClassFilter(ALL);
  };

  return (
    <RoleShell title="Bài tập của tôi" hideHeader contentClassName="max-w-[1200px] gap-6 md:gap-7">
      <PageHero title="Bài tập của tôi" description={description}>
        <SearchField
          value={searchText}
          onChange={setSearchText}
          label="Tìm theo tên bài tập"
          placeholder="Tìm theo tên bài tập..."
          size="lg"
          className="max-w-[640px] border-white"
        />
      </PageHero>

      <ListState
        isLoading={isLoading}
        error={error}
        isEmpty={items.length === 0}
        emptyMessage={searchText.trim() ? "Không tìm thấy bài tập phù hợp." : "Bạn chưa có bài tập nào."}
        onRetry={reload}
      >
        <div className="flex flex-col gap-6">
          {isBrowsingAll && nextAssignment && <NextAssignmentCard assignment={nextAssignment} now={now} />}

          <div className="flex justify-between gap-3">
            <PillTabs label="Trạng thái bài tập" tabs={statusTabs} value={statusFilter} onChange={setStatusFilter} />
            <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
              {classOptions.length > 2 && (
                <FilterSelect
                  label="Lớp"
                  value={classFilter}
                  allValue={ALL}
                  options={classOptions}
                  onChange={setClassFilter}
                />
              )}
              <MultiFilterPill label="Loại bài" values={kindFilter} options={KIND_OPTIONS} onChange={setKindFilter} />
              <FilterSelect
                label="Sắp xếp"
                value={sort}
                allValue="deadline"
                options={SORT_OPTIONS}
                // Giá trị luôn thuộc SORT_OPTIONS
                onChange={(value) => setSort(value as AssignmentSort)}
              />
            </div>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon={<Search size={28} strokeWidth={1.6} aria-hidden />}
              title="Không tìm thấy bài tập phù hợp"
              description="Thử bỏ bớt bộ lọc đang chọn."
              actions={
                <ActionButton variant="secondary" onClick={clearFilters}>
                  Xóa bộ lọc
                </ActionButton>
              }
            />
          ) : (
            <div className="flex flex-col gap-7 pb-6">
              <AssignmentSection title="Cần làm" items={todoInList} now={now} />
              <AssignmentSection title="Đã nộp" items={groups.submitted} now={now} />
              <AssignmentSection title="Quá hạn" items={groups.overdue} now={now} />
            </div>
          )}
        </div>
      </ListState>
    </RoleShell>
  );
}
