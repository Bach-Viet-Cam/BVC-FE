import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { classesApi } from "@/features/classes/api/classesApi";
import { ClassListPage } from "@/features/classes/pages/ClassListPage";

vi.mock("@/features/classes/api/classesApi", () => ({ classesApi: { listClasses: vi.fn() } }));

const isMobile = vi.fn(() => false);
vi.mock("@/shared/hooks/use-mobile", () => ({ useIsMobile: () => isMobile() }));

const navigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

const CLASS_FA26 = {
  id: "c1",
  name: "TRD301 - Nhạc cụ truyền thống",
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
  name: "TRD101 - Nhập môn",
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
  beforeEach(() => {
    vi.clearAllMocks();
    isMobile.mockReturnValue(false);
  });

  it("lists the classes returned by the API with a one-line summary", async () => {
    mockClasses([CLASS_FA26, CLASS_SP26]);
    renderPage();
    expect(await screen.findByText("TRD301 - Nhạc cụ truyền thống")).toBeInTheDocument();
    expect(screen.getByText("TRD101 - Nhập môn")).toBeInTheDocument();
    expect(screen.getByText("2 lớp · 1 đang học · 25 sinh viên")).toBeInTheDocument();
    expect(classesApi.listClasses).toHaveBeenCalledWith(expect.objectContaining({ status: "ALL" }));
  });

  it("filters by cohort, status and name, and opens a class by clicking its row", async () => {
    mockClasses([CLASS_FA26, CLASS_SP26]);
    renderPage();
    await screen.findByText("TRD301 - Nhạc cụ truyền thống");
    await userEvent.selectOptions(screen.getByLabelText("Khóa"), "SP26");
    expect(screen.queryByText("TRD301 - Nhạc cụ truyền thống")).not.toBeInTheDocument();
    await userEvent.click(screen.getByText("SP26"));
    expect(navigate).toHaveBeenCalledWith("/teacher/classes/c2");
    expect(screen.getByRole("link", { name: "TRD101 - Nhập môn" })).toHaveAttribute("href", "/teacher/classes/c2");

    await userEvent.selectOptions(screen.getByLabelText("Khóa"), "ALL");
    await userEvent.selectOptions(screen.getByLabelText("Trạng thái"), "ACTIVE");
    expect(screen.queryByText("TRD101 - Nhập môn")).not.toBeInTheDocument();
    expect(screen.getByText("TRD301 - Nhạc cụ truyền thống")).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("Tìm tên lớp"), "nhập môn");
    expect(await screen.findByText("Không tìm thấy lớp phù hợp.")).toBeInTheDocument();
  });

  it("shows the empty message when the lecturer has no class", async () => {
    mockClasses([]);
    renderPage();
    expect(await screen.findByText("Bạn chưa có lớp học nào.")).toBeInTheDocument();
  });

  it("renders class cards instead of the table on a phone-width screen", async () => {
    isMobile.mockReturnValue(true);
    mockClasses([CLASS_FA26, CLASS_SP26]);
    renderPage();
    expect(await screen.findByText("TRD301 - Nhạc cụ truyền thống")).toBeInTheDocument();
    expect(screen.getByText("2 lớp · 1 đang học · 25 sinh viên")).toBeInTheDocument();
    expect(screen.queryByText("Tuần hiện tại")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /TRD301 - Nhạc cụ truyền thống/ })).toHaveAttribute(
      "href",
      "/teacher/classes/c1"
    );
    await userEvent.click(screen.getByRole("button", { name: "Tạo mới" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Tạo lớp học" })).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalledWith("/teacher/classes/new");
  });

  it("opens the file import dialog from the Nhập file SV button", async () => {
    mockClasses([CLASS_FA26]);
    renderPage();
    await userEvent.click(await screen.findByRole("button", { name: "Nhập file SV" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Nhập file SV" })).toBeInTheDocument();
  });

  it("shows the load error with a retry that refetches", async () => {
    vi.mocked(classesApi.listClasses).mockRejectedValueOnce(new Error("boom"));
    renderPage();
    expect(await screen.findByRole("alert")).toHaveTextContent("Tải dữ liệu thất bại");
    mockClasses([CLASS_FA26]);
    await userEvent.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(await screen.findByText("TRD301 - Nhạc cụ truyền thống")).toBeInTheDocument();
  });
});
