import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { classesApi } from "@/features/classes/api/classesApi";
import { ClassListPage } from "@/features/classes/pages/ClassListPage";

vi.mock("@/features/classes/api/classesApi", () => ({ classesApi: { listClasses: vi.fn() } }));

const navigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

const CLASS_FA26 = {
  id: "c1",
  name: "TRD301 — Nhạc cụ truyền thống",
  cohort: "FA26",
  status: "ACTIVE",
  instrument: { id: "i1", name: "Đàn tranh" },
  startDate: "2999-01-01",
  endDate: "2999-02-12",
  memberCount: 20,
};
const CLASS_SP26 = {
  ...CLASS_FA26,
  id: "c2",
  name: "TRD101 — Nhập môn",
  cohort: "SP26",
  status: "ENDED",
  memberCount: 5,
};

function mockClasses(items: unknown[]) {
  vi.mocked(classesApi.listClasses).mockResolvedValue({
    data: {
      data: {
        items,
        pagination: { page: 1, limit: 200, total: items.length },
        activeCount: items.filter((item) => (item as { status: string }).status === "ACTIVE").length,
        cohorts: [...new Set(items.map((item) => (item as { cohort: string }).cohort))],
      },
    },
  } as never);
}

const renderPage = () =>
  render(
    <MemoryRouter>
      <ClassListPage />
    </MemoryRouter>
  );

describe("ClassListPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists the classes returned by the API with stats computed from them", async () => {
    mockClasses([CLASS_FA26, CLASS_SP26]);
    renderPage();
    expect(await screen.findByText("TRD301 — Nhạc cụ truyền thống")).toBeInTheDocument();
    expect(screen.getByText("TRD101 — Nhập môn")).toBeInTheDocument();
    expect(within(screen.getByText("Tổng lớp").parentElement as HTMLElement).getByText("2")).toBeInTheDocument();
    expect(within(screen.getByText("Sinh viên").parentElement as HTMLElement).getByText("25")).toBeInTheDocument();
    expect(classesApi.listClasses).toHaveBeenCalledWith(expect.objectContaining({ status: "ALL" }));
  });

  it("filters by cohort chip and opens a class by its id", async () => {
    mockClasses([CLASS_FA26, CLASS_SP26]);
    renderPage();
    await screen.findByText("TRD301 — Nhạc cụ truyền thống");
    await userEvent.click(screen.getByRole("button", { name: "SP26" }));
    expect(screen.queryByText("TRD301 — Nhạc cụ truyền thống")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Xem lớp" }));
    expect(navigate).toHaveBeenCalledWith("/teacher/classes/c2");
  });

  it("shows the empty message when the lecturer has no class", async () => {
    mockClasses([]);
    renderPage();
    expect(await screen.findByText("Bạn chưa có lớp học nào.")).toBeInTheDocument();
  });

  it("shows the load error with a retry that refetches", async () => {
    vi.mocked(classesApi.listClasses).mockRejectedValueOnce(new Error("boom"));
    renderPage();
    expect(await screen.findByRole("alert")).toHaveTextContent("Tải dữ liệu thất bại");
    mockClasses([CLASS_FA26]);
    await userEvent.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(await screen.findByText("TRD301 — Nhạc cụ truyền thống")).toBeInTheDocument();
  });
});
