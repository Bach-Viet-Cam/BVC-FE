import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClassFileImportDialog } from "@/features/classes/components/ClassFileImportDialog";
import { type ClassFileImportPreview } from "@/features/classes/types/classTypes";

const hookState = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));
vi.mock("@/features/classes/hooks/useClassFileImport", () => ({ useClassFileImport: () => hookState.current }));

const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("@/shared/components/ui/toast", () => ({ toast: toastMock }));

const PREVIEW: ClassFileImportPreview = {
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
  rows: [{ rowNumber: 2, studentCode: "SE1", fullName: "An", email: "an@x.vn", isValid: true, reason: null }],
};

const confirm = vi.fn();
const reset = vi.fn();
function setHook(preview: ClassFileImportPreview | null, canConfirm: boolean) {
  hookState.current = {
    phase: preview ? "preview" : "idle",
    file: preview ? new File(["x"], preview.fileName) : null,
    fileError: null,
    preview,
    canConfirm,
    selectFile: vi.fn(),
    confirm,
    reset,
  };
}

const onClose = vi.fn();
const onImported = vi.fn();
const renderDialog = () => render(<ClassFileImportDialog open onClose={onClose} onImported={onImported} />);

describe("ClassFileImportDialog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows the class info and enables the confirm button for a clean preview", () => {
    setHook(PREVIEW, true);
    renderDialog();
    expect(screen.getByText("DNH103.E1.H2")).toBeInTheDocument();
    expect(screen.getByText("DNH103 · Đàn nhị")).toBeInTheDocument();
    expect(screen.getByText("Fall2026_H2 · 09/11/2026 – 27/12/2026")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tạo lớp & nhập 13 SV" })).toBeEnabled();
  });

  it("shows blocking errors in an alert and disables the confirm button", () => {
    const message = "Mã môn DNH103 chưa có trong hệ thống. Vui lòng liên hệ admin để thêm mã môn mới.";
    setHook({ ...PREVIEW, blockingErrors: [message] }, false);
    renderDialog();
    expect(within(screen.getByRole("alert")).getByText(message)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tạo lớp & nhập 13 SV" })).toBeDisabled();
  });

  it("toasts, resets and closes after a successful confirm", async () => {
    setHook(PREVIEW, true);
    confirm.mockResolvedValue({ message: "Đã tạo lớp", result: {} });
    renderDialog();
    await userEvent.click(screen.getByRole("button", { name: "Tạo lớp & nhập 13 SV" }));
    expect(toastMock.success).toHaveBeenCalledWith("Đã tạo lớp");
    expect(onImported).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("toasts the error and stays open when confirm fails", async () => {
    setHook(PREVIEW, true);
    confirm.mockResolvedValue({ error: "Lớp đã tồn tại" });
    renderDialog();
    await userEvent.click(screen.getByRole("button", { name: "Tạo lớp & nhập 13 SV" }));
    expect(toastMock.error).toHaveBeenCalledWith("Lớp đã tồn tại");
    expect(onClose).not.toHaveBeenCalled();
    expect(onImported).not.toHaveBeenCalled();
  });
});
