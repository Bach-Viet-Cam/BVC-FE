import { describe, expect, it } from "vitest";
import {
  formatNotificationTimestamp,
  isSentToday,
  toMyNotificationParams,
} from "@/features/platform/utils/myNotificationFormat";

// 21/10/2026 08:00 giờ Việt Nam
const now = new Date("2026-10-21T01:00:00.000Z");

describe("myNotificationFormat", () => {
  it("maps chips to API params", () => {
    expect(toMyNotificationParams("all", 1)).toEqual({ page: 1, pageSize: 20 });
    expect(toMyNotificationParams("unread", 2)).toEqual({ page: 2, pageSize: 20, unreadOnly: true });
    expect(toMyNotificationParams("BONUS", 1)).toEqual({ page: 1, pageSize: 20, type: "BONUS" });
  });

  it("decides 'today' in Vietnam time, not UTC", () => {
    expect(isSentToday("2026-10-20T17:30:00.000Z", now)).toBe(true); // 00:30 ngày 21 giờ VN
    expect(isSentToday("2026-10-20T16:30:00.000Z", now)).toBe(false); // 23:30 ngày 20 giờ VN
  });

  it("shows time for today and date otherwise", () => {
    expect(formatNotificationTimestamp("2026-10-20T17:30:00.000Z", now)).toBe("00:30");
    expect(formatNotificationTimestamp("2026-10-19T03:00:00.000Z", now)).toBe("19/10");
  });
});
