import { afterEach, describe, expect, it, vi } from "vitest";
import { lastClassStorage } from "@/features/classes/utils/lastClassStorage";

describe("lastClassStorage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("remembers the last opened class per lecturer", () => {
    lastClassStorage.remember("u1", "c1");
    lastClassStorage.remember("u2", "c2");
    expect(lastClassStorage.read("u1")).toBe("c1");
    expect(lastClassStorage.read("u3")).toBeNull();
  });

  it("returns null when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(lastClassStorage.read("u1")).toBeNull();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => lastClassStorage.remember("u1", "c1")).not.toThrow();
  });
});
