import { describe, expect, it } from "vitest";
import { type AssignmentListItem } from "@/features/classes/types/assignmentTypes";
import { getAssignmentBucket, groupAssignments } from "@/features/classes/utils/myAssignmentGroups";

const now = new Date("2026-11-05T10:00:00Z");
const item = (patch: Partial<AssignmentListItem>): AssignmentListItem => ({
  id: "a",
  classId: "c",
  title: "Bài",
  className: "Lớp",
  type: "RECORDING",
  deadline: "2026-11-10T10:00:00Z",
  status: "NOT_SUBMITTED",
  usedSubmissions: 0,
  maxSubmissions: 3,
  minAccuracy: 70,
  bonusPoints: null,
  ...patch,
});

describe("getAssignmentBucket", () => {
  it("bài chưa nộp còn hạn là cần làm", () => {
    expect(getAssignmentBucket(item({}), now)).toBe("todo");
  });
  it("đã nộp chưa đạt nhưng còn lượt và còn hạn vẫn là cần làm", () => {
    expect(getAssignmentBucket(item({ status: "SUBMITTED", usedSubmissions: 1 }), now)).toBe("todo");
  });
  it("đã nộp hết lượt thì không còn là cần làm", () => {
    expect(getAssignmentBucket(item({ status: "SUBMITTED", usedSubmissions: 3 }), now)).toBe("submitted");
  });
  it("đã nộp nhưng hết hạn thì không còn là cần làm", () => {
    const deadline = "2026-11-01T10:00:00Z";
    expect(getAssignmentBucket(item({ status: "SUBMITTED", usedSubmissions: 1, deadline }), now)).toBe("submitted");
  });
  it("đạt và quá hạn vào đúng nhóm", () => {
    expect(getAssignmentBucket(item({ status: "PASSED" }), now)).toBe("submitted");
    expect(getAssignmentBucket(item({ status: "OVERDUE" }), now)).toBe("overdue");
  });
});

describe("groupAssignments", () => {
  it("cần làm: hạn gần nhất trước; quá hạn: mới nhất trước", () => {
    const groups = groupAssignments(
      [
        item({ id: "xa", deadline: "2026-11-20T10:00:00Z" }),
        item({ id: "gan", deadline: "2026-11-06T10:00:00Z" }),
        item({ id: "cu", status: "OVERDUE", deadline: "2026-10-01T10:00:00Z" }),
        item({ id: "moi", status: "OVERDUE", deadline: "2026-11-01T10:00:00Z" }),
      ],
      now,
      "deadline"
    );
    expect(groups.todo.map((entry) => entry.id)).toEqual(["gan", "xa"]);
    expect(groups.overdue.map((entry) => entry.id)).toEqual(["moi", "cu"]);
  });
});

it("unlimited assignments remain actionable after three submissions", () => {
  expect(getAssignmentBucket(item({ maxSubmissions: null, usedSubmissions: 4, status: "SUBMITTED" }), now)).toBe(
    "todo"
  );
});
