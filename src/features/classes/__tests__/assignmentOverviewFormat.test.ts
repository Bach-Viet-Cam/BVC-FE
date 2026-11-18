import { describe, expect, it } from "vitest";
import {
  assignmentGroupKey,
  emptyReasonMessage,
  filterOverviewClasses,
  groupAssignmentSources,
  groupBySheet,
  summarizeClass,
} from "@/features/classes/utils/assignmentOverviewFormat";
import { type OverviewAssignment, type OverviewClass, type SheetStat } from "@/features/classes/types/teacherAssignmentTypes";

function assignment(overrides: Partial<OverviewAssignment> = {}): OverviewAssignment {
  return {
    id: "a1",
    classId: "c1",
    title: "Lý ngựa ô",
    kind: "SOLO",
    status: "PUBLISHED",
    version: 1,
    sheetMusicId: "sh1",
    sheetTitle: "Lý ngựa ô",
    practiceCount: 5,
    submittedCount: 3,
    memberCount: 20,
    updatedAt: "2026-10-01T00:00:00.000Z",
    ...overrides,
  };
}

function overviewClass(id: string, name: string, assignments: OverviewAssignment[]): OverviewClass {
  return { id, name, status: "ACTIVE", memberCount: 20, assignments };
}

describe("assignmentGroupKey", () => {
  it("ignores case and surrounding spaces of the title but not kind or sheet", () => {
    const base = { title: "Lý ngựa ô", kind: "SOLO" as const, sheetMusicId: null };
    expect(assignmentGroupKey({ ...base, title: "  LÝ NGỰA Ô " })).toBe(assignmentGroupKey(base));
    expect(assignmentGroupKey({ ...base, kind: "ENSEMBLE" })).not.toBe(assignmentGroupKey(base));
    expect(assignmentGroupKey({ ...base, sheetMusicId: "sh1" })).not.toBe(assignmentGroupKey(base));
  });
});

describe("filterOverviewClasses", () => {
  const classes = [
    overviewClass("c1", "TRD301", [assignment({ id: "a1" }), assignment({ id: "a2", title: "Bonus tháng 10" })]),
    overviewClass("c2", "TRD302", [assignment({ id: "a3", classId: "c2", title: "Hòa tấu" })]),
  ];

  it("returns the input when the query is empty", () => {
    expect(filterOverviewClasses(classes, "  ")).toBe(classes);
  });

  it("matches titles without diacritics and drops classes with no match", () => {
    const result = filterOverviewClasses(classes, "ngua");
    expect(result.map((item) => item.id)).toEqual(["c1"]);
    expect(result[0].assignments.map((item) => item.id)).toEqual(["a1"]);
  });
});

describe("groupBySheet", () => {
  it("takes counts from sheetStats", () => {
    const classes = [
      overviewClass("c1", "TRD301", [
        assignment({ id: "a1" }),
        assignment({ id: "a9", sheetMusicId: null, sheetTitle: null, title: "Không sheet" }),
        assignment({ id: "a3", kind: "ENSEMBLE" }),
      ]),
      overviewClass("c2", "TRD302", [assignment({ id: "a2", classId: "c2", kind: "ENSEMBLE", practiceCount: 2 })]),
    ];
    const stats: SheetStat[] = [{ sheetMusicId: "sh1", practicedStudents: 3, memberCount: 40, practiceCount: 12 }];
    const groups = groupBySheet(classes, stats);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({
      sheetMusicId: "sh1",
      sheetTitle: "Lý ngựa ô",
      classNames: ["TRD301", "TRD302"],
      kinds: ["SOLO", "ENSEMBLE"],
      practicedStudents: 3,
      memberCount: 40,
      practiceCount: 12,
    });
    expect(groups[0].assignments.map((item) => item.id)).toEqual(["a1", "a3", "a2"]);
  });

  it("defaults to zero without a stat", () => {
    const groups = groupBySheet([overviewClass("c1", "TRD301", [assignment()])], []);
    expect(groups[0]).toMatchObject({ practicedStudents: 0, memberCount: 0, practiceCount: 0 });
  });

  it("returns no group when no assignment has a sheet", () => {
    expect(groupBySheet([overviewClass("c1", "TRD301", [assignment({ sheetMusicId: null })])], [])).toEqual([]);
  });
});

describe("groupAssignmentSources", () => {
  it("lists every class that holds the same assignment once", () => {
    const classes = [
      overviewClass("c1", "TRD301", [assignment({ id: "a1", updatedAt: "2026-10-01T00:00:00.000Z" })]),
      overviewClass("c2", "TRD302", [assignment({ id: "a2", classId: "c2", updatedAt: "2026-10-05T00:00:00.000Z" })]),
    ];
    const sources = groupAssignmentSources(classes);
    expect(sources).toHaveLength(1);
    expect(sources[0]).toMatchObject({
      representativeId: "a2",
      holderClassIds: ["c1", "c2"],
      holderClassNames: ["TRD301", "TRD302"],
    });
  });
});

describe("summarizeClass", () => {
  it("counts assignments, open ones and practice turns", () => {
    const item = overviewClass("c1", "TRD301", [
      assignment({ id: "a1", practiceCount: 4 }),
      assignment({ id: "a2", status: "CLOSED", practiceCount: 1 }),
    ]);
    expect(summarizeClass(item)).toEqual({ assignmentCount: 2, openCount: 1, practiceCount: 5 });
  });
});

describe("emptyReasonMessage", () => {
  const semester = { name: "HK1 2026-2027", startDate: "2026-09-01", endDate: "2027-01-15" };
  const today = new Date(2026, 10, 10);

  it("explains each reason", () => {
    expect(emptyReasonMessage("NO_SEMESTER_CONFIGURED", { semester: null, today })).toBe(
      "Chưa có học kỳ nào được cấu hình. Vui lòng liên hệ quản trị viên."
    );
    expect(emptyReasonMessage("NO_CURRENT_SEMESTER", { semester: null, today })).toBe(
      "Hôm nay (10/11/2026) không nằm trong học kỳ nào đã cấu hình."
    );
    expect(emptyReasonMessage("NO_CLASSES_IN_SEMESTER", { semester, today })).toBe(
      "Bạn chưa có lớp nào trong học kỳ HK1 2026-2027."
    );
  });
});
