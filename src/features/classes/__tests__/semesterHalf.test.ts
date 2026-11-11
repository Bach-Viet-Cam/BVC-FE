import { describe, expect, it } from "vitest";
import { halfOfSemesterName, resolveSemesterForHalf, toSemesterHalf } from "@/features/classes/utils/semesterHalf";

// Same shape as the real class.semesters config: one entry per half.
const SEMESTERS = [
  { name: "SU26-H2", startDate: "2026-06-29", endDate: "2026-08-09" },
  { name: "FA26-H1", startDate: "2026-09-07", endDate: "2026-10-18" },
  { name: "FA26-H2", startDate: "2026-11-02", endDate: "2026-12-13" },
  { name: "SP27-H1", startDate: "2027-01-04", endDate: "2027-02-14" },
  { name: "SP27-H2", startDate: "2027-03-01", endDate: "2027-04-11" },
];
const byName = (name: string) => SEMESTERS.find((item) => item.name === name);

describe("halfOfSemesterName", () => {
  it("reads the half from the entry name", () => {
    expect(halfOfSemesterName("FA26-H1")).toBe(1);
    expect(halfOfSemesterName("sp27-h2")).toBe(2);
    expect(halfOfSemesterName("FA26")).toBeNull();
    expect(halfOfSemesterName("FA26-H1")).toBe(1);
    expect(halfOfSemesterName("Fall2026_H2")).toBe(2);
    expect(halfOfSemesterName("Spring2027_h1")).toBe(1);
    expect(halfOfSemesterName("Fall2026H2")).toBeNull();
  });
});

describe("toSemesterHalf", () => {
  it("accepts only half 1 and 2", () => {
    expect(toSemesterHalf("1")).toBe(1);
    expect(toSemesterHalf("2")).toBe(2);
    expect(toSemesterHalf("3")).toBeNull();
    expect(toSemesterHalf(undefined)).toBeNull();
  });
});

describe("resolveSemesterForHalf", () => {
  const duringHalfTwo = "2026-11-07";
  const duringHalfOne = "2026-09-20";

  it("keeps the running half 2 for H2", () => {
    expect(resolveSemesterForHalf(SEMESTERS, 2, duringHalfTwo)).toEqual({ kind: "found", semester: byName("FA26-H2") });
  });

  it("moves H1 during half 2 to half 1 of the next semester", () => {
    expect(resolveSemesterForHalf(SEMESTERS, 1, duringHalfTwo)).toEqual({ kind: "found", semester: byName("SP27-H1") });
  });

  it("keeps the running half 1 for H1 and moves H2 to half 2 of the same semester", () => {
    expect(resolveSemesterForHalf(SEMESTERS, 1, duringHalfOne)).toEqual({ kind: "found", semester: byName("FA26-H1") });
    expect(resolveSemesterForHalf(SEMESTERS, 2, duringHalfOne)).toEqual({ kind: "found", semester: byName("FA26-H2") });
  });

  it("reports a missing half when admin has not configured the next one", () => {
    const withoutNext = SEMESTERS.filter((item) => !item.name.startsWith("SP27"));
    expect(resolveSemesterForHalf(withoutNext, 1, duringHalfTwo)).toEqual({ kind: "missing", half: 1 });
  });
});
