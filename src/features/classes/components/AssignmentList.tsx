import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { AssignmentCard } from "@/features/classes/components/AssignmentCard";
import { FilterSelect } from "@/features/classes/components/FilterSelect";
import { ListState } from "@/features/classes/components/ListState";
import { SearchInput } from "@/features/classes/components/SearchInput";
import { useAssignmentList } from "@/features/classes/hooks/useAssignmentList";
import { useLecturerClasses } from "@/features/classes/hooks/useLecturerClasses";
import {
  type AssignmentKind,
  type AssignmentListItem,
  type AssignmentStatus,
} from "@/features/classes/types/teacherAssignmentTypes";
import { ASSIGNMENT_KIND_LABELS, ASSIGNMENT_STATUS_LABELS } from "@/features/classes/utils/teacherAssignmentFormat";
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
const FEATURED_KINDS: AssignmentKind[] = ["ENSEMBLE", "SOLO"];
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
  const items = result?.items ?? [];
  const createPath = classId ? `/teacher/assignments/new?classId=${classId}` : "/teacher/assignments/new";

  return (
    <div className="flex grow flex-col gap-[10px] px-[18px] pb-[18px] pt-[14px] lg:px-[32px] lg:pb-[24px] lg:pt-[20px]">
      <div className="flex shrink-0 items-center gap-[8px]">
        <div className="flex min-w-0 grow lg:max-w-[720px]">
          <SearchInput id="assignment-search" label="Tìm bài tập" value={searchText} onChange={setSearchText} />
        </div>
        <FilterSelect label="Trạng thái" value={status} allValue={ALL} options={STATUS_OPTIONS} onChange={setStatus} />
        {canCreate && (
          <Link
            to={createPath}
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-[8px] rounded-[14px] bg-bvc-ink px-[14px] text-[14px] font-semibold text-white lg:ml-auto lg:px-[18px]"
          >
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
            <span className="max-sm:sr-only">Tạo bài tập</span>
          </Link>
        )}
      </div>
      {!classId && (
        <div className="no-scrollbar flex gap-[7px] overflow-x-auto">
          <FilterSelect
            label="Lớp"
            value={selectedClassId}
            allValue={ALL}
            options={classOptions}
            onChange={setSelectedClassId}
          />
          <FilterSelect label="Loại" value={kind} allValue={ALL} options={KIND_OPTIONS} onChange={setKind} />
        </div>
      )}
      {classId ? (
        <ListState isLoading={isLoading} error={error} isEmpty={false} emptyMessage="" onRetry={reload}>
          <ClassAssignmentSections classId={classId} items={items} canCreate={canCreate} isFiltered={isFiltered} />
        </ListState>
      ) : (
        <ListState
          isLoading={isLoading}
          error={error}
          isEmpty={items.length === 0}
          emptyMessage={isFiltered ? "Không tìm thấy bài tập phù hợp." : "Bạn chưa có bài tập nào."}
          onRetry={reload}
        >
          <AssignmentGrid items={items} />
        </ListState>
      )}
    </div>
  );
}

interface ClassAssignmentSectionsProps {
  classId: string;
  items: AssignmentListItem[];
  canCreate: boolean;
  isFiltered: boolean;
}

// Class tab: one fixed slot each for the ensemble and the solo assignment (BE allows one of each per class),
// then the bonus and other assignments.
function ClassAssignmentSections({ classId, items, canCreate, isFiltered }: ClassAssignmentSectionsProps) {
  const otherItems = items.filter((item) => !FEATURED_KINDS.includes(item.kind));
  return (
    <>
      <div className="grid gap-[10px] sm:grid-cols-2">
        {FEATURED_KINDS.map((featuredKind) => {
          const assignment = items.find((item) => item.kind === featuredKind);
          if (assignment) return <AssignmentCard key={featuredKind} assignment={assignment} />;
          const label = ASSIGNMENT_KIND_LABELS[featuredKind];
          const slotClassName =
            "flex min-h-[104px] flex-col items-center justify-center gap-[6px] rounded-[18px] border border-dashed border-bvc-border-strong p-[15px] text-center text-[13.5px] text-bvc-muted";
          // While searching, an empty slot only means "no match": creating from it could hit the one-per-class rule.
          if (!canCreate || isFiltered) {
            return (
              <div key={featuredKind} className={slotClassName}>
                {isFiltered ? `Không có bài ${label} phù hợp.` : `Lớp chưa có bài ${label}.`}
              </div>
            );
          }
          return (
            <Link
              key={featuredKind}
              to={`/teacher/assignments/new?classId=${classId}&kind=${featuredKind}`}
              className={`${slotClassName} hover:border-bvc-accent`}
            >
              <span>Lớp chưa có bài {label}.</span>
              <span className="inline-flex items-center gap-[6px] font-semibold text-bvc-ink">
                <Plus size={16} strokeWidth={2} aria-hidden="true" /> Tạo bài {label}
              </span>
            </Link>
          );
        })}
      </div>
      <h3 className="pt-[6px] text-[15px] font-bold text-bvc-ink">Bài tập khác</h3>
      {otherItems.length === 0 ? (
        <p className="rounded-[18px] bg-bvc-soft p-[15px] text-[13.5px] text-bvc-muted">
          {isFiltered ? "Không tìm thấy bài tập phù hợp." : "Lớp chưa có bài bonus hoặc bài luyện ngón."}
        </p>
      ) : (
        <AssignmentGrid items={otherItems} />
      )}
    </>
  );
}

function AssignmentGrid({ items }: { items: AssignmentListItem[] }) {
  return (
    <div className="grid gap-[10px] lg:grid-cols-2 2xl:grid-cols-3">
      {items.map((assignment) => (
        <AssignmentCard key={assignment.id} assignment={assignment} />
      ))}
    </div>
  );
}
