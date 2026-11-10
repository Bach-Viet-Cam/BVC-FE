import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CopyAssignmentEditDialog } from "@/features/classes/components/CopyAssignmentEditDialog";
import { type CopyAssignmentRow } from "@/features/classes/types/classTypes";

vi.mock("@/features/classes/api/assignmentsApi", () => ({
  assignmentsApi: {
    listClassSheetMusic: vi.fn().mockResolvedValue({
      data: {
        data: [{ id: "s1", name: "Bản chính", pieceId: "p1", pieceTitle: "Lý ngựa ô", kind: "SONG", defaultBpm: 96 }],
      },
    }),
  },
}));

const ROW: CopyAssignmentRow = {
  key: "a1",
  checked: true,
  content: { title: "Bài cũ", description: null, kind: "SOLO", sheetMusicId: null, requiredBpm: null },
  sheetMusic: null,
  status: "DRAFT",
  error: null,
};

function renderDialog() {
  const onClose = vi.fn();
  const onApply = vi.fn();
  render(<CopyAssignmentEditDialog row={ROW} instrumentId="i1" onClose={onClose} onApply={onApply} />);
  return { onClose, onApply };
}

describe("CopyAssignmentEditDialog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("applies the edited title", async () => {
    const { onApply } = renderDialog();
    const input = screen.getByLabelText(/Tiêu đề/);
    expect(input).toHaveValue("Bài cũ");
    await userEvent.clear(input);
    await userEvent.type(input, "Bài mới");
    await userEvent.click(screen.getByRole("button", { name: "Áp dụng" }));
    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ title: "Bài mới" }), null);
  });

  it("blocks an empty title", async () => {
    const { onApply } = renderDialog();
    await userEvent.clear(screen.getByLabelText(/Tiêu đề/));
    await userEvent.click(screen.getByRole("button", { name: "Áp dụng" }));
    expect(await screen.findByText("Tiêu đề không được để trống.")).toBeInTheDocument();
    expect(onApply).not.toHaveBeenCalled();
  });

  it("cancels without applying", async () => {
    const { onClose, onApply } = renderDialog();
    await userEvent.click(screen.getByRole("button", { name: "Hủy" }));
    expect(onClose).toHaveBeenCalled();
    expect(onApply).not.toHaveBeenCalled();
  });
});
