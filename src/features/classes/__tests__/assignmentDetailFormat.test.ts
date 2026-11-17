import { describe, expect, it } from "vitest";
import { formatPageCount, sheetGroupMeta } from "@/features/classes/utils/assignmentDetailFormat";

describe("sheetGroupMeta", () => {
  it("counts every copy for kinds and assignments, but only non-draft copies for classes", () => {
    expect(
      sheetGroupMeta([
        { status: "PUBLISHED", kind: "SOLO", classId: "c1" },
        { status: "DRAFT", kind: "ENSEMBLE", classId: "c2" },
      ])
    ).toBe("Độc tấu, Hòa tấu · 2 bài tập · 1 lớp");
  });

  it("shows 0 lớp for an all-draft group", () => {
    expect(sheetGroupMeta([{ status: "DRAFT", kind: "SOLO", classId: "c1" }])).toBe("Độc tấu · 1 bài tập · 0 lớp");
  });
});

describe("formatPageCount", () => {
  it("formats pages in Vietnamese", () => {
    expect(formatPageCount(3)).toBe("3 trang");
  });
});
