import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { assignmentApi } from "@/features/classes/api/assignmentApi";
import { MyAssignmentsPage } from "@/features/classes/pages/MyAssignmentsPage";
import { type AssignmentListItem } from "@/features/classes/types/assignmentTypes";

vi.mock("@/features/classes/api/assignmentApi", () => ({
  assignmentApi: { listMine: vi.fn(), get: vi.fn() },
}));

vi.mock("@/shared/context/AuthContext", () => ({
  useAuth: () => ({ user: { userId: "u1", username: "Sinh viên", email: "sv@example.com", role: 1 } }),
}));

const mockAssignments: AssignmentListItem[] = [
  {
    id: "a1",
    classId: "c1",
    title: "Lý ngựa ô",
    className: "Lớp Đàn tranh K1",
    type: "RECORDING",
    deadline: "2099-11-10T10:00:00Z",
    status: "NOT_SUBMITTED",
    usedSubmissions: 0,
    maxSubmissions: 3,
    minAccuracy: 70,
    bonusPoints: null,
  },
  {
    id: "a2",
    classId: "c1",
    title: "Luyện nhịp phách",
    className: "Lớp Đàn tranh K1",
    type: "RHYTHM",
    deadline: "2099-11-15T10:00:00Z",
    status: "SUBMITTED",
    usedSubmissions: 1,
    maxSubmissions: 3,
    minAccuracy: 80,
    bonusPoints: null,
  },
  {
    id: "a3",
    classId: "c2",
    title: "Bản nhạc hòa tấu",
    className: "Lớp Hòa tấu",
    type: "SHEET",
    deadline: "2020-01-01T10:00:00Z",
    status: "OVERDUE",
    usedSubmissions: 0,
    maxSubmissions: 2,
    minAccuracy: 60,
    bonusPoints: null,
  },
  {
    id: "a4",
    classId: "c1",
    title: "Thi kết thúc",
    className: "Lớp Đàn tranh K1",
    type: "EXAM",
    deadline: "2020-02-01T10:00:00Z",
    status: "PASSED",
    usedSubmissions: 2,
    maxSubmissions: 3,
    minAccuracy: 75,
    bonusPoints: null,
  },
];

function mockListMine(items: AssignmentListItem[] = mockAssignments) {
  vi.mocked(assignmentApi.listMine).mockResolvedValue({
    data: { data: items, message: "OK" },
  } as never);
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/assignments"]}>
      <Routes>
        <Route path="/assignments" element={<MyAssignmentsPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("MyAssignmentsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page hero, 'Làm tiếp' card, and assignment sections", async () => {
    mockListMine();
    renderPage();

    expect(await screen.findByText("Bài tập của tôi")).toBeInTheDocument();
    expect(await screen.findByText("Làm tiếp")).toBeInTheDocument();
    expect(screen.getByText("Lý ngựa ô")).toBeInTheDocument();

    // Check sections
    expect(screen.getByRole("heading", { name: /Cần làm/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Đã nộp/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Quá hạn/ })).toBeInTheDocument();
  });

  it("filters assignments when clicking status tabs", async () => {
    mockListMine();
    renderPage();

    await screen.findByText("Lý ngựa ô");

    // Click 'Quá hạn' tab
    const overdueTab = screen.getByRole("tab", { name: /Quá hạn/ });
    await userEvent.click(overdueTab);

    // Overdue items should be visible, others filtered out
    expect(screen.getByText("Bản nhạc hòa tấu")).toBeInTheDocument();
    expect(screen.queryByText("Lý ngựa ô")).not.toBeInTheDocument();
  });

  it("shows empty state when no assignments match filter", async () => {
    mockListMine([]);
    renderPage();

    expect(await screen.findByText("Bạn chưa có bài tập nào.")).toBeInTheDocument();
  });

  it("handles filter and clear filters", async () => {
    mockListMine();
    renderPage();

    await screen.findByText("Lý ngựa ô");

    // Filter to class with no overdue assignments
    const typeSelect = screen.getByLabelText("Loại bài");
    await userEvent.selectOptions(typeSelect, "EXAM");

    // Click 'Chưa nộp' tab
    const notSubmittedTab = screen.getByRole("tab", { name: /Chưa nộp/ });
    await userEvent.click(notSubmittedTab);

    // EXAM is PASSED, so NOT_SUBMITTED with EXAM should be empty
    expect(await screen.findByText("Không tìm thấy bài tập phù hợp")).toBeInTheDocument();

    // Click Xóa bộ lọc
    const clearBtn = screen.getByRole("button", { name: "Xóa bộ lọc" });
    await userEvent.click(clearBtn);

    // Everything is shown again
    expect(await screen.findByText("Lý ngựa ô")).toBeInTheDocument();
  });
});
