import { useEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AssignAssignmentsDialog } from "@/features/classes/components/AssignAssignmentsDialog";
import {
  AssignmentDetailDrawer,
  type AssignmentDrawerTarget,
} from "@/features/classes/components/AssignmentDetailDrawer";
import { AssignmentClassSection } from "@/features/classes/components/AssignmentClassSection";
import { AssignmentCreateDialog } from "@/features/classes/components/AssignmentCreateDialog";
import { AssignmentSheetTable } from "@/features/classes/components/AssignmentSheetTable";
import { ListState } from "@/features/classes/components/ListState";
import { SemesterEmptyNotice } from "@/features/classes/components/SemesterEmptyNotice";
import { useAssignmentOverview } from "@/features/classes/hooks/useAssignmentOverview";
import {
  emptyReasonMessage,
  filterOverviewClasses,
  formatDayMonth,
  groupBySheet,
} from "@/features/classes/utils/assignmentOverviewFormat";
import {
  ASSIGNMENT_CLASS_PARAM,
  ASSIGNMENT_SHEET_PARAM,
  ASSIGNMENT_TAB_PARAM,
} from "@/features/classes/utils/teacherAssignmentFormat";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { PillTabs } from "@/shared/components/bvc/PillTabs";
import { SearchField } from "@/shared/components/bvc/SearchField";
import { useCreateDialog } from "@/shared/hooks/useCreateDialog";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

interface AssignmentListProps {
  canCreate: boolean;
}

type ViewTab = "class" | "sheet";

