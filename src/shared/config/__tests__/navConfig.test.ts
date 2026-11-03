import { describe, expect, it } from "vitest";
import { NAV_BY_ROLE, flattenNav } from "@/shared/config/navConfig";
import { ROLES } from "@/shared/constants/roles";

describe("navConfig (Admin)", () => {
  it("includes Cấu hình nhạc cụ and removes old Lộ trình học tập and Cấu hình chấm điểm", () => {
    const adminNav = NAV_BY_ROLE[ROLES.SYSTEM_ADMIN];
    const items = flattenNav(adminNav);

    const labels = items.map((i) => i.label);
    expect(labels).toContain("Cấu hình nhạc cụ");
    expect(labels).not.toContain("Lộ trình học tập");
    expect(labels).not.toContain("Cấu hình chấm điểm");

    const instrumentNav = items.find((i) => i.label === "Cấu hình nhạc cụ");
    expect(instrumentNav).toBeDefined();
    expect(instrumentNav?.to).toBe("/admin/instruments");
    expect(instrumentNav?.activePrefixes).toContain("/admin/roadmaps");

    const configIndex = labels.indexOf("Cấu hình hệ thống");
    const instrumentIndex = labels.indexOf("Cấu hình nhạc cụ");
    expect(instrumentIndex).toBe(configIndex + 1);
  });
});
