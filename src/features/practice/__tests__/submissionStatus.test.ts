import { describe, expect, it } from "vitest";
import type { PracticeSubmission } from "@/features/practice/types/practiceSubmissionTypes";
import { isSlowUpload } from "@/features/practice/utils/networkQuality";
import {
  isFinalStatus,
  isRetryExhausted,
  secondsUntil,
  toStageIndex,
  toStatusLabel,
} from "@/features/practice/utils/submissionStatus";

function submission(overrides: Partial<PracticeSubmission> = {}): PracticeSubmission {
  return {
    id: "sub-1",
    pieceId: "piece-1",
    sheetMusicId: "sheet-1",
    assignmentId: null,
    status: "PROCESSING",
    stage: "QUALITY_CHECK",
    stageStartedAt: null,
    retryCount: 0,
    maxRetries: 3,
    retryAvailableAt: null,
    isFileDeleted: false,
    rejectReason: null,
    errorMessage: null,
    analyzedAt: null,
    submittedAt: "2026-10-22T10:00:00.000Z",
    ...overrides,
  };
}

describe("submissionStatus", () => {
  it("đổi trạng thái BE sang nhãn hiển thị", () => {
    expect(toStatusLabel("PROCESSING")).toBe("Đang xử lý");
    expect(toStatusLabel("COMPLETED")).toBe("Hoàn tất");
    expect(toStatusLabel("REJECTED")).toBe("Từ chối");
    expect(toStatusLabel("FAILED")).toBe("Lỗi xử lý");
  });

  it("đặt vị trí bước theo stage, hoàn tất thì xong cả bốn bước", () => {
    expect(toStageIndex(submission())).toBe(0);
    expect(toStageIndex(submission({ stage: "COMPARISON" }))).toBe(2);
    expect(toStageIndex(submission({ stage: "FEEDBACK", status: "FAILED" }))).toBe(3);
    expect(toStageIndex(submission({ stage: null }))).toBe(0);
    expect(toStageIndex(submission({ status: "COMPLETED", stage: "FEEDBACK" }))).toBe(4);
  });

  it("chỉ Đang xử lý là chưa kết thúc", () => {
    expect(isFinalStatus("PROCESSING")).toBe(false);
    expect(isFinalStatus("FAILED")).toBe(true);
  });

  it("hết lượt thử lại khi đã thử 3 lần hoặc file đã bị xóa", () => {
    expect(isRetryExhausted(submission({ status: "FAILED", retryCount: 2 }))).toBe(false);
    expect(isRetryExhausted(submission({ status: "FAILED", retryCount: 3 }))).toBe(true);
    expect(isRetryExhausted(submission({ status: "FAILED", isFileDeleted: true }))).toBe(true);
    expect(isRetryExhausted(submission({ status: "PROCESSING", retryCount: 3 }))).toBe(false);
  });

  it("đếm ngược số giây tới lúc được thử lại", () => {
    const now = Date.parse("2026-10-22T10:00:00.000Z");
    expect(secondsUntil("2026-10-22T10:00:04.200Z", now)).toBe(5);
    expect(secondsUntil("2026-10-22T09:59:59.000Z", now)).toBe(0);
    expect(secondsUntil(null, now)).toBe(0);
  });
});

describe("networkQuality", () => {
  it("coi là mạng yếu khi tốc độ tải lên thấp sau vài giây đầu", () => {
    const tenMb = 10 * 1024 * 1024;
    expect(isSlowUpload(tenMb, 1, 1000)).toBe(false); // còn trong thời gian chờ
    expect(isSlowUpload(tenMb, 1, 10_000)).toBe(true); // khoảng 10 KB/s
    expect(isSlowUpload(tenMb, 50, 10_000)).toBe(false);
    expect(isSlowUpload(tenMb, 100, 60_000)).toBe(false);
  });
});
