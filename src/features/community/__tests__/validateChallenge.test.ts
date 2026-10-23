import { describe, expect, it } from "vitest";
import {
  challengeSchema,
  EMPTY_CHALLENGE_FORM,
  publishChallengeSchema,
  toCreatePayload,
  type ChallengeFormValues,
} from "@/features/community/utils/validateChallenge";

const VALID: ChallengeFormValues = {
  ...EMPTY_CHALLENGE_FORM,
  title: "  Thử thách tuần 1 ",
  instrumentId: "i1",
  pieceId: "p1",
  pieceTitle: "Lý ngựa ô",
  classIds: ["k1"],
  weekStart: "2026-10-26",
  minAccuracy: "70",
  maxSubmissions: "3",
};

function messages(result: { success: boolean; error?: { issues: Array<{ message: string }> } }): string[] {
  return result.error?.issues.map((issue) => issue.message) ?? [];
}

describe("challengeSchema (draft)", () => {
  it("rejects an empty title with MSG-35", () => {
    const result = challengeSchema.safeParse({ ...EMPTY_CHALLENGE_FORM, title: "   " });
    expect(messages(result)).toContain("Tên thử thách không được để trống.");
  });

  it("rejects a 101 character title with MSG-37", () => {
    const result = challengeSchema.safeParse({ ...EMPTY_CHALLENGE_FORM, title: "a".repeat(101) });
    expect(messages(result)).toContain("Tên thử thách không được vượt quá 100 ký tự.");
  });

  it.each(["29", "241", "1.5", "abc"])("rejects BPM %s with MSG-03", (bpm) => {
    const result = challengeSchema.safeParse({ ...VALID, requiredBpm: bpm });
    expect(messages(result)).toContain("BPM yêu cầu phải nằm trong khoảng từ 30 đến 240.");
  });

  it("accepts an empty BPM and the 30 and 240 bounds", () => {
    expect(challengeSchema.safeParse({ ...VALID, requiredBpm: "" }).success).toBe(true);
    expect(challengeSchema.safeParse({ ...VALID, requiredBpm: "30" }).success).toBe(true);
    expect(challengeSchema.safeParse({ ...VALID, requiredBpm: "240" }).success).toBe(true);
  });

  it("rejects accuracy outside 0-100 and max submissions outside 1-10", () => {
    expect(messages(challengeSchema.safeParse({ ...VALID, minAccuracy: "101" }))).toContain(
      "Độ chính xác tối thiểu phải nằm trong khoảng từ 0 đến 100."
    );
    expect(messages(challengeSchema.safeParse({ ...VALID, maxSubmissions: "0" }))).toContain(
      "Số lần nộp tối đa phải nằm trong khoảng từ 1 đến 10."
    );
    expect(messages(challengeSchema.safeParse({ ...VALID, maxSubmissions: "11" }))).toContain(
      "Số lần nộp tối đa phải nằm trong khoảng từ 1 đến 10."
    );
  });

  it("rejects a description over 2000 characters", () => {
    const result = challengeSchema.safeParse({ ...VALID, description: "x".repeat(2001) });
    expect(messages(result)).toContain("Mô tả không được vượt quá 2000 ký tự.");
  });

  it("requires only the title in draft mode", () => {
    expect(challengeSchema.safeParse({ ...EMPTY_CHALLENGE_FORM, title: "Chỉ có tên" }).success).toBe(true);
  });
});

describe("publishChallengeSchema", () => {
  it("requires instrument, piece, at least one class and a week", () => {
    const result = publishChallengeSchema.safeParse({ ...EMPTY_CHALLENGE_FORM, title: "Chỉ có tên" });
    expect(result.success).toBe(false);
    const byPath = Object.fromEntries(result.error?.issues.map((issue) => [issue.path.join("."), issue.message]) ?? []);
    expect(byPath.instrumentId).toBe("Nhạc cụ không được để trống.");
    expect(byPath.pieceId).toBe("Bài nhạc không được để trống.");
    expect(byPath.classIds).toBe("Lớp không được để trống.");
    expect(byPath.weekStart).toBe("Tuần không được để trống.");
  });

  it("accepts a complete form", () => {
    expect(publishChallengeSchema.safeParse(VALID).success).toBe(true);
  });
});

describe("toCreatePayload", () => {
  it("maps a draft with only a title to nulls and an empty class list", () => {
    expect(toCreatePayload({ ...EMPTY_CHALLENGE_FORM, title: " Tên " }, false)).toEqual({
      title: "Tên",
      description: null,
      instrumentId: null,
      pieceId: null,
      classIds: [],
      weekStart: null,
      minAccuracy: null,
      requiredBpm: null,
      maxSubmissions: 3,
      publish: false,
    });
  });

  it("maps a complete form to numbers", () => {
    expect(toCreatePayload({ ...VALID, requiredBpm: "90", description: " Mô tả " }, true)).toEqual({
      title: "Thử thách tuần 1",
      description: "Mô tả",
      instrumentId: "i1",
      pieceId: "p1",
      classIds: ["k1"],
      weekStart: "2026-10-26",
      minAccuracy: 70,
      requiredBpm: 90,
      maxSubmissions: 3,
      publish: true,
    });
  });
});
