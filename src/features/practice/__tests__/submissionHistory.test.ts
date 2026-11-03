import { describe, expect, it } from "vitest";
import { EMPTY_SUBMISSION_FILTER } from "@/features/practice/constants/submissionHistoryMockData";
import type { SubmissionFilter, SubmissionHistoryItem } from "@/features/practice/types/submissionHistoryTypes";
import { groupByDay, selectionBlock, toHistoryQuery } from "@/features/practice/utils/submissionHistory";

const today = new Date(2026, 9, 24, 15, 0);

function withFilter(patch: Partial<SubmissionFilter>, advanced: Partial<SubmissionFilter["advanced"]> = {}) {
  return { ...EMPTY_SUBMISSION_FILTER, ...patch, advanced: { ...EMPTY_SUBMISSION_FILTER.advanced, ...advanced } };
}

function item(id: string, submittedAt: string): SubmissionHistoryItem {
  return {
    id,
    pieceId: "piece-1",
    pieceTitle: "Lý ngựa ô",
    sheetMusicId: null,
    assignmentId: null,
    submittedAt,
    status: "COMPLETED",
    accuracy: 80,
    kind: "PRACTICE",
  };
}

describe("toHistoryQuery", () => {
  it("không lọc thì chỉ gửi trang", () => {
    expect(toHistoryQuery(EMPTY_SUBMISSION_FILTER, 2, today)).toEqual({
      pieceIds: undefined,
      fromDate: undefined,
      toDate: undefined,
      accuracyRanges: undefined,
      minAccuracy: undefined,
      maxAccuracy: undefined,
      title: undefined,
      kinds: undefined,
      page: 2,
      limit: 20,
    });
  });

  it("gửi danh sách dạng a,b và đổi accuracy sang số", () => {
    const query = toHistoryQuery(
      withFilter(
        { pieceIds: ["p1", "p2"], accuracyRanges: ["ABOVE_90", "BELOW_50"] },
        { title: "  Lý ngựa ", minAccuracy: "60", maxAccuracy: "", kinds: ["SOLO", "ENSEMBLE"] }
      ),
      1,
      today
    );
    expect(query).toMatchObject({
      pieceIds: "p1,p2",
      accuracyRanges: "ABOVE_90,BELOW_50",
      title: "Lý ngựa",
      minAccuracy: 60,
      maxAccuracy: undefined,
      kinds: "SOLO,ENSEMBLE",
    });
  });

  it("mốc ngày nhanh tính từ hôm nay", () => {
    expect(toHistoryQuery(withFilter({ datePreset: "LAST_7_DAYS" }), 1, today)).toMatchObject({
      fromDate: "2026-10-18",
      toDate: "2026-10-24",
    });
    expect(toHistoryQuery(withFilter({ datePreset: "THIS_MONTH" }), 1, today)).toMatchObject({
      fromDate: "2026-10-01",
      toDate: "2026-10-24",
    });
  });

  it("mốc nhanh và khoảng nâng cao gửi phần giao; không giao nhau thì trả null", () => {
    expect(
      toHistoryQuery(
        withFilter({ datePreset: "THIS_MONTH" }, { fromDate: "2026-09-15", toDate: "2026-10-10" }),
        1,
        today
      )
    ).toMatchObject({ fromDate: "2026-10-01", toDate: "2026-10-10" });
    expect(toHistoryQuery(withFilter({ datePreset: "TODAY" }, { toDate: "2026-10-01" }), 1, today)).toBeNull();
  });
});

describe("groupByDay", () => {
  it("gom theo ngày, giữ thứ tự mới nhất trước, gắn nhãn Hôm nay / Hôm qua", () => {
    const groups = groupByDay(
      [
        item("3", "2026-10-24T08:00:00"),
        item("2", "2026-10-24T07:00:00"),
        item("1", "2026-10-23T20:00:00"),
        item("0", "2026-10-20T20:00:00"),
      ],
      today
    );
    expect(groups.map((group) => [group.label, group.items.map((entry) => entry.id)])).toEqual([
      ["Hôm nay", ["3", "2"]],
      ["Hôm qua", ["1"]],
      ["20/10/2026", ["0"]],
    ]);
  });
});

describe("selectionBlock", () => {
  const pick = (id: string, sheetMusicId: string | null, status: SubmissionHistoryItem["status"] = "COMPLETED") => ({
    ...item(id, "2026-10-24T08:00:00Z"),
    sheetMusicId,
    status,
  });

  it("bài chưa phân tích xong thì không chọn được", () => {
    expect(selectionBlock(pick("a", "s1", "PROCESSING"), [])).toBe("NOT_COMPLETED");
  });

  it("sau bài đầu chỉ chọn được bài cùng bản nhạc", () => {
    const first = pick("a", "s1");
    expect(selectionBlock(pick("b", "s2"), [first])).toBe("DIFFERENT_SHEET");
    expect(selectionBlock(pick("c", "s1"), [first])).toBeNull();
    expect(selectionBlock(pick("d", null), [first])).toBe("DIFFERENT_SHEET");
  });

  it("đủ 2 bài thì chỉ còn hai bài đã chọn bấm được", () => {
    const chosen = [pick("a", "s1"), pick("b", "s1")];
    expect(selectionBlock(pick("c", "s1"), chosen)).toBe("FULL");
    expect(selectionBlock(chosen[0], chosen)).toBeNull();
  });
});
