import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
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

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="location">{`${location.pathname}${location.search}`}</span>;
}

function renderForm(presetInstrumentId: string, initialRecording?: File) {
  render(
    <MemoryRouter initialEntries={["/songs/p1/sheets?new=1"]}>
      <LocationProbe />
      <SheetFormDialog
        song={{ id: "p1", title: "Lý chiều chiều" } as LecturerPiece}
        sheets={[bauMain]}
        presetInstrumentId={presetInstrumentId}
        initialRecording={initialRecording}
        instrumentOptions={instruments}
        levelOptions={[{ value: "l1", label: "Cơ bản" }]}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />
    </MemoryRouter>
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

describe("SheetFormDialog bản thu mẫu", () => {
  it("mở trang thu âm kèm nhạc cụ đang chọn", async () => {
    renderForm("tranh");
    await userEvent.click(screen.getByRole("button", { name: /Thu trực tiếp/ }));
    expect(screen.getByTestId("location")).toHaveTextContent("/songs/p1/sheets/record?instrumentId=tranh");
  });

  it("nhận file WAV mang về từ trang thu âm", () => {
    renderForm("tranh", new File(["wav"], "ban-thu-mau.wav", { type: "audio/wav" }));
    expect(screen.getByText("ban-thu-mau.wav")).toBeInTheDocument();
  });

  it("giữ lại các ô đã gõ trước khi sang trang thu âm", () => {
    render(
      <MemoryRouter initialEntries={["/songs/p1/sheets?new=1"]}>
        <SheetFormDialog
          song={{ id: "p1", title: "Lý chiều chiều" } as LecturerPiece}
          sheets={[]}
          instrumentOptions={instruments}
          levelOptions={[{ value: "l1", label: "Cơ bản" }]}
          initialDraft={{
            name: "Đàn tranh - bản thử",
            description: "Đã gõ trước khi thu",
            instrumentId: "tranh",
            levelId: "l1",
            isMain: false,
            visibility: "HIDDEN",
            sheetFile: null,
            referenceRecording: null,
            tutorialVideo: null,
          }}
          onCancel={vi.fn()}
          onSubmit={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/Tên bản/)).toHaveValue("Đàn tranh - bản thử");
    expect(screen.getByLabelText(/Mô tả/)).toHaveValue("Đã gõ trước khi thu");
  });
});
