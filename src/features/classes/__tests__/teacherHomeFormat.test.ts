import { describe, expect, it } from "vitest";
import {
  buildHomeTasks,
  countTodaySubmitters,
  formatWeekLabel,
  rankAttentionStudents,
  type HomeClass,
} from "@/features/classes/utils/teacherHomeFormat";

const CLASS_A: HomeClass = {
  id: "a",
  name: "TRD301",
  cohort: "FA26",
  memberCount: 20,
  weekLabel: "Tuần 4/6",
  onTrack: 15,
  atRisk: 3,
  behind: 2,
};
const CLASS_B: HomeClass = { ...CLASS_A, id: "b", name: "TRD401", onTrack: 10, atRisk: 0, behind: 0 };

describe("teacherHomeFormat", () => {
  it("ranks students to watch: behind first, then the lowest accuracy, without accuracy last", () => {
    const base = { username: "SV", studentCode: null, classId: "a", className: "TRD301" };
    const ranked = rankAttentionStudents([
      { ...base, userId: "ok", status: "ON_TRACK", averageAccuracy: 90 },
      { ...base, userId: "risk-60", status: "AT_RISK", averageAccuracy: 60 },
      { ...base, userId: "behind-none", status: "BEHIND", averageAccuracy: null },
      { ...base, userId: "behind-40", status: "BEHIND", averageAccuracy: 40 },
      { ...base, userId: "unknown", status: null, averageAccuracy: null },
    ]);
    expect(ranked.map((item) => item.userId)).toEqual(["behind-40", "behind-none", "risk-60"]);
  });

  it("counts the students whose last submission is today", () => {
    const now = new Date(2026, 9, 31, 15, 0);
    const students = [
      { lastSubmittedAt: new Date(2026, 9, 31, 8, 0).toISOString() },
      { lastSubmittedAt: new Date(2026, 9, 30, 23, 0).toISOString() },
      { lastSubmittedAt: null },
    ];
    expect(countTodaySubmitters(students, now)).toBe(1);
  });

  it("labels the week or says the class has not started", () => {
    expect(formatWeekLabel("4/6")).toBe("Tuần 4/6");
    expect(formatWeekLabel("-")).toBe("Chưa bắt đầu");
  });

  it("builds a task per class with students to watch, then the drafts task", () => {
    expect(buildHomeTasks([CLASS_A, CLASS_B], 2)).toEqual([
      {
        id: "class-a",
        tone: "warn",
        message: "5 sinh viên cần chú ý - TRD301",
        actionLabel: "Xem lớp",
        path: "/teacher/classes/a",
      },
      {
        id: "drafts",
        tone: "warn",
        message: "2 bài tập nháp chưa đăng",
        actionLabel: "Xem bài tập",
        path: "/teacher/assignments",
      },
    ]);
  });

  it("returns no task when nothing needs attention", () => {
    expect(buildHomeTasks([CLASS_B], 0)).toEqual([]);
  });
});
