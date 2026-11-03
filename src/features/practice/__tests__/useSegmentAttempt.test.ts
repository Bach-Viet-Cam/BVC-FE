import { act, renderHook } from "@testing-library/react";
import { AxiosError } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { practiceSegmentApi } from "@/features/practice/api/practiceSegmentApi";
import { PROGRESS_POLL_MS } from "@/features/practice/constants/practiceConstants";
import { useSegmentAttempt } from "@/features/practice/hooks/useSegmentAttempt";
import type { SegmentAttempt } from "@/features/practice/types/practiceSegmentTypes";

vi.mock("@/features/practice/api/practiceSegmentApi", () => ({
  practiceSegmentApi: { get: vi.fn() },
}));

const get = vi.mocked(practiceSegmentApi.get);

const attempt = (id: string, status: SegmentAttempt["status"]): SegmentAttempt => ({
  id,
  submissionId: "sub-1",
  startSec: 1,
  endSec: 5,
  status,
  stage: "QUALITY_CHECK",
  createdAt: "2026-11-03T10:00:00Z",
  analyzedAt: null,
  scores: null,
  issues: [],
  aiFeedback: null,
  error: null,
  comparison: { original: null, previous: null },
});

const respond = (record: SegmentAttempt) => ({ data: { data: record } }) as Awaited<ReturnType<typeof get>>;

const notFound = () => new AxiosError("Not found", "ERR_BAD_REQUEST", undefined, undefined, { status: 404 } as never);

const tick = (ms: number) => act(async () => void (await vi.advanceTimersByTimeAsync(ms)));

describe("useSegmentAttempt", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    get.mockReset();
  });
  afterEach(() => vi.useRealTimers());

  it("dừng poll khi COMPLETED, chỉ gọi đúng số lần cần", async () => {
    get.mockResolvedValueOnce(respond(attempt("seg-1", "PROCESSING"))).mockResolvedValue(respond(attempt("seg-1", "COMPLETED")));
    const { result } = renderHook(() => useSegmentAttempt("seg-1"));
    await tick(0);
    expect(result.current.attempt?.status).toBe("PROCESSING");
    expect(result.current.stopped).toBe(false);

    await tick(PROGRESS_POLL_MS);
    expect(result.current.attempt?.status).toBe("COMPLETED");
    expect(result.current.stopped).toBe(true);

    await tick(PROGRESS_POLL_MS * 5);
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("dừng và báo lỗi khi lượt luyện không còn (404)", async () => {
    get.mockRejectedValue(notFound());
    const { result } = renderHook(() => useSegmentAttempt("seg-1"));
    await tick(0);
    expect(result.current.stopped).toBe(true);
    expect(result.current.error).not.toBe("");

    await tick(PROGRESS_POLL_MS * 5);
    expect(get).toHaveBeenCalledTimes(1);
  });

  it("đổi segmentId thì hỏi lại với id mới", async () => {
    get.mockImplementation(async (id: string) => respond(attempt(id, "PROCESSING")));
    const { result, rerender } = renderHook(({ id }) => useSegmentAttempt(id), { initialProps: { id: "seg-1" as string | null } });
    await tick(0);
    expect(get).toHaveBeenLastCalledWith("seg-1", expect.anything());

    rerender({ id: "seg-2" });
    await tick(0);
    expect(get).toHaveBeenLastCalledWith("seg-2", expect.anything());
    expect(result.current.attempt?.id).toBe("seg-2");
  });

  it("không gọi API khi chưa có segmentId", async () => {
    renderHook(() => useSegmentAttempt(null));
    await tick(PROGRESS_POLL_MS * 3);
    expect(get).not.toHaveBeenCalled();
  });
});
