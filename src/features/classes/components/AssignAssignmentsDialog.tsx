import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { AssignSelectRow } from "@/features/classes/components/AssignSelectRow";
import { SemesterEmptyNotice } from "@/features/classes/components/SemesterEmptyNotice";
import { useAssignToClasses } from "@/features/classes/hooks/useAssignToClasses";
import {
  type AssignmentBase,
  type AssignmentKind,
  type AssignResult,
  type OverviewClass,
  type OverviewEmptyReason,
  type OverviewSemester,
} from "@/features/classes/types/teacherAssignmentTypes";
import {
  ASSIGN_SKIP_LABELS,
  assignmentGroupKey,
  groupAssignmentSources,
  OVERVIEW_STATUS_LABELS,
  summarizeClass,
  type SourceGroup,
} from "@/features/classes/utils/assignmentOverviewFormat";
import { ASSIGNMENT_KIND_LABELS } from "@/features/classes/utils/teacherAssignmentFormat";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { BvcDialogPopup } from "@/shared/components/bvc/BvcDialogPopup";
import { SearchField } from "@/shared/components/bvc/SearchField";
import { Dialog, DialogClose, DialogDescription, DialogTitle } from "@/shared/components/ui/dialog";
import { toast } from "@/shared/components/ui/toast";
import { cn } from "@/shared/utils/cn";
import { matchesKeyword } from "@/shared/utils/searchUtils";

interface AssignAssignmentsDialogProps {
  open: boolean;
  onClose: () => void;
  classes: OverviewClass[];
  emptyReason: OverviewEmptyReason | null;
  semester: OverviewSemester | null;
  onAssigned: (created: AssignmentBase[]) => void;
  // Source group keys (assignmentGroupKey) checked when the dialog opens.
  initialSelectedKeys?: string[];
}

type KindFilter = "ALL" | AssignmentKind;

const SINGLE_KINDS: AssignmentKind[] = ["SOLO", "ENSEMBLE"];
const KIND_FILTERS: KindFilter[] = ["ALL", "SOLO", "ENSEMBLE", "BONUS", "OTHER"];
const CHIP = "rounded-[8px] bg-bvc-surface px-[8px] py-[2px] text-[11.5px] font-semibold text-bvc-ink";

export function AssignAssignmentsDialog({ open, onClose, ...content }: AssignAssignmentsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <BvcDialogPopup className="h-[min(900px,calc(100dvh-48px))] max-w-[1160px] gap-0 overflow-hidden p-0 sm:p-0">
        <AssignContent onClose={onClose} {...content} />
      </BvcDialogPopup>
    </Dialog>
  );
}

// The reason a (assignment, class) pair would be skipped by the server, or null when it would be created.
function findConflict(group: SourceGroup, cls: OverviewClass): string | null {
  if (cls.assignments.some((assignment) => assignmentGroupKey(assignment) === group.key)) return "Đã có bài này";
  if (SINGLE_KINDS.includes(group.kind) && cls.assignments.some((assignment) => assignment.kind === group.kind)) {
    return `Đã có bài ${ASSIGNMENT_KIND_LABELS[group.kind]}`;
  }
  return null;
}

function toggleIn(current: Set<string>, id: string): Set<string> {
  const next = new Set(current);
  if (!next.delete(id)) next.add(id);
  return next;
}

