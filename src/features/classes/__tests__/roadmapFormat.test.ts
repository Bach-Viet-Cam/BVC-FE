import { describe, expect, it } from "vitest";
import { WEEK_STATUS_LABELS, buildExerciseRows, formatWeekRange } from "@/features/classes/utils/roadmapFormat";

describe("roadmapFormat", () => {
  it("labels week statuses in Vietnamese", () => {
    expect(WEEK_STATUS_LABELS).toEqual({ PAST: "Đã qua", CURRENT: "Tuần này", UPCOMING: "Sắp tới" });
  });

  it("lists one row per week exercise in week order, keeping the week status", () => {
    const week = (weekNumber: number, status: "PAST" | "CURRENT", titles: string[]) => ({
      weekNumber,
      title: `Tuần ${weekNumber}`,
      content: "",
      startDate: "2026-09-01",
      endDate: "2026-09-07",
      status,
      exercises: titles.map((title, index) => ({ pieceId: `p${weekNumber}${index}`, title, isAvailable: index === 0 })),
    });
    expect(
      buildExerciseRows([week(1, "PAST", ["Gẩy đơn", "Vê"]), week(2, "CURRENT", []), week(3, "CURRENT", ["Láy"])])
    ).toEqual([
      { key: "1-p10", weekNumber: 1, title: "Gẩy đơn", isAvailable: true, status: "PAST" },
      { key: "1-p11", weekNumber: 1, title: "Vê", isAvailable: false, status: "PAST" },
      { key: "3-p30", weekNumber: 3, title: "Láy", isAvailable: true, status: "CURRENT" },
    ]);
  });

  it("formats a week window as dd/mm – dd/mm/yyyy", () => {
    expect(formatWeekRange({ startDate: "2026-12-29", endDate: "2027-01-04" })).toBe("29/12 – 04/01/2027");
  });
});
