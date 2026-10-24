import { describe, expect, it } from "vitest";
import type { PitchPoint, ResultHistory, ResultIssue } from "@/features/practice/types/practiceResultTypes";
import {
  buildLinePath,
  dropShortRuns,
  feedbackParagraphs,
  formatAttemptTime,
  formatDurationLabel,
  growthLabel,
  issuesInRange,
  nearestPoint,
  robustHzRange,
  segmentSuggestions,
  smoothRuns,
} from "@/features/practice/utils/resultFormat";

const issue = (overrides: Partial<ResultIssue>): ResultIssue => ({
  id: "r0",
  kind: "rhythm",
  startSec: 0,
  endSec: 2,
  rhythmStatus: "fast",
  centsDifference: null,
  label: "Nhanh hơn bản mẫu",
  ...overrides,
});

const history = (overrides: Partial<ResultHistory>): ResultHistory => ({
  pieceTitle: "Lý ngựa ô",
  isFirstAttempt: false,
  deltaPercent: 8,
  bestPercent: 82,
  attempts: [],
  ...overrides,
});

const tenX = (seconds: number) => seconds * 10;
const tenthHz = (hz: number) => hz / 10;

describe("resultFormat", () => {
  it("ghi thời lượng như thiết kế", () => {
    expect(formatDurationLabel(161)).toBe("2 phút 41");
    expect(formatDurationLabel(19.8)).toBe("20 giây");
    expect(formatDurationLabel(120)).toBe("2 phút");
  });

  it("ghi giờ nộp là hôm nay, hôm qua hoặc ngày tháng", () => {
    const now = new Date(2026, 9, 24, 15, 0);
    expect(formatAttemptTime(new Date(2026, 9, 24, 14, 32).toISOString(), now)).toBe("Hôm nay 14:32");
    expect(formatAttemptTime(new Date(2026, 9, 23, 10, 15).toISOString(), now)).toBe("Hôm qua 10:15");
    expect(formatAttemptTime(new Date(2026, 9, 20, 9, 5).toISOString(), now)).toBe("20/10 09:05");
  });

  it("nhãn tăng trưởng theo chênh lệch với lần trước", () => {
    expect(growthLabel(history({}))).toBe("+8% (Tăng trưởng)");
    expect(growthLabel(history({ deltaPercent: -3.4 }))).toBe("-3% (Giảm)");
    expect(growthLabel(history({ deltaPercent: 0 }))).toBe("Không đổi");
    expect(growthLabel(history({ isFirstAttempt: true, deltaPercent: null }))).toBe("Lần đầu tiên");
  });

  it("tách nhận xét AI thành đoạn 2 câu, in đậm mốc thời gian, không cắt ở số thập phân", () => {
    const text =
      "Chào em, cao độ rất tốt! Tuy nhiên em đánh vội ở đoạn đầu (0.0s - 4.0s). Tốc độ còn chậm. Hãy bật metronome.";
    const paragraphs = feedbackParagraphs(text);
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]).toContainEqual({ text: "(0.0s - 4.0s)", strong: true });
    expect(paragraphs[1].map((part) => part.text).join("")).toBe("Tốc độ còn chậm. Hãy bật metronome.");
  });

  it("đường cao độ cong mềm qua từng điểm và nhấc bút ở khoảng lặng", () => {
    const points: PitchPoint[] = [
      [0, 220, null],
      [1, 220, 221],
      [2, null, 222],
      [3, 330, 330],
    ];
    expect(buildLinePath(points, 1, tenX, tenthHz)).toBe("M0.0 22.0 C3.3 22.0 6.7 22.0 10.0 22.0 M30.0 33.0");
    expect(nearestPoint(points, 2.4)?.[0]).toBe(2);
  });

  it("đỉnh nằm đúng điểm dữ liệu, không vọt quá (spline đơn điệu)", () => {
    const points: PitchPoint[] = [
      [0, 100, null],
      [1, 200, null],
      [2, 100, null],
    ];
    expect(buildLinePath(points, 1, tenX, tenthHz)).toBe(
      "M0.0 10.0 C3.3 13.3 6.7 20.0 10.0 20.0 C13.3 20.0 16.7 13.3 20.0 10.0"
    );
  });

  it("làm mượt bậc chuyển nốt thành dốc, giữ nốt ngân dài, không trộn qua khoảng lặng", () => {
    const points: PitchPoint[] = Array.from({ length: 20 }, (_, index) => [
      index,
      index < 10 ? 440 : 880,
      index === 5 ? null : 440,
    ]);
    const smoothed = smoothRuns(points, 1, 2).map((point) => Math.round(point[1] ?? 0));
    expect(smoothed[0]).toBe(440);
    expect(smoothed[19]).toBe(880);
    expect(smoothed[9]).toBeGreaterThan(440);
    expect(smoothed[9]).toBeLessThan(smoothed[10]);
    expect(smoothRuns(points, 2, 2)[5][2]).toBeNull();
    expect(points[9][1]).toBe(440);
  });

  it("bỏ đoạn cao độ quá ngắn (tạp âm) khi vẽ, giữ nguyên dữ liệu gốc", () => {
    const points: PitchPoint[] = [
      [0, 233, 1],
      [1, null, 1],
      [2, 440, 1],
      [3, 440, null],
      [4, 440, 1],
    ];
    const kept = dropShortRuns(points, 1, 3);
    expect(kept.map((point) => point[1])).toEqual([null, null, 440, 440, 440]);
    expect(kept.map((point) => point[2])).toEqual([1, 1, 1, null, 1]);
    expect(points[0][1]).toBe(233);
  });

  it("trục tung bỏ điểm lạc hai đầu theo bách phân vị", () => {
    const points: PitchPoint[] = Array.from({ length: 100 }, (_, index) => [
      index,
      index === 0 ? 100 : 440,
      index === 99 ? 2000 : 440,
    ]);
    const range = robustHzRange(points, 0.02);
    expect(range && Math.round(range.minHz)).toBe(Math.round(440 / 2 ** (1 / 12)));
    expect(range && Math.round(range.maxHz)).toBe(Math.round(440 * 2 ** (1 / 12)));
    expect(robustHzRange([[0, null, null]], 0.02)).toBeNull();
  });

  it("gợi ý đoạn luyện: dồn lỗi nhiều nhất, lỗi tempo sau đó và đoạn khởi động", () => {
    const issues = [
      issue({ id: "r0", startSec: 30, endSec: 32 }),
      issue({ id: "p0", kind: "pitch", startSec: 31, endSec: 31.5, rhythmStatus: null }),
      issue({ id: "r1", startSec: 50, endSec: 52, rhythmStatus: "slow" }),
    ];
    const suggestions = segmentSuggestions(issues, 60);
    expect(suggestions.map((suggestion) => suggestion.id)).toEqual(["worst", "tempo", "warmup"]);
    expect(suggestions[0]).toMatchObject({ start: 30, end: 45 });
    expect(suggestions[1]).toMatchObject({ start: 50, end: 52 });
    expect(issuesInRange(issues, 29, 31.2).map((item) => item.id)).toEqual(["r0", "p0"]);
    expect(segmentSuggestions([], 60).map((suggestion) => suggestion.id)).toEqual(["warmup"]);
  });
});
