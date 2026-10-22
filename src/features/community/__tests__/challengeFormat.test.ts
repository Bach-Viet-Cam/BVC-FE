import { describe, expect, it } from "vitest";
import { formatWeekRange } from "@/features/community/utils/challengeFormat";

describe("formatWeekRange", () => {
  it("formats the year-boundary week", () => {
    expect(formatWeekRange("2026-12-27T17:00:00.000Z", "2027-01-03T16:59:59.999Z")).toBe("28/12 - 03/01/2027");
  });

  it("formats a week inside one month", () => {
    expect(formatWeekRange("2026-10-18T17:00:00.000Z", "2026-10-25T16:59:59.999Z")).toBe("19/10 - 25/10/2026");
  });

  it("shows the Monday when the stored start is mid-week", () => {
    expect(formatWeekRange("2026-10-22T05:00:00.000Z", "2026-10-25T16:59:59.999Z")).toBe("19/10 - 25/10/2026");
  });
});
