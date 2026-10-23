import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AssignmentList } from "@/features/classes/components/AssignmentList";
import { assignmentsApi } from "@/features/classes/api/assignmentsApi";

vi.mock("@/features/classes/api/assignmentsApi", () => ({ assignmentsApi: { listAssignments: vi.fn() } }));
vi.mock("@/features/classes/api/classesApi", () => ({
  classesApi: {
    listClasses: vi.fn().mockResolvedValue({
      data: {
        data: {
          items: [{ id: "c1", name: "TRD301" }],
          pagination: { page: 1, limit: 200, total: 1 },
          activeCount: 1,
          cohorts: [],
        },
      },
    }),
  },
}));

const ITEM = {
  id: "a1",
  classId: "c1",
  className: "TRD301",
  status: "PUBLISHED",
  version: 2,
  title: "Độc tấu - Lý ngựa ô",
  kind: "SOLO",
  submittedCount: 3,
  memberCount: 20,
  updatedAt: "2026-10-16T02:30:00.000Z",
};

function mockItems(items: unknown[]) {
  vi.mocked(assignmentsApi.listAssignments).mockResolvedValue({
    data: { data: { items, pagination: { page: 1, limit: 100, total: items.length } }, message: "", success: true },
  } as never);
}

const renderList = (props: { classId?: string; canCreate: boolean }) =>
  render(
    <MemoryRouter>
      <AssignmentList {...props} />
    </MemoryRouter>
  );

describe("AssignmentList", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders a card with title, kind, class, status and submitted count", async () => {
    mockItems([ITEM]);
    renderList({ canCreate: true });
    const card = (await screen.findByText("Độc tấu - Lý ngựa ô")).closest("a") as HTMLElement;
    expect(card).toHaveAttribute("href", "/teacher/assignments/a1");
    expect(within(card).getByText("Độc tấu")).toBeInTheDocument();
    expect(within(card).getByText("Đã đăng")).toBeInTheDocument();
    expect(within(card).getByText("3/20 đã nộp")).toBeInTheDocument();
    expect(within(card).getByText("TRD301")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Tạo bài tập/ })).toHaveAttribute("href", "/teacher/assignments/new");
  });

  it("shows the empty message when the lecturer has no assignment", async () => {
    mockItems([]);
    renderList({ canCreate: true });
    expect(await screen.findByText("Bạn chưa có bài tập nào.")).toBeInTheDocument();
  });

  it("shows the no-match message when filters are active", async () => {
    mockItems([]);
    renderList({ canCreate: true });
    await screen.findByText("Bạn chưa có bài tập nào.");
    await userEvent.selectOptions(screen.getByLabelText("Loại"), "BONUS");
    expect(await screen.findByText("Không tìm thấy bài tập phù hợp.")).toBeInTheDocument();
    expect(assignmentsApi.listAssignments).toHaveBeenLastCalledWith(expect.objectContaining({ kind: "BONUS" }));
  });

  it("is scoped to a class in the class tab and can hide the create button", async () => {
    mockItems([ITEM]);
    renderList({ classId: "c1", canCreate: false });
    await screen.findByText("Độc tấu - Lý ngựa ô");
    expect(assignmentsApi.listAssignments).toHaveBeenCalledWith(expect.objectContaining({ classId: "c1" }));
    expect(screen.queryByLabelText("Lớp")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Tạo bài tập/ })).not.toBeInTheDocument();
    expect(screen.getByText("Lớp chưa có bài Hòa tấu.")).toBeInTheDocument();
  });

  it("shows the ensemble and solo slots above the other assignments in the class tab", async () => {
    mockItems([ITEM, { ...ITEM, id: "a2", title: "Bonus tuần 3", kind: "BONUS" }]);
    renderList({ classId: "c1", canCreate: true });
    await screen.findByText("Độc tấu - Lý ngựa ô");
    expect(screen.queryByLabelText("Loại")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Tạo bài Hòa tấu/ })).toHaveAttribute(
      "href",
      "/teacher/assignments/new?classId=c1&kind=ENSEMBLE"
    );
    expect(screen.queryByRole("link", { name: /Tạo bài Độc tấu/ })).not.toBeInTheDocument();
    const heading = screen.getByRole("heading", { name: "Bài tập khác" });
    expect(heading.compareDocumentPosition(screen.getByText("Bonus tuần 3"))).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(heading.compareDocumentPosition(screen.getByText("Độc tấu - Lý ngựa ô"))).toBe(
      Node.DOCUMENT_POSITION_PRECEDING
    );
  });
});
