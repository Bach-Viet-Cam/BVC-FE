import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { classesApi } from "@/features/classes/api/classesApi";
import { useClassFileImport } from "@/features/classes/hooks/useClassFileImport";
import { type ClassFileImportPreview } from "@/features/classes/types/classTypes";

vi.mock("@/features/classes/api/classesApi", () => ({
  classesApi: { previewClassFileImport: vi.fn(), confirmClassFileImport: vi.fn() },
}));

const api = vi.mocked(classesApi);

function makePreview(overrides: Partial<ClassFileImportPreview> = {}): ClassFileImportPreview {
  return {
    fileName: "Students_DNH103_DNH103.E1.H2.xlsx",
    classInfo: {
      name: "DNH103.E1.H2",
      subjectCode: "DNH103",
      cohort: "Fall2026_H2",
      instrument: { id: "i1", name: "Đàn nhị" },
      startDate: "2026-11-09",
      endDate: "2026-12-27",
    },
    blockingErrors: [],
    totalRows: 13,
    validRows: 13,
    errorRows: 0,
    rows: [],
    ...overrides,
  };
}

const xlsx = () => new File(["x"], "Students_DNH103_DNH103.E1.H2.xlsx");

function mockPreview(preview: ClassFileImportPreview) {
  api.previewClassFileImport.mockResolvedValue({ data: { data: preview } } as never);
}

describe("useClassFileImport", () => {
  beforeEach(() => vi.clearAllMocks());

  it("moves to preview after selecting a file", async () => {
    mockPreview(makePreview());
    const { result } = renderHook(() => useClassFileImport());
    const file = xlsx();
    await act(() => result.current.selectFile(file));
    expect(api.previewClassFileImport).toHaveBeenCalledWith(file);
    expect(result.current.phase).toBe("preview");
    expect(result.current.canConfirm).toBe(true);
  });

  it("cannot confirm with blocking errors", async () => {
    mockPreview(makePreview({ blockingErrors: ["Lỗi"] }));
    const { result } = renderHook(() => useClassFileImport());
    await act(() => result.current.selectFile(xlsx()));
    expect(result.current.canConfirm).toBe(false);
  });

  it("cannot confirm without valid rows", async () => {
    mockPreview(makePreview({ validRows: 0 }));
    const { result } = renderHook(() => useClassFileImport());
    await act(() => result.current.selectFile(xlsx()));
    expect(result.current.canConfirm).toBe(false);
  });

  it("confirms with the selected file and returns the message", async () => {
    mockPreview(makePreview());
    const body = { classId: "c1", className: "DNH103.E1.H2", importedCount: 13, skippedCount: 0 };
    api.confirmClassFileImport.mockResolvedValue({ data: { message: "Đã tạo lớp", data: body } } as never);
    const { result } = renderHook(() => useClassFileImport());
    const file = xlsx();
    await act(() => result.current.selectFile(file));
    let outcome: unknown;
    await act(async () => {
      outcome = await result.current.confirm();
    });
    expect(api.confirmClassFileImport).toHaveBeenCalledWith(file);
    expect(outcome).toEqual({ message: "Đã tạo lớp", result: body });
  });

  it("rejects non-xlsx files without calling the API", async () => {
    const { result } = renderHook(() => useClassFileImport());
    await act(() => result.current.selectFile(new File(["x"], "a.csv")));
    expect(result.current.fileError).toBe("Chỉ hỗ trợ file .xlsx.");
    expect(api.previewClassFileImport).not.toHaveBeenCalled();
  });

  it("shows the API message and returns to idle when preview fails", async () => {
    api.previewClassFileImport.mockRejectedValue({
      isAxiosError: true,
      response: { status: 400, data: { success: false, message: "Tên file sai" } },
    });
    const { result } = renderHook(() => useClassFileImport());
    await act(() => result.current.selectFile(xlsx()));
    expect(result.current.fileError).toBe("Tên file sai");
    expect(result.current.phase).toBe("idle");
  });

  it("ignores a preview response that arrives after reset", async () => {
    let resolve: (value: unknown) => void = () => undefined;
    api.previewClassFileImport.mockReturnValue(new Promise((res) => (resolve = res)) as never);
    const { result } = renderHook(() => useClassFileImport());
    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = result.current.selectFile(xlsx());
    });
    expect(result.current.phase).toBe("uploading");
    act(() => result.current.reset());
    await act(async () => {
      resolve({ data: { data: makePreview() } });
      await pending;
    });
    expect(result.current.phase).toBe("idle");
    expect(result.current.preview).toBeNull();
    expect(result.current.file).toBeNull();
    expect(result.current.canConfirm).toBe(false);
  });
});
