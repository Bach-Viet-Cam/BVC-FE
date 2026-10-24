import { describe, expect, it } from "vitest";
import {
  MIN_VIEW_SECONDS,
  MIN_VIEW_SEMITONES,
  clampView,
  formatTick,
  isZoomed,
  panView,
  zoomView,
} from "@/features/practice/utils/chartView";

const bounds = { t0: 0, t1: 30, m0: 60, m1: 80 };

describe("chartView", () => {
  it("phóng to quanh điểm neo: điểm neo giữ nguyên vị trí tương đối", () => {
    const view = zoomView(bounds, 2, { seconds: 10, midi: 70 }, bounds);
    expect(view).toEqual({ t0: 5, t1: 20, m0: 65, m1: 75 });
    expect(isZoomed(view, bounds)).toBe(true);
  });

  it("không phóng quá 1 giây / nửa cung và không thu nhỏ quá toàn bộ dữ liệu", () => {
    const deep = zoomView(bounds, 1000, { seconds: 10, midi: 70 }, bounds);
    expect(deep.t1 - deep.t0).toBeCloseTo(MIN_VIEW_SECONDS);
    expect(deep.m1 - deep.m0).toBeCloseTo(MIN_VIEW_SEMITONES);
    expect(zoomView(bounds, 0.1, { seconds: 10, midi: 70 }, bounds)).toEqual(bounds);
  });

  it("kéo di chuyển nhưng không ra ngoài dữ liệu", () => {
    const view = { t0: 5, t1: 15, m0: 65, m1: 70 };
    expect(panView(view, 3, -1, bounds)).toEqual({ t0: 8, t1: 18, m0: 64, m1: 69 });
    expect(panView(view, 100, 100, bounds)).toEqual({ t0: 20, t1: 30, m0: 75, m1: 80 });
    expect(clampView({ t0: -5, t1: 5, m0: 50, m1: 55 }, bounds)).toEqual({ t0: 0, t1: 10, m0: 60, m1: 65 });
  });

  it("mốc thời gian ghi phần mười giây khi khung hẹp", () => {
    expect(formatTick(65, 30)).toBe("01:05");
    expect(formatTick(5.96, 4)).toBe("00:06.0");
    expect(formatTick(5.44, 4)).toBe("00:05.4");
  });
});
