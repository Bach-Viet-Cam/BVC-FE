import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PracticeHistory } from "@/features/classes/components/PracticeHistory";
import { teacherProgressApi } from "@/features/classes/api/teacherProgressApi";

vi.mock("@/features/classes/api/teacherProgressApi", () => ({ teacherProgressApi: { getStudentHistory: vi.fn() } }));

const ITEM = {
  submissionId: "x1",
  assignmentId: "a1",
  assignmentTitle: "Độc tấu — Lý ngựa ô",
  kind: "SOLO",
  status: "COMPLETED",
  accuracy: 82.5,
  submittedAt: "2026-10-16T02:30:00.000Z",
};

function mockHistory(items: unknown[]) {
  vi.mocked(teacherProgressApi.getStudentHistory).mockResolvedValue({
    data: { data: { items, pagination: { page: 1, limit: 100, total: items.length } }, message: "", success: true },
  } as never);
}

const renderHistory = () =>
  render(
    <MemoryRouter>
      <PracticeHistory classId="c1" studentId="s1" />
    </MemoryRouter>
  );

describe("PracticeHistory", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists submissions with title, kind, status, accuracy, Vietnam time and a link", async () => {
    mockHistory([ITEM]);
    renderHistory();
    const row = (await screen.findByText("Độc tấu — Lý ngựa ô")).closest("li") as HTMLElement;
    expect(within(row).getByText("Độc tấu")).toBeInTheDocument();
    expect(within(row).getByText("Hoàn tất")).toBeInTheDocument();
    expect(within(row).getByText("82.5%")).toBeInTheDocument();
    expect(within(row).getByText("16/10/2026 09:30")).toBeInTheDocument();
    expect(within(row).getByRole("link", { name: "Xem" })).toHaveAttribute(
      "href",
      "/teacher/assignments/a1/students/s1"
    );
  });

  it("keeps the previous result and shows MSG-04 when from is after to", async () => {
    mockHistory([ITEM]);
    renderHistory();
    await screen.findByText("Độc tấu — Lý ngựa ô");
    await userEvent.type(screen.getByLabelText("Từ"), "20102026");
    await userEvent.type(screen.getByLabelText("đến"), "10102026");
    await userEvent.click(screen.getByRole("button", { name: "Lọc" }));
    expect(await screen.findByText("Từ ngày không được sau đến ngày.")).toBeInTheDocument();
    expect(teacherProgressApi.getStudentHistory).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Độc tấu — Lý ngựa ô")).toBeInTheDocument();
  });

  it("requests the API with yyyy-MM-dd dates", async () => {
    mockHistory([ITEM]);
    renderHistory();
    await screen.findByText("Độc tấu — Lý ngựa ô");
    await userEvent.type(screen.getByLabelText("Từ"), "01102026");
    await userEvent.type(screen.getByLabelText("đến"), "16102026");
    await userEvent.click(screen.getByRole("button", { name: "Lọc" }));
    await vi.waitFor(() =>
      expect(teacherProgressApi.getStudentHistory).toHaveBeenLastCalledWith(
        "c1",
        "s1",
        expect.objectContaining({ from: "2026-10-01", to: "2026-10-16" })
      )
    );
  });

  it("shows an empty message", async () => {
    mockHistory([]);
    renderHistory();
    expect(await screen.findByText("Chưa có bài nộp nào.")).toBeInTheDocument();
  });

  it("does not leave old rows on screen when the filtered request fails", async () => {
    mockHistory([ITEM]);
    renderHistory();
    await screen.findByText("Độc tấu — Lý ngựa ô");
    vi.mocked(teacherProgressApi.getStudentHistory).mockRejectedValueOnce(new Error("network"));
    await userEvent.type(screen.getByLabelText("Từ"), "01102026");
    await userEvent.click(screen.getByRole("button", { name: "Lọc" }));
    expect(await screen.findByText("Tải dữ liệu thất bại. Vui lòng thử lại.")).toBeInTheDocument();
    expect(screen.queryByText("Độc tấu — Lý ngựa ô")).not.toBeInTheDocument();
  });
});
