import { describe, expect, it, beforeEach } from "vitest";
import { ROLES } from "@/shared/constants/roles";
import { RETURN_TO_KEY, buildReturnTo, resolveReturnTarget, saveReturnTo } from "@/shared/utils/returnTo";

describe("returnTo", () => {
  beforeEach(() => sessionStorage.clear());

  it("giữ lại pathname, query và hash của trang khách đang xem", () => {
    expect(buildReturnTo({ pathname: "/library/s1/sheets/x", search: "?tab=2", hash: "#audio" })).toBe(
      "/library/s1/sheets/x?tab=2#audio"
    );
  });

  it("quay lại state.from thay vì trang chủ", () => {
    expect(resolveReturnTarget({ from: "/library/s1/sheets/x?tab=2#audio" }, ROLES.STUDENT)).toBe(
      "/library/s1/sheets/x?tab=2#audio"
    );
  });

  it("dùng bản lưu trong sessionStorage khi state.from mất", () => {
    saveReturnTo("/library/s1");
    expect(resolveReturnTarget(null, ROLES.STUDENT)).toBe("/library/s1");
    expect(sessionStorage.getItem(RETURN_TO_KEY)).toBeNull();
  });

  it.each(["//evil.com", "/\\evil.com", "https://evil.com", "/login", "/%2f%2fevil.com"])(
    "chặn đường dẫn không an toàn %s",
    (target) => {
      expect(resolveReturnTarget({ from: target }, ROLES.STUDENT)).toBe("/home");
    }
  );

  it("không đưa học sinh vào trang giảng viên", () => {
    expect(resolveReturnTarget({ from: "/songs/s1/sheets" }, ROLES.STUDENT)).toBe("/home");
  });
});
