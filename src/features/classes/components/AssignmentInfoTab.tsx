import { type ReactNode } from "react";
import { StatusLabel } from "@/features/classes/components/StatusLabel";
import {
  type AssignmentDetail,
  type AssignmentStatus,
  type SheetGroupAssignment,
  type SheetGroupDetail,
} from "@/features/classes/types/teacherAssignmentTypes";
import {
  INFO_FIELD_LABELS,
  INFO_TEXT,
  formatMaxSubmissions,
  formatTempo,
  formatThreshold,
  hasDifferentConfig,
  uniqueStatuses,
} from "@/features/classes/utils/assignmentDetailFormat";
import { assignmentGroupKey } from "@/features/classes/utils/assignmentOverviewFormat";
import {
  ASSIGNMENT_KIND_LABELS,
  ASSIGNMENT_STATUS_LABELS,
  formatVietnamDateTime,
} from "@/features/classes/utils/teacherAssignmentFormat";

type AssignmentInfoTabProps =
  | { mode: "class"; assignment: AssignmentDetail }
  | { mode: "sheet"; group: SheetGroupDetail };

const STATUS_TONES: Record<AssignmentStatus, "ok" | "warn" | "muted"> = {
  PUBLISHED: "ok",
  DRAFT: "warn",
  CLOSED: "muted",
};

function FieldGrid({ items }: { items: { label: string; value: ReactNode; mono?: boolean }[] }) {
  return (
    <dl className="m-0 grid grid-cols-1 gap-px overflow-hidden rounded-bvc-lg border border-bvc-border bg-bvc-border sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-[3px] bg-white px-[16px] py-[12px]">
          <dt className="text-[12px] text-bvc-muted">{item.label}</dt>
          <dd className={`m-0 text-[14px] font-semibold ${item.mono ? "font-bvc-mono" : ""}`}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-[12px]">
      <h3 className="m-0 text-[13.5px] font-extrabold">{title}</h3>
      {children}
    </section>
  );
}

function statusLabel(status: AssignmentStatus) {
  return <StatusLabel label={ASSIGNMENT_STATUS_LABELS[status]} tone={STATUS_TONES[status]} className="text-[14px]" />;
}

function formatOptionalDate(value: string | null): string {
  return value ? formatVietnamDateTime(value) : INFO_TEXT.empty;
}

function ClassInfo({ assignment }: { assignment: AssignmentDetail }) {
  return (
    <>
      <Block title={INFO_TEXT.general}>
        <FieldGrid
          items={[
            { label: INFO_FIELD_LABELS.kind, value: ASSIGNMENT_KIND_LABELS[assignment.kind] },
            { label: INFO_FIELD_LABELS.status, value: statusLabel(assignment.status) },
            { label: INFO_FIELD_LABELS.className, value: assignment.className },
            { label: INFO_FIELD_LABELS.publishedAt, value: formatOptionalDate(assignment.publishedAt) },
            { label: INFO_FIELD_LABELS.updatedAt, value: formatVietnamDateTime(assignment.updatedAt) },
            { label: INFO_FIELD_LABELS.createdBy, value: assignment.createdBy?.fullName ?? INFO_TEXT.empty },
          ]}
        />
        <p className="m-0 whitespace-pre-line rounded-bvc-lg border border-bvc-border bg-bvc-soft px-[16px] py-[14px] text-[14px] leading-[1.6]">
          {assignment.description || INFO_TEXT.noDescription}
        </p>
      </Block>
      <Block title={INFO_TEXT.config}>
        <FieldGrid
          items={[
            { label: INFO_FIELD_LABELS.tempo, value: formatTempo(assignment.effectiveBpm), mono: true },
            { label: INFO_FIELD_LABELS.threshold, value: formatThreshold(assignment.minAccuracy), mono: true },
            {
              label: INFO_FIELD_LABELS.maxSubmissions,
              value: formatMaxSubmissions(assignment.maxSubmissions ?? null),
              mono: true,
            },
            { label: INFO_FIELD_LABELS.version, value: `v${assignment.version}`, mono: true },
          ]}
        />
      </Block>
    </>
  );
}

