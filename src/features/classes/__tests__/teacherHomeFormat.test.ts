import { describe, expect, it } from "vitest";
import {
  buildHomeTasks,
  countAttention,
  formatWeekLabel,
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
  it("counts students at risk or behind across classes", () => {
    expect(countAttention([CLASS_A, CLASS_B])).toBe(5);
    expect(countAttention([])).toBe(0);
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
