import { describe, expect, it } from "vitest";
import { WEEK_STATUS_LABELS, formatWeekRange } from "@/features/classes/utils/roadmapFormat";

describe("roadmapFormat", () => {
  it("labels week statuses in Vietnamese", () => {
    expect(WEEK_STATUS_LABELS).toEqual({ PAST: "Đã qua", CURRENT: "Tuần này", UPCOMING: "Sắp tới" });
  });

  it("formats a week window as dd/mm – dd/mm/yyyy", () => {
    expect(formatWeekRange({ startDate: "2026-12-29", endDate: "2027-01-04" })).toBe("29/12 – 04/01/2027");
  });
});
