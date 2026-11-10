import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { classesApi } from "@/features/classes/api/classesApi";
import { useClassCopy } from "@/features/classes/hooks/useClassCopy";
import { type ClassCopySource } from "@/features/classes/types/classTypes";

vi.mock("@/features/classes/api/classesApi", () => ({ classesApi: { getCopySource: vi.fn() } }));
vi.mock("@/shared/components/ui/toast", () => ({ toast: { error: vi.fn() } }));

const getCopySource = vi.mocked(classesApi.getCopySource);

function assignment(id: string, kind: "SOLO" | "ENSEMBLE" | "OTHER", status = "DRAFT") {
  return {
    id,
    title: `Bài ${id}`,
    kind,
    description: null,
    sheetMusic: null,
    requiredBpm: null,
    status,
  };
}

function source(id: string, assignments: unknown[] = []): ClassCopySource {
  return {
    id,
    name: id,
    cohort: "K1",
    description: null,
    instrument: { id: "i1", name: "Đàn tranh" },
    coLecturers: [],
    assignments,
  } as unknown as ClassCopySource;
}

function respond(data: ClassCopySource) {
  return { data: { data } } as never;
}

function deferred() {
  let resolve!: (v: never) => void;
  const promise = new Promise<never>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

beforeEach(() => vi.clearAllMocks());

describe("useClassCopy", () => {
  it("ignores a stale response when a newer selectSource was made", async () => {
    const first = deferred();
    const second = deferred();
    getCopySource.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { result } = renderHook(() => useClassCopy());

    let r1!: Promise<boolean>;
    let r2!: Promise<boolean>;
    act(() => {
      r1 = result.current.selectSource("a");
      r2 = result.current.selectSource("b");
    });
    await act(async () => {
      second.resolve(respond(source("b")));
      await r2;
    });
    expect(result.current.source?.id).toBe("b");
    expect(result.current.isLoading).toBe(false);

    await act(async () => {
      first.resolve(respond(source("a")));
      expect(await r1).toBe(false);
    });
    expect(result.current.source?.id).toBe("b");
  });

  it("keeps isLoading true until the latest request settles", async () => {
    const first = deferred();
    const second = deferred();
    getCopySource.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { result } = renderHook(() => useClassCopy());
    let r1!: Promise<boolean>;
    let r2!: Promise<boolean>;
    act(() => {
      r1 = result.current.selectSource("a");
      r2 = result.current.selectSource("b");
    });
    await act(async () => {
      first.resolve(respond(source("a")));
      await r1;
    });
    expect(result.current.isLoading).toBe(true);
    await act(async () => {
      second.resolve(respond(source("b")));
      await r2;
    });
    expect(result.current.isLoading).toBe(false);
  });

  it("stays empty when clear() runs during a pending request", async () => {
    const pending = deferred();
    getCopySource.mockReturnValueOnce(pending.promise);
    const { result } = renderHook(() => useClassCopy());
    let r!: Promise<boolean>;
    act(() => {
      r = result.current.selectSource("a");
    });
    act(() => result.current.clear());
    await act(async () => {
      pending.resolve(respond(source("a", [assignment("1", "OTHER")])));
      expect(await r).toBe(false);
    });
    expect(result.current.source).toBeNull();
    expect(result.current.rows).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("validate flags duplicated kinds and clears the stale error after toggling", async () => {
    getCopySource.mockResolvedValueOnce(respond(source("a", [assignment("1", "SOLO"), assignment("2", "SOLO")])));
    const { result } = renderHook(() => useClassCopy());
    await act(async () => {
      await result.current.selectSource("a");
    });
    let ok = true;
    act(() => {
      ok = result.current.validate();
    });
    expect(ok).toBe(false);
    expect(result.current.rows.every((r) => r.error)).toBe(true);

    act(() => result.current.toggle("2"));
    act(() => {
      ok = result.current.validate();
    });
    expect(ok).toBe(true);
    expect(result.current.rows.every((r) => r.error === null)).toBe(true);
  });

  it("applyServerErrors maps row errors and returns the rest", async () => {
    getCopySource.mockResolvedValueOnce(respond(source("a", [assignment("1", "SOLO"), assignment("2", "OTHER")])));
    const { result } = renderHook(() => useClassCopy());
    await act(async () => {
      await result.current.selectSource("a");
    });
    let rest: unknown;
    act(() => {
      rest = result.current.applyServerErrors([
        { field: "assignments.0.sheetMusicId", message: "Bản nhạc lỗi" },
        { field: "name", message: "Tên trùng" },
      ]);
    });
    expect(result.current.rows[0].error).toBe("Bản nhạc lỗi");
    expect(result.current.rows[1].error).toBeNull();
    expect(rest).toEqual([{ field: "name", message: "Tên trùng" }]);
  });

  it("payload is null without a source and contains only checked rows after", async () => {
    getCopySource.mockResolvedValueOnce(
      respond(source("a", [assignment("1", "SOLO", "CLOSED"), assignment("2", "OTHER")]))
    );
    const { result } = renderHook(() => useClassCopy());
    expect(result.current.payload()).toBeNull();
    await act(async () => {
      await result.current.selectSource("a");
    });
    act(() => result.current.toggle("2"));
    const payload = result.current.payload();
    expect(payload?.sourceClassId).toBe("a");
    expect(payload?.assignments).toHaveLength(1);
    expect(payload?.assignments[0]).toMatchObject({ title: "Bài 1", status: "PUBLISHED" });
  });

  it("clears a duplicate-kind error on the other row once the conflict is gone", async () => {
    getCopySource.mockResolvedValueOnce(respond(source("a", [assignment("1", "SOLO"), assignment("2", "SOLO")])));
    const { result } = renderHook(() => useClassCopy());
    await act(async () => {
      await result.current.selectSource("a");
    });
    act(() => {
      result.current.validate();
    });
    expect(result.current.rows.every((r) => r.error)).toBe(true);
    const first = result.current.rows[0];
    act(() => result.current.updateRow(first.key, { ...first.content, kind: "OTHER" }, first.sheetMusic));
    expect(result.current.rows[0].error).toBeNull();
    expect(result.current.rows[1].error).toBeNull();
  });
});
