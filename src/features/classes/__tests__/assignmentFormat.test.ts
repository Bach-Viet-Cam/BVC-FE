import { describe, expect, it } from "vitest";
import {
  ASSIGNMENT_KIND_LABELS,
  ASSIGNMENT_STATUS_LABELS,
  STUDENT_STATUS_LABELS,
  SUBMISSION_STATUS_LABELS,
  formatVietnamDateTime,
  formatStudentSummary,
} from "@/features/classes/utils/teacherAssignmentFormat";

describe("assignmentFormat", () => {
  it("has Vietnamese labels", () => {
    expect(ASSIGNMENT_KIND_LABELS).toEqual({
      SOLO: "Độc tấu",
      ENSEMBLE: "Hòa tấu",
      BONUS: "Bonus",
      OTHER: "Bài tập khác",
    });
    expect(ASSIGNMENT_STATUS_LABELS).toEqual({ DRAFT: "Nháp", PUBLISHED: "Đã đăng", CLOSED: "Đã đóng" });
    expect(STUDENT_STATUS_LABELS).toEqual({ NOT_SUBMITTED: "Chưa nộp", SUBMITTED: "Đã nộp", PASSED: "Đạt" });
    expect(SUBMISSION_STATUS_LABELS).toEqual({
      PROCESSING: "Đang xử lý",
      COMPLETED: "Hoàn tất",
      REJECTED: "Từ chối",
      FAILED: "Lỗi xử lý",
    });
  });

  it("formats times in Asia/Ho_Chi_Minh", () => {
    expect(formatVietnamDateTime("2026-10-16T02:30:00.000Z")).toBe("16/10/2026 09:30");
    expect(formatVietnamDateTime("2026-10-15T17:05:00.000Z", false)).toBe("16/10 00:05");
  });

  it("summarizes a student's submissions", () => {
    expect(
      formatStudentSummary({ submissionCount: 4, lastSubmittedAt: "2026-10-16T02:30:00.000Z", bestAccuracy: 82 })
    ).toBe("4 lần nộp · gần nhất 16/10 09:30 · cao nhất 82%");
    expect(
      formatStudentSummary({ submissionCount: 1, lastSubmittedAt: "2026-10-16T02:30:00.000Z", bestAccuracy: null })
    ).toBe("1 lần nộp · gần nhất 16/10 09:30");
    expect(formatStudentSummary({ submissionCount: 0, lastSubmittedAt: null, bestAccuracy: null })).toBe(
      "Chưa có lần nộp"
    );
    // 69.6 must not be shown as 70% next to the status "Đã nộp" (threshold 70).
    expect(
      formatStudentSummary({ submissionCount: 1, lastSubmittedAt: "2026-10-16T02:30:00.000Z", bestAccuracy: 69.6 })
    ).toBe("1 lần nộp · gần nhất 16/10 09:30 · cao nhất 69.6%");
  });

  it("handles student assignment type labels and deadline urgency", async () => {
    const { ASSIGNMENT_TYPE_LABELS, getDeadlineUrgency, describeTimeLeft } = await import(
      "@/features/classes/utils/assignmentFormat"
    );
    expect(ASSIGNMENT_TYPE_LABELS.PRACTICE).toBe("Luyện ngón");
    expect(ASSIGNMENT_TYPE_LABELS.RHYTHM).toBe("Luyện rhythm");
    expect(ASSIGNMENT_TYPE_LABELS.RECORDING).toBe("Thu âm");
    expect(ASSIGNMENT_TYPE_LABELS.BONUS).toBe("Bonus");

    const now = new Date("2026-10-23T04:00:00.000Z");
    expect(getDeadlineUrgency("2026-10-20T00:00:00.000Z", now)).toBe("overdue");
    expect(getDeadlineUrgency("2026-10-25T00:00:00.000Z", now)).toBe("urgent");
    expect(getDeadlineUrgency("2026-11-05T00:00:00.000Z", now)).toBe("normal");

    expect(describeTimeLeft("2026-10-20T00:00:00.000Z", now)).toBe("Đã quá hạn");
    expect(describeTimeLeft("2026-10-25T00:00:00.000Z", now)).toBe("còn 1 ngày");
  });
});
