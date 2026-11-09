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
          items: [
            { id: "c1", name: "TRD301", status: "ACTIVE" },
            { id: "c9", name: "TRD101", status: "ENDED" },
          ],
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

const renderList = (props: { canCreate: boolean }, url = "/teacher/assignments") =>
  render(
    <MemoryRouter initialEntries={[url]}>
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
    await userEvent.click(screen.getByRole("button", { name: /Tạo bài tập/ }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Tạo bài tập" })).toBeInTheDocument();
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

  it("is scoped to the class in the URL and can hide the create button", async () => {
    mockItems([ITEM]);
    renderList({ canCreate: false }, "/teacher/assignments?class=c1");
    await screen.findByText("Độc tấu - Lý ngựa ô");
    expect(assignmentsApi.listAssignments).toHaveBeenCalledWith(expect.objectContaining({ classId: "c1" }));
    expect(await screen.findByLabelText("Lớp")).toHaveValue("c1");
    expect(screen.getByRole("link", { name: /Mở trang lớp/ })).toHaveAttribute("href", "/teacher/classes/c1");
    expect(screen.queryByRole("button", { name: /Tạo bài tập/ })).not.toBeInTheDocument();
    expect(screen.getByText("Lớp chưa có bài Hòa tấu.")).toBeInTheDocument();
  });

  it("switches to the class view when a class is picked and back when cleared", async () => {
    mockItems([ITEM]);
    renderList({ canCreate: true });
    await screen.findByText("Độc tấu - Lý ngựa ô");
    expect(screen.queryByRole("heading", { name: "Bài tập khác" })).not.toBeInTheDocument();
    await userEvent.selectOptions(await screen.findByLabelText("Lớp"), "c1");
    expect(await screen.findByRole("heading", { name: "Bài tập khác" })).toBeInTheDocument();
    expect(assignmentsApi.listAssignments).toHaveBeenLastCalledWith(expect.objectContaining({ classId: "c1" }));
    await userEvent.selectOptions(screen.getByLabelText("Lớp"), "ALL");
    expect(screen.queryByRole("heading", { name: "Bài tập khác" })).not.toBeInTheDocument();
  });

  it("does not offer to create into the empty slots of an ended class", async () => {
    mockItems([]);
    renderList({ canCreate: true }, "/teacher/assignments?class=c9");
    expect(await screen.findByText("Lớp chưa có bài Hòa tấu.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Tạo bài Hòa tấu/ })).not.toBeInTheDocument();
  });

  it("shows the ensemble and solo slots above the other assignments for a class", async () => {
    mockItems([ITEM, { ...ITEM, id: "a2", title: "Bonus tuần 3", kind: "BONUS" }]);
    renderList({ canCreate: true }, "/teacher/assignments?class=c1");
    await screen.findByText("Độc tấu - Lý ngựa ô");
    expect(screen.queryByLabelText("Loại")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Tạo bài Độc tấu/ })).not.toBeInTheDocument();
    const heading = screen.getByRole("heading", { name: "Bài tập khác" });
    expect(heading.compareDocumentPosition(screen.getByText("Bonus tuần 3"))).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(heading.compareDocumentPosition(screen.getByText("Độc tấu - Lý ngựa ô"))).toBe(
      Node.DOCUMENT_POSITION_PRECEDING
    );
    await userEvent.click(await screen.findByRole("button", { name: /Tạo bài Hòa tấu/ }));
    const dialog = await screen.findByRole("dialog");
    expect(await within(dialog).findByLabelText(/Loại/)).toHaveValue("ENSEMBLE");
  });
});
