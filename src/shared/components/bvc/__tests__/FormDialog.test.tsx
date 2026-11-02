import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FormDialog } from "@/shared/components/bvc/FormDialog";

interface SetupOptions {
  isDirty: boolean;
  onSaveDraft?: () => Promise<boolean>;
}

function setup({ isDirty, onSaveDraft }: SetupOptions) {
  const onClose = vi.fn();
  render(
    <FormDialog open onClose={onClose} title="Tạo lớp học" isDirty={isDirty} onSaveDraft={onSaveDraft}>
      {(requestClose) => (
        <button type="button" onClick={requestClose}>
          Hủy
        </button>
      )}
    </FormDialog>
  );
  return { onClose };
}

describe("FormDialog", () => {
  it("closes right away when nothing has been typed", async () => {
    const { onClose } = setup({ isDirty: false });
    await userEvent.click(screen.getByRole("button", { name: "Hủy" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Thoát khi chưa lưu?")).not.toBeInTheDocument();
  });

  it("warns that typed data will be lost before closing a form without drafts", async () => {
    const { onClose } = setup({ isDirty: true });
    await userEvent.click(screen.getByRole("button", { name: "Đóng" }));
    expect(await screen.findByText("Thoát khi chưa lưu?")).toBeInTheDocument();
    expect(screen.getByText("Nội dung bạn đang nhập chưa được lưu và sẽ mất nếu thoát.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Lưu bản nháp" })).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Thoát" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("keeps the form open on 'Tiếp tục nhập'", async () => {
    const { onClose } = setup({ isDirty: true });
    await userEvent.click(screen.getByRole("button", { name: "Hủy" }));
    await userEvent.click(await screen.findByRole("button", { name: "Tiếp tục nhập" }));
    await waitFor(() => expect(screen.queryByText("Thoát khi chưa lưu?")).not.toBeInTheDocument());
    expect(onClose).not.toHaveBeenCalled();
  });

  it("offers to save a draft and closes once it is saved", async () => {
    const onSaveDraft = vi.fn().mockResolvedValue(true);
    const { onClose } = setup({ isDirty: true, onSaveDraft });
    await userEvent.click(screen.getByRole("button", { name: "Hủy" }));
    expect(await screen.findByRole("button", { name: "Thoát không lưu" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Lưu bản nháp" }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(onSaveDraft).toHaveBeenCalledTimes(1);
  });

  it("stays on the form when the draft cannot be saved", async () => {
    const onSaveDraft = vi.fn().mockResolvedValue(false);
    const { onClose } = setup({ isDirty: true, onSaveDraft });
    await userEvent.click(screen.getByRole("button", { name: "Hủy" }));
    await userEvent.click(await screen.findByRole("button", { name: "Lưu bản nháp" }));
    await waitFor(() => expect(screen.queryByText("Thoát khi chưa lưu?")).not.toBeInTheDocument());
    expect(onClose).not.toHaveBeenCalled();
  });
});
