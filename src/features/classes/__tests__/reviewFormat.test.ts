import { describe, expect, it } from "vitest";
import { type AssignmentStudent } from "@/features/classes/types/teacherAssignmentTypes";
import { buildReviewQueue, formatQueueScore, formatQueueSubtitle } from "@/features/classes/utils/reviewFormat";

const student = (overrides: Partial<AssignmentStudent>): AssignmentStudent => ({
  studentId: "s",
  fullName: "Sinh viên",
  studentCode: null,
  status: "SUBMITTED",
  submissionCount: 1,
  lastSubmittedAt: "2026-10-16T02:30:00.000Z",
  bestAccuracy: 80,
  ...overrides,
});

describe("reviewFormat", () => {
  it("queues only students who submitted, newest submission first", () => {
    const queue = buildReviewQueue([
      student({ studentId: "old", lastSubmittedAt: "2026-10-15T02:30:00.000Z" }),
      student({ studentId: "none", submissionCount: 0, lastSubmittedAt: null, status: "NOT_SUBMITTED" }),
      student({ studentId: "new", lastSubmittedAt: "2026-10-17T02:30:00.000Z" }),
    ]);
    expect(queue.map((item) => item.studentId)).toEqual(["new", "old"]);
  });

  it("shows the attempt count with the last submission time, and the best score", () => {
    expect(formatQueueSubtitle(student({ submissionCount: 3 }))).toBe("3 lần nộp · 16/10 09:30");
    expect(formatQueueScore(student({ bestAccuracy: 88.5 }))).toBe("88.5%");
    expect(formatQueueScore(student({ bestAccuracy: null }))).toBe("-");
  });
});
