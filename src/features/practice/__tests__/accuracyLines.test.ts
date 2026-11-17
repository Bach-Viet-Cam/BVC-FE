import { describe, expect, it } from "vitest";
import type { StudentStatsAssignment, StudentStatsAttempt } from "@/features/practice/types/studentStatsTypes";
import { SERIES_COLORS, baseAccuracyView, buildAccuracySeries } from "@/features/practice/utils/accuracyLines";

function attempt(attemptNo: number, accuracy: number | null): StudentStatsAttempt {
  return {
    submissionId: `s${attemptNo}`,
    attemptNo,
    submittedAt: `2026-11-0${attemptNo}T00:00:00.000Z`,
    status: accuracy === null ? "FAILED" : "COMPLETED",
    accuracy,
    hasComment: false,
  };
}

function assignment(id: string, attempts: StudentStatsAttempt[]): StudentStatsAssignment {
  return { id, title: `Bài ${id}`, kind: "SOLO", bestAccuracy: null, attemptCount: attempts.length, attempts };
}

describe("buildAccuracySeries", () => {
  it("skips attempts without accuracy", () => {
    const [series] = buildAccuracySeries([assignment("a1", [attempt(1, 70), attempt(2, null), attempt(3, 85)])]);
    expect(series.points.map((point) => point.attemptNo)).toEqual([1, 3]);
  });

  it("drops assignments without scores", () => {
    const series = buildAccuracySeries([assignment("a1", [attempt(1, 70)]), assignment("a2", [])]);
    expect(series.map((item) => item.assignmentId)).toEqual(["a1"]);
  });

  it("keeps each assignment's color tied to its position, not to the surviving series", () => {
    const series = buildAccuracySeries([assignment("a1", []), assignment("a2", [attempt(1, 50)])]);
    expect(series[0].color).toBe(SERIES_COLORS[1]);
  });
});

describe("baseAccuracyView", () => {
  it("spans every attempt and floors the lowest score", () => {
    const series = buildAccuracySeries([
      assignment("a1", [attempt(1, 63), attempt(2, 90)]),
      assignment("a2", [attempt(1, 70), attempt(2, 71), attempt(3, 72), attempt(4, 73), attempt(5, 74), attempt(6, 75)]),
    ]);
    expect(baseAccuracyView(series)).toEqual({ t0: 0.5, t1: 6.5, m0: 50, m1: 100 });
  });

  it("never starts the axis above 50 and never below 0", () => {
    expect(baseAccuracyView(buildAccuracySeries([assignment("a1", [attempt(1, 85)])])).m0).toBe(50);
    expect(baseAccuracyView(buildAccuracySeries([assignment("a1", [attempt(1, 25)])])).m0).toBe(10);
    expect(baseAccuracyView(buildAccuracySeries([assignment("a1", [attempt(1, 3)])])).m0).toBe(0);
  });
});
