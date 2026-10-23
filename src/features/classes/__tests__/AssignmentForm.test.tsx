import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AssignmentForm } from "@/features/classes/components/AssignmentForm";
import { EMPTY_ASSIGNMENT_FORM } from "@/features/classes/utils/validateAssignment";

vi.mock("@/features/classes/api/assignmentsApi", () => ({
  assignmentsApi: {
    listClassSheetMusic: vi.fn().mockResolvedValue({
      data: {
        data: [
          { id: "s1", name: "Bản chính", pieceId: "p1", pieceTitle: "Lý ngựa ô", kind: "SONG", defaultBpm: 96 },
          { id: "s2", name: "Bản dễ", pieceId: "p2", pieceTitle: "Luyện ngón - Vê", kind: "FINGER_EXERCISE", defaultBpm: null },
        ],
      },
    }),
  },
}));

const CLASSES = [{ id: "c1", name: "TRD301" }];

function renderForm(props: Partial<React.ComponentProps<typeof AssignmentForm>> = {}) {
  const onSubmit = vi.fn().mockResolvedValue(null);
  render(
    <AssignmentForm
      mode="create"
      initialValues={{ ...EMPTY_ASSIGNMENT_FORM, classId: "c1" }}
      classes={CLASSES}
      isSaving={false}
      onCancel={vi.fn()}
      onSubmit={onSubmit}
      {...props}
    />
  );
  return onSubmit;
}

async function fillRequired() {
  await userEvent.type(screen.getByLabelText(/Tiêu đề/), "  Độc tấu Lý ngựa ô ");
  await userEvent.selectOptions(screen.getByLabelText(/Loại bài/), "SOLO");
}

describe("AssignmentForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("requires class, title and kind", async () => {
    const onSubmit = renderForm({ initialValues: EMPTY_ASSIGNMENT_FORM });
    await userEvent.click(screen.getByRole("button", { name: "Lưu nháp" }));
    expect(await screen.findByText("Lớp không được để trống.")).toBeInTheDocument();
    expect(screen.getByText("Tiêu đề không được để trống.")).toBeInTheDocument();
    expect(screen.getByText("Loại bài không được để trống.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it.each(["0", "301", "1.5"])("rejects BPM %s with MSG-03", async (bpm) => {
    const onSubmit = renderForm();
    await fillRequired();
    await userEvent.type(screen.getByLabelText(/BPM yêu cầu/), bpm);
    await userEvent.click(screen.getByRole("button", { name: "Lưu nháp" }));
    expect(await screen.findByText("BPM yêu cầu phải nằm trong khoảng từ 1 đến 300.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("limits the description to 1000 characters", async () => {
    renderForm();
    await fillRequired();
    const description = screen.getByLabelText(/Mô tả/);
    await userEvent.click(description);
    await userEvent.paste("x".repeat(1001));
    await userEvent.click(screen.getByRole("button", { name: "Lưu nháp" }));
    expect(await screen.findByText("Mô tả không được vượt quá 1000 ký tự.")).toBeInTheDocument();
  });

  it("'Lưu nháp' sends publish false and 'Lưu & Giao Bài' sends publish true", async () => {
    const onSubmit = renderForm();
    await fillRequired();
    await userEvent.click(screen.getByRole("button", { name: "Lưu nháp" }));
    expect(onSubmit).toHaveBeenLastCalledWith(
      { classId: "c1", title: "Độc tấu Lý ngựa ô", description: null, kind: "SOLO", sheetMusicId: null, requiredBpm: null },
      false
    );
    await userEvent.type(screen.getByLabelText(/BPM yêu cầu/), "90");
    await userEvent.click(screen.getByRole("button", { name: "Lưu & Giao Bài" }));
    expect(onSubmit).toHaveBeenLastCalledWith(expect.objectContaining({ requiredBpm: 90 }), true);
  });

  it("edit mode locks the class and only offers 'Lưu'", async () => {
    renderForm({ mode: "edit", initialValues: { ...EMPTY_ASSIGNMENT_FORM, classId: "c1", title: "A", kind: "SOLO" } });
    expect(screen.getByLabelText(/Lớp/)).toHaveAttribute("readonly");
    expect(screen.getByRole("button", { name: "Lưu" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Lưu nháp" })).not.toBeInTheDocument();
  });

  it("shows server MSG-48 under the sheet music field", async () => {
    const onSubmit = renderForm();
    onSubmit.mockResolvedValue([
      {
        field: "sheetMusicId",
        code: "MSG-48",
        message: "Bản nhạc đã chọn không còn khả dụng trong thư viện. Vui lòng chọn mục khác.",
      },
    ]);
    await fillRequired();
    await userEvent.click(screen.getByRole("button", { name: "Lưu nháp" }));
    expect(
      await screen.findByText("Bản nhạc đã chọn không còn khả dụng trong thư viện. Vui lòng chọn mục khác.")
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Tiêu đề/)).toHaveValue("  Độc tấu Lý ngựa ô ");
  });

  it("lists sheet music as piece title and sheet name", async () => {
    renderForm();
    expect(await screen.findByRole("option", { name: "Lý ngựa ô — Bản chính" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Luyện ngón - Vê — Bản dễ" })).toBeInTheDocument();
  });

  it("shows the sheet music default BPM as a hint", async () => {
    renderForm();
    await screen.findByRole("option", { name: "Lý ngựa ô — Bản chính" });
    await userEvent.selectOptions(screen.getByLabelText(/Bài nhạc/), "s1");
    expect(screen.getByLabelText(/BPM yêu cầu/)).toHaveAttribute("placeholder", "Mặc định: 96");
  });

  it("edit mode shows the stored sheet music as selected once sheets load", async () => {
    renderForm({
      mode: "edit",
      initialValues: { ...EMPTY_ASSIGNMENT_FORM, classId: "c1", title: "A", kind: "SOLO", sheetMusicId: "s1" },
    });
    await screen.findByRole("option", { name: "Lý ngựa ô — Bản chính" });
    expect(screen.getByLabelText(/Bài nhạc/)).toHaveValue("s1");
  });

  it("keeps a hidden current sheet music visible as an option", async () => {
    renderForm({
      mode: "edit",
      initialValues: { ...EMPTY_ASSIGNMENT_FORM, classId: "c1", title: "A", kind: "SOLO", sheetMusicId: "old" },
      currentSheetMusic: { id: "old", name: "Bản cũ", pieceId: "p9", pieceTitle: "Bài cũ", defaultBpm: null, isAvailable: false },
    });
    await screen.findByRole("option", { name: "Lý ngựa ô — Bản chính" });
    expect(screen.getByRole("option", { name: "Bài cũ — Bản cũ (Không còn khả dụng)" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Bài nhạc/)).toHaveValue("old");
  });

  it("clears the sheet music when the class changes", async () => {
    const onSubmit = renderForm({ classes: [...CLASSES, { id: "c2", name: "TRD401" }] });
    await screen.findByRole("option", { name: "Lý ngựa ô — Bản chính" });
    await userEvent.selectOptions(screen.getByLabelText(/Bài nhạc/), "s1");
    await userEvent.selectOptions(screen.getByLabelText(/^Lớp/), "c2");
    await fillRequired();
    await userEvent.click(screen.getByRole("button", { name: "Lưu nháp" }));
    expect(onSubmit).toHaveBeenLastCalledWith(expect.objectContaining({ classId: "c2", sheetMusicId: null }), false);
  });
});
