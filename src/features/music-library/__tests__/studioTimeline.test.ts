import { describe, expect, it } from "vitest";
import {
  buildRulerTicks,
  buildWavePath,
  levelToBar,
  pickRulerLabels,
  pickTimelineSpan,
  resamplePeaks,
  shortInstrumentName,
} from "@/features/music-library/utils/studioTimeline";

describe("pickTimelineSpan", () => {
  it("làm tròn lên bội số 15 giây và có mức tối thiểu 30 giây", () => {
    expect(pickTimelineSpan(0, 180)).toBe(30);
    expect(pickTimelineSpan(46, 180)).toBe(60);
    expect(pickTimelineSpan(60, 180)).toBe(60);
  });

  it("không vượt giới hạn thu", () => {
    expect(pickTimelineSpan(400, 180)).toBe(180);
  });
});

describe("buildRulerTicks", () => {
  it("đánh dấu mốc lớn mỗi 10 giây khi thước ngắn", () => {
    const majors = buildRulerTicks(60).filter((tick) => tick.major).map((tick) => tick.sec);
    expect(majors).toEqual([0, 10, 20, 30, 40, 50, 60]);
  });

  it("thưa vạch khi thước dài", () => {
    const ticks = buildRulerTicks(180);
    expect(ticks.length).toBe(37);
    expect(ticks.filter((tick) => tick.major).map((tick) => tick.sec)).toEqual([0, 30, 60, 90, 120, 150, 180]);
  });
});

describe("resamplePeaks", () => {
  it("lấy giá trị lớn nhất của mỗi nhóm khi gộp", () => {
    expect(resamplePeaks([0.1, 0.9, 0.2, 0.4], 2)).toEqual([0.9, 0.4]);
  });

  it("lặp lại giá trị khi giãn ra", () => {
    expect(resamplePeaks([0.5, 1], 4)).toEqual([0.5, 0.5, 1, 1]);
  });

  it("trả về rỗng khi không có dữ liệu", () => {
    expect(resamplePeaks([], 5)).toEqual([]);
    expect(resamplePeaks([1], 0)).toEqual([]);
  });
});

describe("buildWavePath", () => {
  it("rỗng khi chưa đủ chỗ hoặc chưa có dữ liệu", () => {
    expect(buildWavePath([1], 3, 60)).toBe("");
    expect(buildWavePath([], 100, 60)).toBe("");
  });

  it("vẽ mỗi cột một đoạn thẳng đứng", () => {
    expect(buildWavePath([1, 1], 10, 60).match(/M/g)).toHaveLength(2);
  });
});

describe("pickRulerLabels", () => {
  const ticks = buildRulerTicks(60);
  const base = { widthPx: 600, playheadSec: 5, minGapPx: 64, playheadClearPx: 36, labelWidthPx: 40 };

  it("bỏ nhãn sát đầu phát và nhãn tràn mép phải", () => {
    const labels = pickRulerLabels(ticks, { ...base, pxPerSec: 10, playheadSec: 0 });
    expect(labels).not.toContain(0);
    expect(labels).not.toContain(60);
  });

  it("thưa nhãn khi khung hẹp", () => {
    const narrow = pickRulerLabels(ticks, { ...base, pxPerSec: 3.8, widthPx: 230, playheadSec: 59 });
    expect(narrow).toEqual([0, 20, 40]);
  });
});

describe("levelToBar", () => {
  it("nâng tiếng nhỏ nhưng không vượt 1", () => {
    expect(levelToBar(0)).toBe(0);
    expect(levelToBar(0.05)).toBeGreaterThan(0.05);
    expect(levelToBar(1)).toBe(1);
  });
});

describe("shortInstrumentName", () => {
  it("bỏ tiền tố Đàn và viết hoa chữ đầu", () => {
    expect(shortInstrumentName("Đàn bầu")).toBe("Bầu");
    expect(shortInstrumentName("Sáo trúc")).toBe("Sáo trúc");
  });
});