function AssignContent({
  onClose,
  classes,
  emptyReason,
  semester,
  onAssigned,
  initialSelectedKeys,
}: Omit<AssignAssignmentsDialogProps, "open">) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set(initialSelectedKeys));
  const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<KindFilter>("ALL");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [skipped, setSkipped] = useState<AssignResult["skipped"] | null>(null);
  const { assign, isAssigning } = useAssignToClasses();

  const sources = useMemo(() => groupAssignmentSources(classes), [classes]);
  const targets = useMemo(() => classes.filter((item) => item.status === "ACTIVE"), [classes]);
  const visibleSources = sources.filter(
    (group) => (kind === "ALL" || group.kind === kind) && matchesKeyword(query, [group.title])
  );
  const chosenSources = sources.filter((group) => selectedKeys.has(group.key));
  const chosenClasses = targets.filter((item) => selectedClassIds.has(item.id));

  let newPairs = 0;
  let skipPairs = 0;
  for (const group of chosenSources) {
    for (const cls of chosenClasses) {
      if (findConflict(group, cls)) skipPairs += 1;
      else newPairs += 1;
    }
  }
  const hasSelection = chosenSources.length > 0 && chosenClasses.length > 0;

  const areAllVisibleSelected =
    visibleSources.length > 0 && visibleSources.every((group) => selectedKeys.has(group.key));
  const toggleAllSources = () =>
    setSelectedKeys((current) => {
      const next = new Set(current);
      for (const group of visibleSources) {
        if (areAllVisibleSelected) next.delete(group.key);
        else next.add(group.key);
      }
      return next;
    });
  const areAllClassesSelected = targets.length > 0 && chosenClasses.length === targets.length;
  const toggleAllClasses = () =>
    setSelectedClassIds(areAllClassesSelected ? new Set() : new Set(targets.map((item) => item.id)));

  const submit = async () => {
    setErrorMessage(null);
    const outcome = await assign({
      assignmentIds: chosenSources.map((group) => group.representativeId),
      classIds: chosenClasses.map((item) => item.id),
    });
    if ("error" in outcome) {
      setErrorMessage(outcome.error.message);
      // Clones are committed pair by pair, so some may exist even though the request failed: refresh the list.
      onAssigned([]);
      return;
    }
    const { created, skipped: skippedPairs } = outcome.result;
    toast.success(`Đã gán ${created.length} bài, bỏ qua ${skippedPairs.length}`);
    onAssigned(created);
    if (skippedPairs.length > 0) setSkipped(skippedPairs);
    else onClose();
  };

  const titleById = new Map(
    classes.flatMap((item) => item.assignments.map((assignment) => [assignment.id, assignment.title] as const))
  );
  const classNameById = new Map(classes.map((item) => [item.id, item.name] as const));

  let buttonLabel = "Gán bài tập";
  if (hasSelection) {
    buttonLabel = newPairs === 0 ? "Đã gán hết" : `Gán ${chosenSources.length} bài cho ${chosenClasses.length} lớp`;
  }
  let summary = "Chọn ít nhất 1 bài tập và 1 lớp.";
  if (hasSelection) {
    summary = `Sẽ tạo ${newPairs} lượt gán mới${skipPairs ? ` · bỏ qua ${skipPairs} lượt đã gán` : ""}.`;
  }
  let warning: string | null = null;
  if (hasSelection && skipPairs) {
    warning =
      newPairs === 0
        ? "Tất cả bài tập đã chọn đã có trong tất cả các lớp đã chọn, nên không thể gán thêm. Hãy chọn thêm bài tập hoặc lớp khác."
        : `Có ${skipPairs} lượt bài–lớp đã được gán trước đó. Khi bấm Gán, hệ thống chỉ thêm ${newPairs} lượt mới chưa có và giữ nguyên dữ liệu các bài đã gán.`;
  }

  return (
    <>
      <div className="flex shrink-0 items-start gap-[16px] border-b border-bvc-border px-[28px] pt-[22px] pr-[72px] pb-[16px]">
        <div className="flex grow flex-col gap-[5px]">
          <DialogTitle className="text-[22px] font-extrabold tracking-[-0.02em] text-bvc-ink">
            Gán bài tập cho lớp
          </DialogTitle>
          <DialogDescription className="text-[13.5px] text-bvc-muted">
            Chọn một hoặc nhiều bài tập ở cột trái, sau đó chọn các lớp nhận bài ở cột phải.
          </DialogDescription>
        </div>
        <DialogClose className="top-[22px] right-[28px] size-11 rounded-bvc-xl border border-bvc-border-strong p-0 [&_svg]:mx-auto" />
      </div>

      {skipped ? (
        <div className="flex min-h-0 grow flex-col gap-[12px] overflow-y-auto px-[28px] py-[20px]">
          <p className="text-[14px] font-semibold text-bvc-ink">Một số lượt gán đã bị bỏ qua:</p>
          <ul className="flex flex-col gap-[8px] text-[13.5px] text-bvc-ink">
            {skipped.map((pair) => (
              <li
                key={`${pair.classId}-${pair.assignmentId}`}
                className="rounded-[12px] bg-bvc-soft px-[14px] py-[10px]"
              >
                {`${classNameById.get(pair.classId) ?? "Lớp không xác định"} — ${titleById.get(pair.assignmentId) ?? "Bài tập"}: ${ASSIGN_SKIP_LABELS[pair.reason]}`}
              </li>
            ))}
          </ul>
          <div className="mt-auto flex justify-end">
            <ActionButton onClick={onClose}>Đóng</ActionButton>
          </div>
        </div>
      ) : (
        <>
          <div className="flex min-h-0 grow flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
            <div
              role="group"
              aria-label="Bài tập"
              className="flex min-w-0 flex-1 flex-col border-bvc-border max-lg:border-b lg:min-h-0 lg:border-r"
            >
              <ColumnHeader
                title="Bài tập"
                count={`${selectedKeys.size} / ${sources.length} đã chọn`}
                toggleLabel={areAllVisibleSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                onToggleAll={toggleAllSources}
              />
              <div className="flex shrink-0 flex-col gap-[10px] px-[28px] pb-[12px]">
                <SearchField
                  label="Tìm theo tên bài"
                  placeholder="Tìm theo tên bài"
                  value={query}
                  onChange={setQuery}
                />
                <div role="group" aria-label="Lọc theo loại bài" className="flex flex-wrap gap-[8px]">
                  {KIND_FILTERS.map((filter) => (
                    <KindChip
                      key={filter}
                      label={filter === "ALL" ? "Tất cả" : ASSIGNMENT_KIND_LABELS[filter]}
                      count={
                        filter === "ALL" ? sources.length : sources.filter((group) => group.kind === filter).length
                      }
                      pressed={kind === filter}
                      onClick={() => setKind(filter)}
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-[10px] px-[28px] pb-[18px] lg:min-h-0 lg:grow lg:overflow-y-auto">
                {visibleSources.map((group) => (
                  <AssignSelectRow
                    key={group.key}
                    pressed={selectedKeys.has(group.key)}
                    onToggle={() => setSelectedKeys((current) => toggleIn(current, group.key))}
                    trailing={<StatusText status={group.status} />}
                  >
                    <span className="text-[14.5px] font-bold">{group.title}</span>
                    <span className="text-[12.5px] text-bvc-muted">
                      {[ASSIGNMENT_KIND_LABELS[group.kind], group.sheetTitle].filter(Boolean).join(" · ")}
                    </span>
                    <span className="flex flex-wrap items-center gap-[6px]">
                      <span className="text-[12px] text-bvc-muted">Đang gán cho:</span>
                      {group.holderClassNames.map((name) => (
                        <span key={name} className={CHIP}>
                          {name}
                        </span>
                      ))}
                    </span>
                  </AssignSelectRow>
                ))}
                {visibleSources.length === 0 && (
                  <div className="rounded-[16px] border border-dashed border-bvc-border-strong p-[20px] text-[14px] text-bvc-muted">
                    {sources.length === 0
                      ? "Chưa có bài tập nào trong học kỳ này."
                      : "Không có bài tập nào khớp bộ lọc."}
                  </div>
                )}
              </div>
            </div>

            <div role="group" aria-label="Lớp nhận bài" className="flex min-w-0 flex-1 flex-col bg-bvc-soft lg:min-h-0">
              <ColumnHeader
                title="Lớp nhận bài"
                count={`${chosenClasses.length} / ${targets.length} đã chọn`}
                toggleLabel={areAllClassesSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                onToggleAll={toggleAllClasses}
              />
              <div className="flex flex-col gap-[10px] px-[28px] pb-[18px] lg:min-h-0 lg:grow lg:overflow-y-auto">
                {emptyReason && <SemesterEmptyNotice reason={emptyReason} semester={semester} />}
                {!emptyReason && targets.length === 0 && (
                  <p className="text-[14px] text-bvc-muted">Không có lớp đang hoạt động trong học kỳ này.</p>
                )}
                {targets.map((cls) => {
                  const conflicts = chosenSources.flatMap((group) => findConflict(group, cls) ?? []);
                  const stats = summarizeClass(cls);
                  return (
                    <AssignSelectRow
                      key={cls.id}
                      pressed={selectedClassIds.has(cls.id)}
                      onToggle={() => setSelectedClassIds((current) => toggleIn(current, cls.id))}
                      trailing={
                        <span className="shrink-0 font-bvc-mono text-[13px] font-semibold">{`${stats.practiceCount} lượt`}</span>
                      }
                    >
                      <span className="text-[14.5px] font-bold">{cls.name}</span>
                      <span className="text-[12.5px] text-bvc-muted">{`${cls.memberCount} sinh viên · ${stats.assignmentCount} bài tập`}</span>
                      {conflicts.length > 0 && (
                        <span className="text-[12.5px] font-semibold text-bvc-accent-text">
                          {conflicts[0]}
                          {conflicts.length > 1 ? ` (+${conflicts.length - 1} bài khác)` : ""}
                        </span>
                      )}
                    </AssignSelectRow>
                  );
                })}
              </div>
            </div>
          </div>

          {warning && (
            <div
              role="alert"
              className="flex shrink-0 items-start gap-[10px] border-t border-bvc-accent-border bg-bvc-accent-tint px-[28px] py-[12px] text-[13.5px] leading-normal text-bvc-accent-text"
            >
              <AlertTriangle size={18} strokeWidth={1.8} className="mt-[2px] shrink-0" aria-hidden="true" />
              <span>{warning}</span>
            </div>
          )}
          {errorMessage && (
            <div
              role="alert"
              className="shrink-0 border-t border-bvc-border bg-white px-[28px] py-[12px] text-[13.5px] text-bvc-error"
            >
              {errorMessage}
            </div>
          )}
          <div className="flex shrink-0 flex-wrap items-center gap-[16px] border-t border-bvc-border px-[28px] py-[14px]">
            <span className="grow text-[13.5px] text-bvc-muted">{summary}</span>
            <ActionButton variant="secondary" onClick={onClose}>
              Hủy
            </ActionButton>
            <ActionButton disabled={newPairs === 0} isLoading={isAssigning} onClick={submit}>
              {buttonLabel}
            </ActionButton>
          </div>
        </>
      )}
    </>
  );
}

function ColumnHeader({
  title,
  count,
  toggleLabel,
  onToggleAll,
}: {
  title: string;
  count: string;
  toggleLabel: string;
  onToggleAll: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-[10px] px-[28px] pt-[14px] pb-[10px]">
      <span className="text-[14px] font-extrabold text-bvc-ink">{title}</span>
      <span className="font-bvc-mono text-[12.5px] text-bvc-muted">{count}</span>
      <span className="grow" />
      <button
        type="button"
        onClick={onToggleAll}
        className="min-h-11 cursor-pointer px-[4px] text-[13.5px] font-bold text-bvc-accent-text"
      >
        {toggleLabel}
      </button>
    </div>
  );
}

function KindChip({
  label,
  count,
  pressed,
  onClick,
}: {
  label: string;
  count: number;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center gap-[8px] rounded-full border px-[16px] text-[13.5px] font-semibold",
        pressed ? "border-bvc-ink bg-bvc-ink text-white" : "border-bvc-border-strong bg-white text-bvc-ink"
      )}
    >
      {label}
      <span className="font-bvc-mono text-[12px] opacity-75">{count}</span>
    </button>
  );
}

function StatusText({ status }: { status: SourceGroup["status"] }) {
  return (
    <span className="flex shrink-0 items-center gap-[7px] text-[13.5px]">
      <span className={cn("size-[7px] rounded-full", status === "PUBLISHED" ? "bg-bvc-dot-ok" : "bg-bvc-bar-strong")} />
      {OVERVIEW_STATUS_LABELS[status]}
    </span>
  );
}