export function AssignmentList({ canCreate }: AssignmentListProps) {
  const navigate = useNavigate();
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const deepLinkClassId = searchParams.get(ASSIGNMENT_CLASS_PARAM);
  const detailSheetId = searchParams.get(ASSIGNMENT_SHEET_PARAM);
  // The list tab lives in the URL so it survives opening and closing the detail drawer.
  const tab: ViewTab = searchParams.get(ASSIGNMENT_TAB_PARAM) === "sheet" || detailSheetId ? "sheet" : "class";
  const [searchText, setSearchText] = useState("");
  const [openClassIds, setOpenClassIds] = useState<Set<string>>(
    () => new Set(deepLinkClassId ? [deepLinkClassId] : [])
  );
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignPreselect, setAssignPreselect] = useState<string[]>([]);
  const query = useDebouncedValue(searchText.trim());
  const { overview, isLoading, error, reload } = useAssignmentOverview();
  const createDialog = useCreateDialog("assignment", ["classId", "kind"] as const);
  const hasScrolled = useRef(false);

  const classes = useMemo(() => filterOverviewClasses(overview?.classes ?? [], query), [overview, query]);
  const sheetGroups = useMemo(() => groupBySheet(classes, overview?.sheetStats ?? []), [classes, overview]);
  const emptyReason = overview?.emptyReason ?? null;

  useEffect(() => {
    if (hasScrolled.current || !deepLinkClassId || !overview?.classes.some((item) => item.id === deepLinkClassId))
      return;
    hasScrolled.current = true;
    document.getElementById(`class-${deepLinkClassId}`)?.scrollIntoView({ block: "start" });
  }, [overview, deepLinkClassId]);

  let drawerTarget: AssignmentDrawerTarget | null = null;
  if (assignmentId) drawerTarget = { mode: "class", assignmentId };
  else if (detailSheetId) drawerTarget = { mode: "sheet", sheetMusicId: detailSheetId };

  const setTab = (next: ViewTab) =>
    setSearchParams(
      (previous) => {
        const params = new URLSearchParams(previous);
        if (next === "sheet") params.set(ASSIGNMENT_TAB_PARAM, "sheet");
        else params.delete(ASSIGNMENT_TAB_PARAM);
        return params;
      },
      { replace: true }
    );

  // Back to the list, keeping ?class= and the active tab.
  const closeDrawer = () => {
    const params = new URLSearchParams(searchParams);
    params.delete(ASSIGNMENT_SHEET_PARAM);
    if (tab === "sheet") params.set(ASSIGNMENT_TAB_PARAM, "sheet");
    const search = params.toString();
    navigate({ pathname: "/teacher/assignments", search: search ? `?${search}` : "" }, { replace: true });
  };

  const openAssign = (preselectedKeys: string[] = []) => {
    setAssignPreselect(preselectedKeys);
    setIsAssignOpen(true);
  };

  const assignFromDrawer = (groupKeys: string[]) => {
    closeDrawer();
    openAssign(groupKeys);
  };

  const toggleClass = (classId: string) =>
    setOpenClassIds((current) => {
      const next = new Set(current);
      if (!next.delete(classId)) next.add(classId);
      return next;
    });

  const handleAssigned = (created: { id: string; classId: string }[]) => {
    setHighlightIds(new Set(created.map((item) => item.id)));
    setOpenClassIds((current) => new Set([...current, ...created.map((item) => item.classId)]));
    reload();
  };

  const assignDisabledReason = !overview
    ? "Đang tải dữ liệu."
    : emptyReason
      ? emptyReasonMessage(emptyReason, { semester: overview.semester, today: new Date() })
      : undefined;

  return (
    <div className="flex grow flex-col gap-[14px] px-[18px] pb-[18px] pt-[14px] lg:gap-[16px] lg:px-[32px] lg:pb-[24px] lg:pt-[20px]">
      <div className="flex shrink-0 flex-wrap items-center gap-[10px]">
        <SearchField
          label="Tìm bài tập"
          placeholder="Tên bài tập"
          value={searchText}
          onChange={setSearchText}
          className="min-w-0 grow lg:max-w-[280px] lg:grow-0"
        />
        {overview?.semester && (
          <span className="rounded-full border border-bvc-border-strong px-[14px] py-[8px] text-[13px] text-bvc-muted">
            {`Học kỳ: ${overview.semester.name} (${formatDayMonth(overview.semester.startDate)} – ${formatDayMonth(overview.semester.endDate)})`}
          </span>
        )}
        {canCreate && (
          <div className="flex items-center gap-[8px] lg:ml-auto">
            <ActionButton
              variant="secondary"
              disabled={Boolean(assignDisabledReason)}
              title={assignDisabledReason}
              onClick={() => openAssign()}
            >
              Gán bài tập cho lớp
            </ActionButton>
            <ActionButton className="max-sm:px-3.5" onClick={() => createDialog.open()}>
              <Plus size={16} strokeWidth={2} aria-hidden="true" />
              <span className="max-sm:sr-only">Tạo bài tập</span>
            </ActionButton>
          </div>
        )}
      </div>

      <ListState isLoading={isLoading} error={error} isEmpty={false} emptyMessage="" onRetry={reload}>
        {emptyReason ? (
          <SemesterEmptyNotice reason={emptyReason} semester={overview?.semester ?? null} />
        ) : (
          <>
            <PillTabs
              label="Chế độ xem"
              value={tab}
              onChange={setTab}
              tabs={[
                { value: "class", label: "Theo lớp", count: classes.length },
                { value: "sheet", label: "Theo bài tập chung", count: sheetGroups.length },
              ]}
            />
            {query && classes.length === 0 ? (
              <p className="px-[4px] py-[32px] text-[14.5px] text-bvc-muted">{`Không có bài tập nào khớp “${query}”.`}</p>
            ) : tab === "class" ? (
              classes.map((item) => (
                <AssignmentClassSection
                  key={item.id}
                  cls={item}
                  open={Boolean(query) || openClassIds.has(item.id)}
                  onToggle={() => toggleClass(item.id)}
                  highlightIds={highlightIds}
                />
              ))
            ) : (
              <AssignmentSheetTable groups={sheetGroups} />
            )}
          </>
        )}
      </ListState>

      {canCreate && (
        <>
          <AssignmentCreateDialog
            open={createDialog.isOpen}
            onClose={createDialog.close}
            presetClassId={createDialog.presets.classId}
            presetKind={createDialog.presets.kind}
            onSaved={reload}
          />
          <AssignAssignmentsDialog
            open={isAssignOpen}
            onClose={() => setIsAssignOpen(false)}
            classes={overview?.classes ?? []}
            emptyReason={emptyReason}
            semester={overview?.semester ?? null}
            onAssigned={handleAssigned}
            initialSelectedKeys={assignPreselect}
          />
        </>
      )}
      <AssignmentDetailDrawer
        target={drawerTarget}
        onClose={closeDrawer}
        onChanged={reload}
        onAssign={assignFromDrawer}
      />
    </div>
  );
}
