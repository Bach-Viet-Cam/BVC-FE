import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AssignmentList } from "@/features/classes/components/AssignmentList";
import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import { type AssignmentOverview, type OverviewAssignment } from "@/features/classes/types/teacherAssignmentTypes";

vi.mock("@/features/classes/api/assignmentsApi", () => ({
  assignmentsApi: { getOverview: vi.fn(), assignToClasses: vi.fn(), listClassSheetMusic: vi.fn() },
}));
vi.mock("@/features/classes/api/classesApi", () => ({
  classesApi: {
    listClasses: vi.fn().mockResolvedValue({
      data: {
        data: {
          items: [{ id: "c1", name: "TRD301", status: "ACTIVE" }],
          pagination: { page: 1, limit: 200, total: 1 },
          activeCount: 1,
          cohorts: [],
        },
      },
    }),
  },
}));

const SEMESTER = { name: "HK1 2026-2027", startDate: "2026-09-01", endDate: "2027-01-15" };

function assignment(overrides: Partial<OverviewAssignment>): OverviewAssignment {
  return {
    id: "a1",
    classId: "c1",
    title: "Độc tấu - Lý ngựa ô",
    kind: "SOLO",
    status: "PUBLISHED",
    version: 1,
    sheetMusicId: "sh1",
    sheetTitle: "Lý ngựa ô",
    practiceCount: 5,
    submittedCount: 3,
    memberCount: 20,
    updatedAt: "2026-10-01T00:00:00.000Z",
    ...overrides,
  };
}

const OVERVIEW: AssignmentOverview = {
  semester: SEMESTER,
  emptyReason: null,
  classes: [
    {
      id: "c1",
      name: "TRD301",
      status: "ACTIVE",
      memberCount: 20,
      assignments: [
        assignment({}),
        assignment({ id: "a2", title: "Bonus tuần 3", kind: "BONUS", sheetMusicId: null, sheetTitle: null }),
      ],
    },
    {
      id: "c2",
      name: "TRD302",
      status: "ACTIVE",
      memberCount: 18,
      assignments: [
        assignment({
          id: "a3",
          classId: "c2",
          title: "Hòa tấu hò kéo pháo",
          kind: "ENSEMBLE",
          sheetMusicId: "sh2",
          sheetTitle: "Hò kéo pháo",
        }),
      ],
    },
  ],
};

function mockOverview(overview: AssignmentOverview) {
  vi.mocked(assignmentsApi.getOverview).mockResolvedValue({
    data: { data: overview, message: "", success: true },
  } as never);
}

const renderList = (props: { canCreate: boolean }, url = "/teacher/assignments") =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <AssignmentList {...props} />
    </MemoryRouter>
  );

describe("AssignmentList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("shows the semester chip, both tabs with counts and collapsed classes", async () => {
    mockOverview(OVERVIEW);
    renderList({ canCreate: true });
    expect(await screen.findByText("Học kỳ: HK1 2026-2027 (01/09 – 15/01)")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Theo lớp\s*2/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /Theo bài tập chung\s*2/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /TRD301/ })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Độc tấu - Lý ngựa ô")).not.toBeInTheDocument();
  });

  it("opens a class to show its assignments", async () => {
    mockOverview(OVERVIEW);
    renderList({ canCreate: true });
    await userEvent.click(await screen.findByRole("button", { name: /TRD301/ }));
    const row = screen.getByText("Độc tấu - Lý ngựa ô").closest("a") as HTMLElement;
    expect(row).toHaveAttribute("href", "/teacher/assignments/a1");
    expect(screen.getByText("Bonus tuần 3")).toBeInTheDocument();
  });

  it("groups assignments by sheet in the second tab and leaves out those without a sheet", async () => {
    mockOverview(OVERVIEW);
    renderList({ canCreate: true });
    await userEvent.click(await screen.findByRole("tab", { name: /Theo bài tập chung/ }));
    expect(screen.getByText("Bài tập theo sheet nhạc")).toBeInTheDocument();
    expect(screen.getByText("Hò kéo pháo")).toBeInTheDocument();
    expect(screen.queryByText("Bonus tuần 3")).not.toBeInTheDocument();
  });

  it("opens the classes that match the search and hides the others", async () => {
    mockOverview(OVERVIEW);
    renderList({ canCreate: true });
    await userEvent.type(await screen.findByRole("searchbox", { name: "Tìm bài tập" }), "ngua");
    expect(await screen.findByText("Độc tấu - Lý ngựa ô")).toBeInTheDocument();
    expect(screen.queryByText("Bonus tuần 3")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /TRD302/ })).not.toBeInTheDocument();
  });

  it("says when nothing matches the search", async () => {
    mockOverview(OVERVIEW);
    renderList({ canCreate: true });
    await userEvent.type(await screen.findByRole("searchbox", { name: "Tìm bài tập" }), "zzz");
    expect(await screen.findByText("Không có bài tập nào khớp “zzz”.")).toBeInTheDocument();
  });

  it("opens and scrolls to the class given in the URL", async () => {
    mockOverview(OVERVIEW);
    renderList({ canCreate: true }, "/teacher/assignments?class=c2");
    expect(await screen.findByText("Hòa tấu hò kéo pháo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /TRD302/ })).toHaveAttribute("aria-expanded", "true");
    await waitFor(() => expect(Element.prototype.scrollIntoView).toHaveBeenCalled());
  });

  it.each([
    ["NO_SEMESTER_CONFIGURED", "Chưa có học kỳ nào được cấu hình."],
    ["NO_CURRENT_SEMESTER", "không nằm trong học kỳ nào đã cấu hình"],
    ["NO_CLASSES_IN_SEMESTER", "Bạn chưa có lớp nào trong học kỳ HK1 2026-2027."],
  ] as const)("explains %s and blocks assigning", async (emptyReason, message) => {
    mockOverview({ semester: emptyReason === "NO_CLASSES_IN_SEMESTER" ? SEMESTER : null, emptyReason, classes: [] });
    renderList({ canCreate: true });
    expect(await screen.findByRole("status")).toHaveTextContent(message);
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gán bài tập cho lớp" })).toBeDisabled();
  });

  it("hides the action buttons when the lecturer cannot create", async () => {
    mockOverview(OVERVIEW);
    renderList({ canCreate: false });
    await screen.findByRole("tab", { name: /Theo lớp/ });
    expect(screen.queryByRole("button", { name: "Gán bài tập cho lớp" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Tạo bài tập/ })).not.toBeInTheDocument();
  });

  it("opens the create dialog and the assign dialog from the toolbar", async () => {
    mockOverview(OVERVIEW);
    renderList({ canCreate: true });
    await userEvent.click(await screen.findByRole("button", { name: /Tạo bài tập/ }));
    const createDialog = await screen.findByRole("dialog");
    expect(within(createDialog).getByRole("heading", { name: "Tạo bài tập" })).toBeInTheDocument();
  });

  it("opens the assign dialog", async () => {
    mockOverview(OVERVIEW);
    renderList({ canCreate: true });
    await userEvent.click(await screen.findByRole("button", { name: "Gán bài tập cho lớp" }));
    expect(await screen.findByRole("heading", { name: "Gán bài tập cho lớp" })).toBeInTheDocument();
  });
});
