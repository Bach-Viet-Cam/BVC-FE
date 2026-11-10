import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CopyAssignmentList } from "@/features/classes/components/CopyAssignmentList";
import { type CopyAssignmentRow } from "@/features/classes/types/classTypes";

vi.mock("@/features/classes/hooks/useClassSheetMusic", () => ({
  useClassSheetMusic: () => ({ sheets: [], isLoading: false }),
}));

function row(key: string, title: string, overrides: Partial<CopyAssignmentRow> = {}): CopyAssignmentRow {
  return {
    key,
    checked: true,
    content: { title, description: null, kind: "OTHER", sheetMusicId: null, requiredBpm: null },
    sheetMusic: null,
    status: "DRAFT",
    error: null,
    ...overrides,
  };
}

function Wrapper({ initial, mismatch = false }: { initial: CopyAssignmentRow[]; mismatch?: boolean }) {
  const [rows, setRows] = useState(initial);
  return (
    <CopyAssignmentList
      rows={rows}
      instrumentMismatch={mismatch}
      instrumentId="i1"
      disabled={false}
      onToggle={(key) => setRows((r) => r.map((x) => (x.key === key ? { ...x, checked: !x.checked } : x)))}
      onToggleAll={(checked) => setRows((r) => r.map((x) => ({ ...x, checked })))}
      onEdit={() => undefined}
    />
  );
}

const THREE = [row("a", "Bài A"), row("b", "Bài B"), row("c", "Bài C")];

describe("CopyAssignmentList", () => {
  it("shows the checked count and deselect-all when all are ticked", () => {
    render(<Wrapper initial={THREE} />);
    expect(screen.getByText("Bài tập sẽ sao chép (3/3)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bỏ chọn tất cả" })).toBeInTheDocument();
  });

  it("updates the count when a row is toggled", async () => {
    render(<Wrapper initial={THREE} />);
    await userEvent.click(screen.getByRole("button", { name: "Sao chép Bài B" }));
    expect(screen.getByText("Bài tập sẽ sao chép (2/3)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Chọn tất cả" })).toBeInTheDocument();
  });

  it("shows a row error", () => {
    render(<Wrapper initial={[row("a", "Bài A", { error: "Trùng loại" })]} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Trùng loại");
  });

  it("shows the instrument mismatch warning", () => {
    render(<Wrapper initial={THREE} mismatch />);
    expect(screen.getByText("Nhạc cụ khác lớp nguồn — một số bản nhạc có thể không dùng được.")).toBeInTheDocument();
  });

  it("opens the edit dialog", async () => {
    render(<Wrapper initial={THREE} />);
    await userEvent.click(screen.getByRole("button", { name: "Sửa Bài A" }));
    expect(await screen.findByText("Sửa bài tập")).toBeInTheDocument();
  });

  it("shows the empty state", () => {
    render(<Wrapper initial={[]} />);
    expect(screen.getByText("Lớp nguồn chưa có bài tập")).toBeInTheDocument();
  });

  it("marks an unavailable sheet music", () => {
    const sheetMusic = { id: "s1", pieceTitle: "Bản A", name: "Phần 1", isAvailable: false };
    render(<Wrapper initial={[row("a", "Bài A", { sheetMusic: sheetMusic as never })]} />);
    expect(screen.getByText(/Không còn khả dụng/)).toBeInTheDocument();
  });
});