function groupCopies(assignments: SheetGroupAssignment[]): SheetGroupAssignment[][] {
  const groups = new Map<string, SheetGroupAssignment[]>();
  for (const assignment of assignments) {
    const key = assignmentGroupKey(assignment);
    groups.set(key, [...(groups.get(key) ?? []), assignment]);
  }
  return [...groups.values()];
}

function ConfigValue({ label, value, differs }: { label: string; value: string; differs: boolean }) {
  return (
    <span>
      <span className="text-bvc-muted">{label} </span>
      <span className="font-bvc-mono font-semibold">{value}</span>
      {differs && <span className="ml-[6px] text-[12px] text-bvc-accent-text">{INFO_TEXT.differs}</span>}
    </span>
  );
}

function SheetInfo({ group }: { group: SheetGroupDetail }) {
  const { assignments } = group;
  const kinds = [...new Set(assignments.map((item) => ASSIGNMENT_KIND_LABELS[item.kind]))];
  const publishedDates = assignments.flatMap((item) => (item.publishedAt ? [item.publishedAt] : [])).sort();
  const updatedDates = assignments.map((item) => item.updatedAt).sort();
  const creators = [...new Set(assignments.flatMap((item) => (item.createdBy ? [item.createdBy.fullName] : [])))];

  return (
    <>
      <Block title={INFO_TEXT.general}>
        <FieldGrid
          items={[
            { label: INFO_FIELD_LABELS.kind, value: kinds.join(", ") },
            {
              label: INFO_FIELD_LABELS.status,
              value: (
                <span className="flex flex-wrap gap-x-[12px]">
                  {uniqueStatuses(assignments).map((status) => (
                    <span key={status}>{statusLabel(status)}</span>
                  ))}
                </span>
              ),
            },
            { label: INFO_FIELD_LABELS.classCount, value: group.byClass.length },
            { label: INFO_FIELD_LABELS.publishedAt, value: formatOptionalDate(publishedDates[0] ?? null) },
            {
              label: INFO_FIELD_LABELS.updatedAt,
              value: formatOptionalDate(updatedDates[updatedDates.length - 1] ?? null),
            },
            { label: INFO_FIELD_LABELS.createdBy, value: creators.join(", ") || INFO_TEXT.empty },
          ]}
        />
      </Block>
      <Block title={INFO_TEXT.sheetAssignments}>
        <div className="overflow-hidden rounded-bvc-lg border border-bvc-border">
          {groupCopies(assignments).map((copies) => {
            const first = copies[0];
            return (
              <div
                key={assignmentGroupKey(first)}
                data-testid="sheet-assignment-group"
                className="flex flex-col gap-[10px] border-b border-bvc-line px-[18px] py-[16px] last:border-b-0"
              >
                <div className="flex items-baseline gap-[12px]">
                  <span className="grow text-[15px] font-bold">{first.title}</span>
                  <span className="text-[13px] text-bvc-muted">{ASSIGNMENT_KIND_LABELS[first.kind]}</span>
                </div>
                <div className="flex flex-wrap gap-x-[18px] gap-y-[4px] text-[13px]">
                  <ConfigValue
                    label={INFO_FIELD_LABELS.tempo}
                    value={formatTempo(first.effectiveBpm)}
                    differs={hasDifferentConfig(copies, "effectiveBpm")}
                  />
                  <ConfigValue
                    label={INFO_FIELD_LABELS.threshold}
                    value={formatThreshold(first.minAccuracy)}
                    differs={hasDifferentConfig(copies, "minAccuracy")}
                  />
                  <ConfigValue
                    label={INFO_FIELD_LABELS.maxSubmissions}
                    value={formatMaxSubmissions(first.maxSubmissions)}
                    differs={hasDifferentConfig(copies, "maxSubmissions")}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-[6px]">
                  <span className="text-[12px] text-bvc-muted">{INFO_TEXT.assignTo}</span>
                  {copies.map((copy) => (
                    <span
                      key={copy.id}
                      className="rounded-[8px] bg-bvc-surface px-[10px] py-[3px] text-[11.5px] font-semibold"
                    >
                      {copy.className}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Block>
    </>
  );
}

export function AssignmentInfoTab(props: AssignmentInfoTabProps) {
  return (
    <div className="flex flex-col gap-[28px]">
      {props.mode === "class" ? <ClassInfo assignment={props.assignment} /> : <SheetInfo group={props.group} />}
    </div>
  );
}
