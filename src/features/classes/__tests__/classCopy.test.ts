import { describe, expect, it } from "vitest";
import { type ClassCopySource, type CopyAssignmentRow } from "@/features/classes/types/classTypes";
import {
  buildCopyAssignments,
  COPY_KIND_DUPLICATED,
  findKindConflicts,
  mapCopyErrors,
  toCopyRows,
} from "@/features/classes/utils/classCopy";

function row(key: string, overrides: Partial<CopyAssignmentRow> = {}): CopyAssignmentRow {
  return {
    key,
    checked: true,
    content: { title: `Bài ${key}`, description: null, kind: "OTHER", sheetMusicId: null, requiredBpm: null },
    sheetMusic: null,
    status: "DRAFT",
    error: null,
    ...overrides,
  };
}

function solo(key: string, checked = true) {
  return row(key, {
    checked,
    content: { title: `Bài ${key}`, description: null, kind: "SOLO", sheetMusicId: null, requiredBpm: null },
  });
}

describe("toCopyRows", () => {
  it("checks every row and maps CLOSED to PUBLISHED", () => {
    const source: ClassCopySource = {
      id: "c1",
      name: "TRD301",
      cohort: "K1",
      description: null,
      instrument: { id: "i1", name: "Trống" },
      coLecturers: [],
      assignments: [
        {
          id: "a1",
          title: "Bài 1",
          kind: "SOLO",
          description: "mô tả",
          sheetMusic: null,
          requiredBpm: 90,
          status: "CLOSED",
        },
        {
          id: "a2",
          title: "Bài 2",
          kind: "OTHER",
          description: null,
          sheetMusic: null,
          requiredBpm: null,
          status: "DRAFT",
        },
      ],
    };
    const rows = toCopyRows(source);
    expect(rows.map((r) => r.status)).toEqual(["PUBLISHED", "DRAFT"]);
    expect(rows.every((r) => r.checked && r.error === null)).toBe(true);
    expect(rows[0].key).toBe("a1");
    expect(rows[0].content).toEqual({
      title: "Bài 1",
      description: "mô tả",
      kind: "SOLO",
      sheetMusicId: null,
      requiredBpm: 90,
    });
  });
});

describe("findKindConflicts", () => {
  it("flags both SOLO rows and clears when one is unchecked", () => {
    const rows = [solo("a"), solo("b")];
    const map = findKindConflicts(rows);
    expect([...map.keys()].sort()).toEqual(["a", "b"]);
    expect(map.get("a")).toBe(COPY_KIND_DUPLICATED("SOLO"));
    expect(COPY_KIND_DUPLICATED("SOLO")).toBe(
      "Không thể lưu bài tập vì danh sách sao chép có nhiều hơn một bài Độc tấu."
    );
    expect(COPY_KIND_DUPLICATED("ENSEMBLE")).toBe(
      "Không thể lưu bài tập vì danh sách sao chép có nhiều hơn một bài Hòa tấu."
    );
    expect(findKindConflicts([solo("a"), solo("b", false)]).size).toBe(0);
  });
});

describe("buildCopyAssignments", () => {
  it("skips unchecked rows, keeps order and edited content", () => {
    const edited = row("b", { content: { ...row("b").content, title: "Đã sửa" }, status: "PUBLISHED" });
    const result = buildCopyAssignments([row("a"), row("x", { checked: false }), edited]);
    expect(result.map((r) => r.title)).toEqual(["Bài a", "Đã sửa"]);
    expect(result[1].status).toBe("PUBLISHED");
  });
});

describe("mapCopyErrors", () => {
  it("maps assignments.<i> to the i-th checked row and leaves the rest", () => {
    const rows = [row("A"), row("B", { checked: false }), row("C")];
    const { rowErrors, rest } = mapCopyErrors(rows, [
      { field: "assignments.1.sheetMusicId", message: "Bản nhạc lỗi" },
      { field: "name", message: "Tên lỗi" },
    ]);
    expect(rowErrors.get("C")).toBe("Bản nhạc lỗi");
    expect(rowErrors.size).toBe(1);
    expect(rest).toEqual([{ field: "name", message: "Tên lỗi" }]);
  });
});
