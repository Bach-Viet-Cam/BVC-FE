import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { InstrumentConfigPage } from "@/features/platform/pages/InstrumentConfigPage";

vi.mock("@/features/platform/components/InstrumentInfoPanel", () => ({
  InstrumentInfoPanel: ({ onSelectTunes }: { onSelectTunes?: (inst: { id: string }) => void }) => (
    <div data-testid="info-panel">
      <span>Info Panel Content</span>
      <button type="button" onClick={() => onSelectTunes?.({ id: "inst-123" })}>
        Chuyển sang dây
      </button>
    </div>
  ),
}));

vi.mock("@/features/platform/components/InstrumentTunesPanel", () => ({
  InstrumentTunesPanel: ({ selectedInstrumentId }: { selectedInstrumentId: string | null }) => (
    <div data-testid="tunes-panel">Tunes Panel - Instrument: {selectedInstrumentId ?? "none"}</div>
  ),
}));

vi.mock("@/features/classes/components/AdminRoadmapPanel", () => ({
  AdminRoadmapPanel: ({ selectedInstrumentId }: { selectedInstrumentId: string | null }) => (
    <div data-testid="roadmap-panel">Roadmap Panel - Instrument: {selectedInstrumentId ?? "none"}</div>
  ),
}));

function renderPage(initialEntries = ["/admin/instruments"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/admin/instruments" element={<InstrumentConfigPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("InstrumentConfigPage", () => {
  it("defaults to info tab when no query parameter is set", () => {
    renderPage();
    expect(screen.getByTestId("info-panel")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Thông tin chung" })).toHaveAttribute("aria-selected", "true");
  });

  it("reads tab and instrument id from URL query parameters", () => {
    renderPage(["/admin/instruments?tab=tunes&instrument=inst-dan-tranh"]);
    expect(screen.getByTestId("tunes-panel")).toBeInTheDocument();
    expect(screen.getByText("Tunes Panel - Instrument: inst-dan-tranh")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Cấu hình dây" })).toHaveAttribute("aria-selected", "true");
  });

  it("switches to roadmap tab when tab button is clicked", () => {
    renderPage();
    const roadmapTab = screen.getByRole("tab", { name: "Lộ trình học tập" });
    fireEvent.click(roadmapTab);
    expect(screen.getByTestId("roadmap-panel")).toBeInTheDocument();
  });

  it("switches to tunes tab with instrument id when clicking onSelectTunes", () => {
    renderPage();
    const btn = screen.getByRole("button", { name: "Chuyển sang dây" });
    fireEvent.click(btn);
    expect(screen.getByTestId("tunes-panel")).toBeInTheDocument();
    expect(screen.getByText("Tunes Panel - Instrument: inst-123")).toBeInTheDocument();
  });
});
