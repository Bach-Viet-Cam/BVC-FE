import { describe, expect, it } from "vitest";
import { PROGRESS_STATUS_LABELS, formatProgressSummary, sortProgressStudents } from "@/features/classes/utils/progressFormat";
import { type ProgressStudent } from "@/features/classes/types/progressTypes";

const student = (overrides: Partial<ProgressStudent>): ProgressStudent => ({
  studentId: "s",
  fullName: "A",
  studentCode: "SE0",
  average: null,
  status: null,
  assignmentsWithSubmissions: 0,
  lastSubmittedAt: null,
  ...overrides,
});

describe("progressFormat", () => {
  it("labels statuses", () => {
    expect(PROGRESS_STATUS_LABELS).toEqual({ ON_TRACK: "Đúng tiến độ", AT_RISK: "Có nguy cơ", BEHIND: "Chậm tiến độ" });
  });

  it("summarizes a row", () => {
    expect(formatProgressSummary(student({ average: 72.5, assignmentsWithSubmissions: 3, lastSubmittedAt: "2026-10-16T02:30:00.000Z" }))).toBe(
      "TB 72.5% · 3 bài · gần nhất 16/10 09:30",
    );
    expect(formatProgressSummary(student({}))).toBe("Chưa có bài nộp được phân tích");
  });

  it("sorts with null values last in both directions", () => {
    const rows = [
      student({ studentId: "a", fullName: "Bình", average: 50 }),
      student({ studentId: "b", fullName: "An", average: null }),
      student({ studentId: "c", fullName: "Cường", average: 90 }),
    ];
    expect(sortProgressStudents(rows, "average", "desc").map((row) => row.studentId)).toEqual(["c", "a", "b"]);
    expect(sortProgressStudents(rows, "average", "asc").map((row) => row.studentId)).toEqual(["a", "c", "b"]);
    expect(sortProgressStudents(rows, "name", "asc").map((row) => row.fullName)).toEqual(["An", "Bình", "Cường"]);
  });
});
