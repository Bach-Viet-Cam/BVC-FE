import { describe, expect, it } from "vitest";
import type { CompareSegment, SubmissionCompare } from "@/features/practice/types/submissionHistoryTypes";
import {
  formatLabelChange,
  formatSegmentRange,
  toCompareChartPaths,
  toSegmentBands,
} from "@/features/practice/utils/submissionCompare";

const segment = (overrides: Partial<CompareSegment>): CompareSegment => ({
  id: "pitch-2-REPEATED",
  kind: "pitch",
  status: "REPEATED",
  startSec: 2,
  endSec: 4,
  olderLabel: null,
  newerLabel: null,
  ...overrides,
});

describe("formatSegmentRange", () => {
  it("định dạng phút:giây, làm tròn xuống giây", () => {
    expect(formatSegmentRange(12, 18.4)).toBe("0:12 – 0:18");
    expect(formatSegmentRange(65, 70)).toBe("1:05 – 1:10");
  });
});

describe("formatLabelChange", () => {
  it("hai nhãn thì nối bằng mũi tên, một nhãn thì giữ nhãn đó, không có thì null", () => {
    expect(formatLabelChange("Lệch +35¢", "Lệch +20¢")).toBe("Lệch +35¢ → Lệch +20¢");
    expect(formatLabelChange("Thiếu nốt", null)).toBe("Thiếu nốt");
    expect(formatLabelChange(null, "Thiếu nốt")).toBe("Thiếu nốt");
    expect(formatLabelChange(null, null)).toBeNull();
  });
});

describe("toCompareChartPaths", () => {
  const chart: SubmissionCompare["chart"] = {
    durationSec: 1,
    minHz: 200,
    maxHz: 300,
    points: [
      [0, 220, null, 221],
      [0.5, 230, null, 229],
      [1, 240, null, 239],
    ],
  };

  it("đường học sinh toàn null thì không vẽ, các đường còn lại vẫn có", () => {
    const paths = toCompareChartPaths(chart, (seconds) => seconds * 100, (hz) => 300 - hz);
    expect(paths.older).toBe("");
    expect(paths.teacher).not.toBe("");
    expect(paths.newer).not.toBe("");
  });
});

describe("toSegmentBands", () => {
  it("đổi đoạn sang vị trí và độ rộng, bỏ đoạn NEW", () => {
    const bands = toSegmentBands(
      [
        segment({}),
        segment({ id: "pitch-6-IMPROVED", status: "IMPROVED", startSec: 6, endSec: 7 }),
        segment({ id: "pitch-9-NEW", status: "NEW", startSec: 9, endSec: 10 }),
      ],
      (seconds) => seconds * 10
    );
    expect(bands).toEqual([
      { id: "pitch-2-REPEATED", status: "REPEATED", x: 20, width: 20 },
      { id: "pitch-6-IMPROVED", status: "IMPROVED", x: 60, width: 10 },
    ]);
  });
});
