import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { classesApi } from "@/features/classes/api/classesApi";
import { roadmapsApi } from "@/features/classes/api/roadmapsApi";
import { RoadmapPage } from "@/features/classes/pages/RoadmapPage";
import { type ClassRoadmap } from "@/features/classes/types/roadmapTypes";

vi.mock("@/features/classes/api/classesApi", () => ({ classesApi: { listClasses: vi.fn() } }));
vi.mock("@/features/classes/api/roadmapsApi", () => ({ roadmapsApi: { getClassRoadmap: vi.fn() } }));

const makeClass = (id: string, name: string, status: "ACTIVE" | "ENDED") => ({
  id,
  name,
  cohort: "FA26",
  status,
  instrument: { id: "i1", name: "Đàn tranh" },
  startDate: "2026-09-30",
  endDate: "2026-11-11",
  memberCount: 20,
});
const ACTIVE = makeClass("c1", "TRD301", "ACTIVE");
const FINISHED = makeClass("c2", "TRD201", "ENDED");

const ROADMAP: ClassRoadmap = {
  roadmap: {
    id: "r1",
    version: 2,
    weeks: [
      {
        weekNumber: 1,
        title: "Làm quen nhạc cụ",
        content: "Tư thế ngồi",
        startDate: "2026-09-30",
        endDate: "2026-10-06",
        status: "PAST",
        exercises: [{ pieceId: "p1", title: "Gẩy đơn", isAvailable: true }],
      },
      {
        weekNumber: 2,
        title: "Kỹ thuật cơ bản",
        content: "Luyện ngón",
        startDate: "2026-10-07",
        endDate: "2026-10-13",
        status: "CURRENT",
        exercises: [{ pieceId: "p2", title: "Vê", isAvailable: false }],
      },
    ],
  },
};

function mockApis(classes: unknown[], roadmap: ClassRoadmap = ROADMAP) {
  vi.mocked(classesApi.listClasses).mockResolvedValue({
    data: {
      data: {
        items: classes,
        pagination: { page: 1, limit: 200, total: classes.length },
        activeCount: 1,
        cohorts: ["FA26"],
      },
    },
  } as never);
  vi.mocked(roadmapsApi.getClassRoadmap).mockResolvedValue({ data: { data: roadmap } } as never);
}

describe("RoadmapPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows the roadmap of the first running class with its weeks and exercises", async () => {
    mockApis([FINISHED, ACTIVE]);
    render(<RoadmapPage />);
    expect(await screen.findByText("Làm quen nhạc cụ")).toBeInTheDocument();
    expect(roadmapsApi.getClassRoadmap).toHaveBeenCalledWith("c1");
    expect(screen.getByText("Phiên bản v2")).toBeInTheDocument();
    const row = screen.getByText("Không còn khả dụng").closest("div") as HTMLElement;
    expect(within(row).getByText("Vê")).toBeInTheDocument();
    expect(within(row).getByText("Tuần này")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Lưu thay đổi" })).not.toBeInTheDocument();
  });

  it("loads another class when it is picked", async () => {
    mockApis([ACTIVE, FINISHED]);
    render(<RoadmapPage />);
    await screen.findByText("Làm quen nhạc cụ");
    await userEvent.selectOptions(screen.getByLabelText("Chọn lớp"), "c2");
    expect(roadmapsApi.getClassRoadmap).toHaveBeenLastCalledWith("c2");
  });

  it("explains a finished class without roadmap", async () => {
    mockApis([FINISHED], { roadmap: null });
    render(<RoadmapPage />);
    expect(await screen.findByText("Lớp đã kết thúc và không có lộ trình.")).toBeInTheDocument();
  });

  it("explains a running class without roadmap, and a lecturer without class", async () => {
    mockApis([ACTIVE], { roadmap: null });
    const { unmount } = render(<RoadmapPage />);
    expect(await screen.findByText(/Lớp chưa có lộ trình/)).toBeInTheDocument();
    unmount();
    mockApis([]);
    render(<RoadmapPage />);
    expect(await screen.findByText("Bạn chưa có lớp nào.")).toBeInTheDocument();
    expect(roadmapsApi.getClassRoadmap).toHaveBeenCalledTimes(1);
  });

  it("shows the load error with a retry that refetches", async () => {
    mockApis([ACTIVE]);
    vi.mocked(classesApi.listClasses).mockRejectedValueOnce(new Error("boom"));
    render(<RoadmapPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Tải dữ liệu thất bại");
    await userEvent.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(await screen.findByText("Làm quen nhạc cụ")).toBeInTheDocument();
  });
});
