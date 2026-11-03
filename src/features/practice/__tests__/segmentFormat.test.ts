import { describe, expect, it } from "vitest";
import { buildSegmentPath, formatScoreDelta, parseSegmentQuery } from "@/features/practice/utils/segmentFormat";

describe("parseSegmentQuery", () => {
  it("parse query hợp lệ", () => {
    expect(parseSegmentQuery(new URLSearchParams("start=12.4&end=27.9&countIn=1"))).toEqual({
      start: 12.4,
      end: 27.9,
      countIn: true,
      attemptId: null,
    });
  });

  it("đọc attemptId và countIn=0", () => {
    expect(parseSegmentQuery(new URLSearchParams("start=1&end=2&countIn=0&attemptId=abc"))).toEqual({
      start: 1,
      end: 2,
      countIn: false,
      attemptId: "abc",
    });
  });

  it.each(["", "start=5", "start=5&end=5", "start=a&end=3", "start=-1&end=3", "start=&end=3", "start=9&end=3"])(
    "query %s không hợp lệ",
    (query) => {
      expect(parseSegmentQuery(new URLSearchParams(query))).toBeNull();
    },
  );
});

describe("buildSegmentPath", () => {
  it("làm tròn 2 chữ số và mã hoá id", () => {
    expect(buildSegmentPath("sub 1", { start: 12.3456, end: 27.9, countIn: false })).toBe(
      "/practice/submissions/sub%201/segment?start=12.35&end=27.9&countIn=0",
    );
  });

  it("build rồi parse giữ nguyên đoạn", () => {
    const segment = { start: 12.4, end: 27.9, countIn: true };
    const query = buildSegmentPath("sub-1", segment).split("?")[1];
    expect(parseSegmentQuery(new URLSearchParams(query))).toMatchObject(segment);
  });
});

describe("formatScoreDelta", () => {
  it("định dạng chênh lệch", () => {
    expect(formatScoreDelta(62, 81)).toBe("+19");
    expect(formatScoreDelta(80, 76)).toBe("−4");
    expect(formatScoreDelta(70, 70)).toBe("0");
    expect(formatScoreDelta(null, 81)).toBeNull();
    expect(formatScoreDelta(62, null)).toBeNull();
  });
});
