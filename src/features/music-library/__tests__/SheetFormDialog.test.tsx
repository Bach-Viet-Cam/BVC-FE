import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SheetFormDialog } from "@/features/music-library/components/SheetFormDialog";
import type { LecturerPiece, LecturerSheetMusic } from "@/features/music-library/types/lecturerTypes";

const instruments = [
  { id: "tranh", name: "Đàn tranh" },
  { id: "bau", name: "Đàn bầu" },
];

const bauMain = {
  id: "s1",
  name: "Đàn bầu - Bản chính",
  isMain: true,
  instrument: instruments[1],
} as LecturerSheetMusic;

function renderForm(presetInstrumentId: string) {
  render(
    <SheetFormDialog
      song={{ id: "p1", title: "Lý chiều chiều" } as LecturerPiece}
      sheets={[bauMain]}
      presetInstrumentId={presetInstrumentId}
      instrumentOptions={instruments}
      levelOptions={[{ value: "l1", label: "Cơ bản" }]}
      onCancel={vi.fn()}
      onSubmit={vi.fn()}
    />
  );
  return screen.getByLabelText(/Tên bản/) as HTMLInputElement;
}

describe("SheetFormDialog sheet name", () => {
  it("names a main sheet after its instrument and locks the field", async () => {
    const name = renderForm("tranh");
    expect(name).toHaveValue("Đàn tranh - Bản chính");
    expect(name).toHaveAttribute("readonly");

    await userEvent.click(screen.getByRole("radio", { name: "Theo độ khó" }));
    expect(name).toHaveValue("");
    expect(name).not.toHaveAttribute("readonly");
  });

  it("leaves the name free when the instrument already has a main sheet", () => {
    const name = renderForm("bau");
    expect(name).toHaveValue("");
    expect(name).not.toHaveAttribute("readonly");
  });
});
