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
    kind: "SOLO",
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
    kind: "ENSEMBLE",
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
    kind: "ENSEMBLE",
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
    kind: "OTHER",
    deadline: "2020-02-01T10:00:00Z",
    status: "PASSED",
    usedSubmissions: 2,
    maxSubmissions: 3,
    minAccuracy: 75,
    bonusPoints: null,
  },
  {
    id: "b1",
    classId: "c1",
    title: "Thử thách vuốt dây",
    className: "Lớp Đàn tranh K1",
    type: "BONUS",
    kind: "BONUS",
    deadline: "2099-12-01T10:00:00Z",
    status: "NOT_SUBMITTED",
    usedSubmissions: 0,
    maxSubmissions: 3,
    minAccuracy: 70,
    bonusPoints: 5,
  },
];

function mockListMine(items: AssignmentListItem[] = mockAssignments) {
  vi.mocked(assignmentApi.listMine).mockResolvedValue({
    data: { data: items, message: "OK" },
  } as never);
}

function renderPage(path = "/assignments") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/assignments" element={<MyAssignmentsPage />} />
      </Routes>
    </MemoryRouter>
  );
}

async function tickKinds(...labels: string[]) {
  await userEvent.click(screen.getByRole("button", { name: "Lọc theo Loại bài" }));
  for (const label of labels) {
    await userEvent.click(await screen.findByRole("checkbox", { name: label }));
  }
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

    expect(screen.getByRole("heading", { name: /Cần làm/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Đã nộp/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Quá hạn/ })).toBeInTheDocument();
  });

  it("filters assignments when clicking status tabs", async () => {
    mockListMine();
    renderPage();

    await screen.findByText("Lý ngựa ô");
    await userEvent.click(screen.getByRole("tab", { name: /Quá hạn/ }));

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

    await tickKinds("Bài tập khác");
    await userEvent.click(screen.getByRole("tab", { name: /Chưa nộp/ }));

    expect(await screen.findByText("Không tìm thấy bài tập phù hợp")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Xóa bộ lọc" }));
    expect(await screen.findByText("Lý ngựa ô")).toBeInTheDocument();
  });

  it("loads bonus and regular assignments together, tagged by kind", async () => {
    mockListMine();
    renderPage();

    expect(await screen.findByText("Thử thách vuốt dây")).toBeInTheDocument();
    expect(assignmentApi.listMine).toHaveBeenCalledWith(expect.objectContaining({ type: undefined }));
    expect(screen.getByRole("link", { name: /Thử thách vuốt dây/ })).toHaveAttribute("href", "/community/bonus/b1");
    expect(screen.getAllByText("Bonus").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Hòa tấu").length).toBeGreaterThan(0);
  });

  it("lets the student tick several kinds at once", async () => {
    mockListMine();
    renderPage();
    await screen.findByText("Lý ngựa ô");

    await tickKinds("Độc tấu", "Bonus");

    expect(screen.getByText("Lý ngựa ô")).toBeInTheDocument();
    expect(screen.getByText("Thử thách vuốt dây")).toBeInTheDocument();
    expect(screen.queryByText("Luyện nhịp phách")).not.toBeInTheDocument();
    expect(screen.queryByText("Thi kết thúc")).not.toBeInTheDocument();
  });

  it("opens with only bonus work when coming from the old bonus page", async () => {
    mockListMine();
    renderPage("/assignments?kind=BONUS");

    expect(await screen.findByText("Thử thách vuốt dây")).toBeInTheDocument();
    expect(screen.queryByText("Lý ngựa ô")).not.toBeInTheDocument();
  });
});
