import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { AssignmentInfoTab } from "@/features/classes/components/AssignmentInfoTab";
import { AssignmentMediaTab } from "@/features/classes/components/AssignmentMediaTab";
import { AssignmentPracticeStats } from "@/features/classes/components/AssignmentPracticeStats";
import { AssignmentStudentRow } from "@/features/classes/components/AssignmentStudentRow";
import { ListState } from "@/features/classes/components/ListState";
import { StatusLabel } from "@/features/classes/components/StatusLabel";
import { useAssignmentActions } from "@/features/classes/hooks/useAssignmentActions";
import { useSheetGroupDetail } from "@/features/classes/hooks/useSheetGroupDetail";
import { useTeacherAssignmentDetail } from "@/features/classes/hooks/useTeacherAssignmentDetail";
import {
  type AssignmentDetail,
  type AssignmentStatus,
  type SheetGroupDetail,
} from "@/features/classes/types/teacherAssignmentTypes";
import {
  DRAWER_TABS,
  DRAWER_TEXT,
  STATUS_ACTIONS,
  confirmCopy,
  sheetGroupMeta,
  studentsHeading,
} from "@/features/classes/utils/assignmentDetailFormat";
import { assignmentGroupKey } from "@/features/classes/utils/assignmentOverviewFormat";
import { ASSIGNMENT_KIND_LABELS, ASSIGNMENT_STATUS_LABELS } from "@/features/classes/utils/teacherAssignmentFormat";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { ConfirmDialog } from "@/shared/components/bvc/ConfirmDialog";
import { Sheet, SheetClose, SheetPopup, SheetTitle } from "@/shared/components/ui/sheet";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/shared/components/ui/tabs";
import { toast } from "@/shared/components/ui/toast";

export type AssignmentDrawerTarget = { mode: "class"; assignmentId: string } | { mode: "sheet"; sheetMusicId: string };

interface AssignmentDetailDrawerProps {
  target: AssignmentDrawerTarget | null;
  onClose: () => void;
  onChanged: () => void;
  onAssign: (groupKeys: string[]) => void;
}

const STATUS_TONES: Record<AssignmentStatus, "ok" | "warn" | "muted"> = {
  PUBLISHED: "ok",
  DRAFT: "warn",
  CLOSED: "muted",
};

function targetKey(target: AssignmentDrawerTarget): string {
  return target.mode === "class" ? `class:${target.assignmentId}` : `sheet:${target.sheetMusicId}`;
}

const PADDING = "px-[18px] lg:px-[36px]";

// Right-hand drawer over the assignment list. Class mode: one class's copy with its students and actions.
// Sheet mode: every copy of one sheet music in the current semester.
export function AssignmentDetailDrawer({ target, onClose, onChanged, onAssign }: AssignmentDetailDrawerProps) {
  // Keep the last target while the drawer animates out.
  const [lastTarget, setLastTarget] = useState(target);
  if (target && targetKey(target) !== (lastTarget && targetKey(lastTarget))) setLastTarget(target);
  const shown = target ?? lastTarget;

  return (
    <Sheet open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetPopup
        side="right"
        showCloseButton={false}
        backdropClassName="bg-bvc-ink/32 backdrop-blur-none"
        className="w-full max-w-none gap-0 overflow-hidden rounded-none border-0 bg-white p-0 font-bvc-sans text-bvc-ink shadow-[-12px_0_36px_rgba(18,63,51,0.16)] lg:w-[1040px]"
      >
        {shown?.mode === "class" && (
          <ClassModeContent
            key={shown.assignmentId}
            assignmentId={shown.assignmentId}
            onClose={onClose}
            onChanged={onChanged}
          />
        )}
        {shown?.mode === "sheet" && (
          <SheetModeContent key={shown.sheetMusicId} sheetMusicId={shown.sheetMusicId} onAssign={onAssign} />
        )}
      </SheetPopup>
    </Sheet>
  );
}

interface ShellProps {
  title: string;
  meta: ReactNode;
  state: { isLoading: boolean; error: string | null; onRetry: () => void };
  tabs: Record<(typeof DRAWER_TABS)[number]["value"], ReactNode> | null;
  footer: ReactNode;
}

