import { describe, expect, it } from "vitest";
import {
  buildAttemptProcessingPath,
  buildAttemptResultPath,
  buildSegmentRecordPath,
  formatScoreDelta,
  parseAttemptId,
  parseSegmentQuery,
} from "@/features/practice/utils/segmentFormat";

describe("parseSegmentQuery", () => {
  it("parse query hợp lệ", () => {
    expect(parseSegmentQuery(new URLSearchParams("of=sub-1&start=12.4&end=27.9&countIn=1"))).toEqual({
      of: "sub-1",
      start: 12.4,
      end: 27.9,
      countIn: true,
    });
  });

  it("countIn=0 hoặc thiếu là không đếm nhịp", () => {
    expect(parseSegmentQuery(new URLSearchParams("of=a&start=1&end=2&countIn=0"))?.countIn).toBe(false);
    expect(parseSegmentQuery(new URLSearchParams("of=a&start=1&end=2"))?.countIn).toBe(false);
  });

  it.each([
    "",
    "start=1&end=2",
    "of=&start=1&end=2",
    "of=a&start=5",
    "of=a&start=5&end=5",
    "of=a&start=a&end=3",
    "of=a&start=-1&end=3",
    "of=a&start=&end=3",
    "of=a&start=9&end=3",
  ])("query %s không hợp lệ", (query) => {
    expect(parseSegmentQuery(new URLSearchParams(query))).toBeNull();
  });
});

describe("buildSegmentRecordPath", () => {
  it("trỏ về màn Ghi âm của bản nhạc, làm tròn 2 chữ số và mã hoá id", () => {
    expect(buildSegmentRecordPath("sheet/1", "sub 1", { start: 12.3456, end: 27.9, countIn: false })).toBe(
      "/practice/sheets/sheet%2F1/record?of=sub%201&start=12.35&end=27.9&countIn=0",
    );
  });

  it("build rồi parse giữ nguyên đoạn", () => {
    const segment = { start: 12.4, end: 27.9, countIn: true };
    const query = buildSegmentRecordPath("s1", "sub-1", segment).split("?")[1];
    expect(parseSegmentQuery(new URLSearchParams(query))).toEqual({ of: "sub-1", ...segment });
  });
});

describe("buildAttemptProcessingPath / buildAttemptResultPath", () => {
  it("dùng lại URL của màn Chờ và Kết quả, thêm attempt", () => {
    expect(buildAttemptProcessingPath("sub 1", "att/1")).toBe("/practice/submissions/sub%201/processing?attempt=att%2F1");
    expect(buildAttemptResultPath("sub 1", "att/1")).toBe("/practice/submissions/sub%201?attempt=att%2F1");
  });
});

describe("parseAttemptId", () => {
  it("đọc attempt, rỗng hoặc thiếu là null", () => {
    expect(parseAttemptId(new URLSearchParams("attempt=abc"))).toBe("abc");
    expect(parseAttemptId(new URLSearchParams("attempt="))).toBeNull();
    expect(parseAttemptId(new URLSearchParams(""))).toBeNull();
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
