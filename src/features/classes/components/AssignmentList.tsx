import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { AssignmentCard } from "@/features/classes/components/AssignmentCard";
import { AssignmentCreateDialog } from "@/features/classes/components/AssignmentCreateDialog";
import { FilterSelect } from "@/features/classes/components/FilterSelect";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { ListState } from "@/features/classes/components/ListState";
import { SearchInput } from "@/features/classes/components/SearchInput";
import { useAssignmentList } from "@/features/classes/hooks/useAssignmentList";
import { useLecturerClasses } from "@/features/classes/hooks/useLecturerClasses";
import {
  type AssignmentKind,
  type AssignmentListItem,
  type AssignmentStatus,
} from "@/features/classes/types/teacherAssignmentTypes";
import {
  ASSIGNMENT_CLASS_PARAM,
  ASSIGNMENT_KIND_LABELS,
  ASSIGNMENT_STATUS_LABELS,
} from "@/features/classes/utils/teacherAssignmentFormat";
import { useCreateDialog } from "@/shared/hooks/useCreateDialog";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

interface AssignmentListProps {
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

export function AssignmentList({ canCreate }: AssignmentListProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState("");
  const [kind, setKind] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const debouncedSearch = useDebouncedValue(searchText.trim());
  const { classes } = useLecturerClasses();
  const classId = searchParams.get(ASSIGNMENT_CLASS_PARAM) ?? undefined;
  const selectedClass = classes.find((item) => item.id === classId);
  const isClassView = Boolean(classId);
  const { result, isLoading, error, reload } = useAssignmentList({
    classId,
    kind: isClassView || kind === ALL ? undefined : (kind as AssignmentKind),
    status: status === ALL ? undefined : (status as AssignmentStatus),
    q: debouncedSearch || undefined,
  });

  const classOptions = useMemo(
    () => [ALL_OPTION, ...classes.map((item) => ({ value: item.id, label: item.name }))],
    [classes]
  );
  const selectClass = (value: string) =>
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value === ALL) next.delete(ASSIGNMENT_CLASS_PARAM);
        else next.set(ASSIGNMENT_CLASS_PARAM, value);
        return next;
      },
      { replace: true }
    );
  const isFiltered = Boolean(debouncedSearch) || status !== ALL || (!isClassView && kind !== ALL);
  const canCreateInClass = canCreate && selectedClass?.status === "ACTIVE";
  const items = result?.items ?? [];
  const createDialog = useCreateDialog("assignment", ["classId", "kind"] as const);
  const openCreate = (presetKind?: AssignmentKind) => createDialog.open({ classId, kind: presetKind });

  return (
    <div className="flex grow flex-col gap-[10px] px-[18px] pb-[18px] pt-[14px] lg:px-[32px] lg:pb-[24px] lg:pt-[20px]">
      <div className="flex shrink-0 items-center gap-[8px]">
        <div className="flex min-w-0 grow lg:max-w-[720px]">
          <SearchInput id="assignment-search" label="Tìm bài tập" value={searchText} onChange={setSearchText} />
        </div>
        {canCreate && (
          <ActionButton className="max-sm:px-3.5 lg:ml-auto" onClick={() => openCreate()}>
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
            <span className="max-sm:sr-only">Tạo bài tập</span>
          </ActionButton>
        )}
      </div>
      <div className="no-scrollbar flex shrink-0 gap-[7px] overflow-x-auto">
        <FilterSelect label="Lớp" value={classId ?? ALL} allValue={ALL} options={classOptions} onChange={selectClass} />
        {!isClassView && (
          <FilterSelect label="Loại" value={kind} allValue={ALL} options={KIND_OPTIONS} onChange={setKind} />
        )}
        <FilterSelect label="Trạng thái" value={status} allValue={ALL} options={STATUS_OPTIONS} onChange={setStatus} />
        {classId && (
          <Link
            to={`/teacher/classes/${classId}`}
            className="inline-flex min-h-[44px] shrink-0 items-center px-[6px] text-[13px] font-medium whitespace-nowrap text-bvc-accent-text"
          >
            Mở trang lớp →
          </Link>
        )}
      </div>
      {isClassView ? (
        <ListState isLoading={isLoading} error={error} isEmpty={false} emptyMessage="" onRetry={reload}>
          <ClassAssignmentSections
            items={items}
            canCreate={canCreateInClass}
            isFiltered={isFiltered}
            onCreate={openCreate}
          />
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
      {canCreate && (
        <AssignmentCreateDialog
          open={createDialog.isOpen}
          onClose={createDialog.close}
          presetClassId={createDialog.presets.classId}
          presetKind={createDialog.presets.kind}
          onSaved={reload}
        />
      )}
    </div>
  );
}

interface ClassAssignmentSectionsProps {
  items: AssignmentListItem[];
  canCreate: boolean;
  isFiltered: boolean;
  onCreate: (kind: AssignmentKind) => void;
}

// Class view: one fixed slot each for the ensemble and the solo assignment (BE allows one of each per class),
// then the bonus and other assignments.
function ClassAssignmentSections({ items, canCreate, isFiltered, onCreate }: ClassAssignmentSectionsProps) {
  const otherItems = items.filter((item) => !FEATURED_KINDS.includes(item.kind));
  return (
    <>
      <div className="grid gap-[10px] sm:grid-cols-2">
        {FEATURED_KINDS.map((featuredKind) => {
          const assignment = items.find((item) => item.kind === featuredKind);
          if (assignment) return <AssignmentCard key={featuredKind} assignment={assignment} />;
          const label = ASSIGNMENT_KIND_LABELS[featuredKind];
          const slotClassName =
            "flex min-h-[104px] flex-col items-center justify-center gap-[6px] rounded-bvc-xl border border-dashed border-bvc-border-strong p-[15px] text-center text-[13.5px] text-bvc-muted";
          // While searching, an empty slot only means "no match": creating from it could hit the one-per-class rule.
          if (!canCreate || isFiltered) {
            return (
              <div key={featuredKind} className={slotClassName}>
                {isFiltered ? `Không có bài ${label} phù hợp.` : `Lớp chưa có bài ${label}.`}
              </div>
            );
          }
          return (
            <button
              key={featuredKind}
              type="button"
              onClick={() => onCreate(featuredKind)}
              className={`${slotClassName} cursor-pointer hover:border-bvc-accent`}
            >
              <span>Lớp chưa có bài {label}.</span>
              <span className="inline-flex items-center gap-[6px] font-medium text-bvc-ink">
                <Plus size={16} strokeWidth={2} aria-hidden="true" /> Tạo bài {label}
              </span>
            </button>
          );
        })}
      </div>
      <h3 className="pt-[6px] text-[15px] font-semibold text-bvc-ink">Bài tập khác</h3>
      {otherItems.length === 0 ? (
        <p className="rounded-bvc-xl bg-bvc-soft p-[15px] text-[13.5px] text-bvc-muted">
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