function DrawerShell({ title, meta, state, tabs, footer }: ShellProps) {
  return (
    <Tabs defaultValue="practice" className="flex min-h-0 grow flex-col">
      <header
        className={`flex shrink-0 flex-col gap-[16px] border-b border-bvc-border pt-[22px] lg:pt-[26px] ${PADDING}`}
      >
        <div className="flex items-start gap-[14px]">
          <div className="flex min-w-0 grow flex-col gap-[6px]">
            <span className="text-[12px] font-bold tracking-[0.12em] text-bvc-muted uppercase">
              {DRAWER_TEXT.overline}
            </span>
            <SheetTitle className="m-0 text-[22px] leading-[1.2] font-extrabold tracking-[-0.025em] lg:text-[28px]">
              {title}
            </SheetTitle>
            {meta && <div className="flex flex-wrap items-center gap-[10px] text-[13px] text-bvc-muted">{meta}</div>}
          </div>
          <SheetClose
            aria-label={DRAWER_TEXT.close}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-bvc-xl border border-bvc-border-strong bg-white text-bvc-ink hover:bg-bvc-surface"
          >
            <X size={18} strokeWidth={2} aria-hidden="true" />
          </SheetClose>
        </div>
        <TabsList
          aria-label={DRAWER_TEXT.tabsLabel}
          className="flex gap-[4px] overflow-x-auto rounded-none bg-transparent p-0"
        >
          {DRAWER_TABS.map((tab) => (
            <TabsTab
              key={tab.value}
              value={tab.value}
              className="min-h-[48px] shrink-0 cursor-pointer rounded-none border-b-[3px] border-transparent px-[16px] text-[14px] font-semibold whitespace-nowrap text-bvc-muted hover:text-bvc-ink data-selected:border-bvc-ink data-selected:bg-transparent data-selected:font-bold data-selected:text-bvc-ink data-selected:shadow-none lg:px-[20px] lg:text-[15px]"
            >
              {tab.label}
            </TabsTab>
          ))}
        </TabsList>
      </header>
      <div className={`min-h-0 grow overflow-y-auto pt-[22px] pb-[26px] lg:pt-[28px] lg:pb-[30px] ${PADDING}`}>
        {tabs ? (
          DRAWER_TABS.map((tab) => (
            <TabsPanel key={tab.value} value={tab.value} className="pt-0">
              {tabs[tab.value]}
            </TabsPanel>
          ))
        ) : (
          <ListState
            isLoading={state.isLoading}
            error={state.error}
            isEmpty={false}
            emptyMessage=""
            onRetry={state.onRetry}
          >
            {null}
          </ListState>
        )}
      </div>
      {tabs && footer && (
        <footer
          className={`flex shrink-0 flex-wrap items-center gap-[10px] border-t border-bvc-border pt-[14px] pb-[16px] lg:pt-[16px] lg:pb-[18px] ${PADDING}`}
        >
          {footer}
        </footer>
      )}
    </Tabs>
  );
}

