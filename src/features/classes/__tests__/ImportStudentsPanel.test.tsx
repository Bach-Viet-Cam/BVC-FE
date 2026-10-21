import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ImportStudentsPanel } from "@/features/classes/components/ImportStudentsPanel";
import { type ImportPreview } from "@/features/classes/types/classTypes";

function buildPreview(validRows: number): ImportPreview {
  const rows = [
    {
      rowNumber: 2,
      studentCode: "SE171234",
      fullName: "Trần Minh Anh",
      email: "anhtm@fpt.edu.vn",
      isValid: validRows > 0,
      reason: validRows > 0 ? null : "Email không hợp lệ",
    },
    {
      rowNumber: 3,
      studentCode: "SE171234",
      fullName: "Trần Minh Anh",
      email: "anhtm@fpt.edu.vn",
      isValid: false,
      reason: "Trùng dòng 2 trong file",
    },
  ];
  return {
    logId: "log1",
    fileName: "ds.xlsx",
    status: "PREVIEW",
    totalRows: 2,
    validRows,
    errorRows: 2 - validRows,
    rows,
  };
}

function renderPanel(overrides: Partial<React.ComponentProps<typeof ImportStudentsPanel>> = {}) {
  const props = {
    phase: "select" as const,
    fileName: null,
    fileError: null,
    preview: null,
    onSelectFile: vi.fn(),
    onDownloadTemplate: vi.fn(),
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
    ...overrides,
  };
  render(<ImportStudentsPanel {...props} />);
  return props;
}

describe("ImportStudentsPanel", () => {
  it("starts on step 1 with the confirm button disabled", () => {
    renderPanel();
    expect(screen.getByText("Chưa chọn file")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nhập 0 SV" })).toBeDisabled();
  });

  it("passes the chosen file up and shows a server file error with 'Đổi file'", async () => {
    const props = renderPanel();
    const file = new File(["a"], "ds.csv", { type: "text/csv" });
    await userEvent.upload(screen.getByTestId("import-file-input"), file);
    expect(props.onSelectFile).toHaveBeenCalledWith(file);

    renderPanel({
      fileName: "ds.pdf",
      fileError: "Định dạng file không được hỗ trợ. Vui lòng chọn file có định dạng .xlsx, .csv.",
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Định dạng file không được hỗ trợ");
    expect(screen.getByRole("button", { name: "Đổi file" })).toBeEnabled();
  });

  it("shows per-row reasons and enables 'Nhập N SV' when at least one row is valid", async () => {
    const props = renderPanel({ phase: "preview", fileName: "ds.xlsx", preview: buildPreview(1) });
    expect(screen.getByText("Trùng dòng 2 trong file")).toBeInTheDocument();
    expect(screen.getByText("dòng 3")).toBeInTheDocument();
    const confirmButton = screen.getByRole("button", { name: "Nhập 1 SV" });
    await userEvent.click(confirmButton);
    expect(props.onConfirm).toHaveBeenCalled();
  });

  it("keeps confirm disabled and shows MSG-08 when no row is valid", () => {
    renderPanel({ phase: "preview", fileName: "ds.xlsx", preview: buildPreview(0) });
    expect(screen.getByRole("button", { name: "Nhập 0 SV" })).toBeDisabled();
    expect(screen.getByText("Không thể nhập danh sách vì không có dòng hợp lệ.")).toBeInTheDocument();
  });
});