function ClassModeContent({
  assignmentId,
  onClose,
  onChanged,
}: {
  assignmentId: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { assignment, isLoading, error, reload } = useTeacherAssignmentDetail(assignmentId);
  const current = assignment?.id === assignmentId ? assignment : null;
  return (
    <DrawerShell
      title={current?.title ?? DRAWER_TEXT.overline}
      meta={
        current && (
          <>
            <span>{`${ASSIGNMENT_KIND_LABELS[current.kind]} · ${current.className}`}</span>
            <span aria-hidden="true">·</span>
            <StatusLabel
              label={ASSIGNMENT_STATUS_LABELS[current.status]}
              tone={STATUS_TONES[current.status]}
              className="text-[13px] text-bvc-muted"
            />
          </>
        )
      }
      state={{ isLoading, error, onRetry: reload }}
      tabs={
        current && {
          practice: (
            <AssignmentPracticeStats stats={current.practiceStats}>
              <StudentList assignment={current} />
            </AssignmentPracticeStats>
          ),
          media: <AssignmentMediaTab media={current.media} />,
          info: <AssignmentInfoTab mode="class" assignment={current} />,
        }
      }
      footer={
        current?.classStatus === "ACTIVE" && (
          <ClassActions
            assignment={current}
            onDeleted={() => {
              onClose();
              onChanged();
            }}
            onStatusChanged={() => {
              reload();
              onChanged();
            }}
          />
        )
      }
    />
  );
}

function StudentList({ assignment }: { assignment: AssignmentDetail }) {
  return (
    <>
      <h3 className="m-0 text-[13.5px] font-extrabold">{studentsHeading(assignment.students.length)}</h3>
      {assignment.students.length === 0 ? (
        <p className="m-0 rounded-bvc-xl bg-bvc-soft p-[15px] text-[13.5px] text-bvc-muted">{DRAWER_TEXT.noStudents}</p>
      ) : (
        <div className="flex flex-col gap-[10px]">
          {assignment.students.map((student) => (
            <AssignmentStudentRow key={student.studentId} assignmentId={assignment.id} student={student} />
          ))}
        </div>
      )}
    </>
  );
}

// Moved from the former detail page: Sửa, Đăng / Đóng / Mở lại and Xóa, with a confirmation for Đóng and Xóa.
function ClassActions({
  assignment,
  onDeleted,
  onStatusChanged,
}: {
  assignment: AssignmentDetail;
  onDeleted: () => void;
  onStatusChanged: () => void;
}) {
  const [pendingAction, setPendingAction] = useState<"close" | "delete" | null>(null);
  const { changeStatus, deleteAssignment, isWorking } = useAssignmentActions(assignment.id);
  const statusAction = STATUS_ACTIONS[assignment.status];

  const report = (outcome: { message: string } | { error: string }): boolean => {
    if ("error" in outcome) {
      toast.error(outcome.error);
      return false;
    }
    toast.success(outcome.message);
    return true;
  };

  const runStatusAction = async () => {
    if (statusAction.action === "close") {
      setPendingAction("close");
      return;
    }
    if (report(await changeStatus(statusAction.action))) onStatusChanged();
  };

  const confirmPending = async () => {
    if (pendingAction === "delete") {
      const isDeleted = report(await deleteAssignment());
      setPendingAction(null);
      if (isDeleted) onDeleted();
      return;
    }
    const isClosed = report(await changeStatus("close"));
    setPendingAction(null);
    if (isClosed) onStatusChanged();
  };

  const copy = confirmCopy(pendingAction ?? "close", assignment.title);

  return (
    <>
      <Link to={`/teacher/assignments/${assignment.id}/edit`} className={actionButtonClass("secondary")}>
        {DRAWER_TEXT.edit}
      </Link>
      <span className="grow" />
      <ActionButton variant="secondary" disabled={isWorking} onClick={() => setPendingAction("delete")}>
        {DRAWER_TEXT.delete}
      </ActionButton>
      <ActionButton
        variant={statusAction.action === "close" ? "accent" : "primary"}
        disabled={isWorking}
        onClick={runStatusAction}
      >
        {statusAction.label}
      </ActionButton>
      <ConfirmDialog
        open={pendingAction !== null}
        title={copy.title}
        description={copy.description}
        confirmLabel={copy.confirmLabel}
        isLoading={isWorking}
        onConfirm={confirmPending}
        onOpenChange={(open) => !open && setPendingAction(null)}
      />
    </>
  );
}

function SheetModeContent({ sheetMusicId, onAssign }: { sheetMusicId: string; onAssign: (keys: string[]) => void }) {
  const { group, isLoading, error, reload } = useSheetGroupDetail(sheetMusicId);
  const current: SheetGroupDetail | null = group?.sheetMusic.id === sheetMusicId ? group : null;
  const assign = () => {
    if (current) onAssign([...new Set(current.assignments.map((copy) => assignmentGroupKey(copy)))]);
  };
  return (
    <DrawerShell
      title={current ? current.sheetMusic.pieceTitle || current.sheetMusic.name : DRAWER_TEXT.overline}
      meta={current && <span>{sheetGroupMeta(current.assignments)}</span>}
      state={{ isLoading, error, onRetry: reload }}
      tabs={
        current && {
          practice: <AssignmentPracticeStats stats={current.practiceStats} byClass={current.byClass} />,
          media: <AssignmentMediaTab media={current.media} />,
          info: <AssignmentInfoTab mode="sheet" group={current} />,
        }
      }
      footer={
        <>
          <span className="grow" />
          <ActionButton onClick={assign}>{DRAWER_TEXT.assignOther}</ActionButton>
        </>
      }
    />
  );
}
