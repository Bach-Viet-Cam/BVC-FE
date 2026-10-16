import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RoadmapTab } from "@/features/classes/components/RoadmapTab";
import { roadmapsApi } from "@/features/classes/api/roadmapsApi";
import { type ClassRoadmap, type RoadmapWeekStatus } from "@/features/classes/types/roadmapTypes";

vi.mock("@/features/classes/api/roadmapsApi", () => ({ roadmapsApi: { getClassRoadmap: vi.fn() } }));

const STATUSES: RoadmapWeekStatus[] = ["PAST", "CURRENT", "UPCOMING", "UPCOMING", "UPCOMING", "UPCOMING"];

function mockRoadmap(classRoadmap: ClassRoadmap) {
  vi.mocked(roadmapsApi.getClassRoadmap).mockResolvedValue({
    data: { data: classRoadmap, message: "", success: true },
  } as never);
}

const roadmapWithWeeks: ClassRoadmap = {
  roadmap: {
    id: "r1",
    version: 3,
    weeks: STATUSES.map((status, index) => ({
      weekNumber: index + 1,
      title: `Chủ đề ${index + 1}`,
      content: index === 0 ? "Dòng một\nDòng hai" : `Nội dung ${index + 1}`,
      startDate: `2026-09-0${index + 1}`,
      endDate: `2026-09-1${index}`,
      status,
      exercises:
        index === 0
          ? [
              { pieceId: "p1", title: "Gẩy đơn", isAvailable: true },
              { pieceId: "p2", title: "Bản cũ", isAvailable: false },
            ]
          : [],
      assignments: [],
    })),
  },
};

describe("RoadmapTab", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows the no-roadmap message", async () => {
    mockRoadmap({ roadmap: null });
    render(<RoadmapTab classId="c1" />);
    expect(
      await screen.findByText(
        "Lớp chưa có lộ trình. Lộ trình sẽ được gắn khi quản trị viên tạo lộ trình cho nhạc cụ này."
      )
    ).toBeInTheDocument();
  });

  it("renders 6 week cards with dd/mm range, status labels and 'Tuần này' highlighted", async () => {
    mockRoadmap(roadmapWithWeeks);
    render(<RoadmapTab classId="c1" />);
    expect(await screen.findByText("Lộ trình · Phiên bản v3")).toBeInTheDocument();
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(6);
    expect(within(cards[0]).getByText("Tuần 1 · Chủ đề 1")).toBeInTheDocument();
    expect(within(cards[0]).getByText("01/09 – 10/09/2026")).toBeInTheDocument();
    expect(within(cards[0]).getByText("Đã qua")).toBeInTheDocument();
    expect(within(cards[1]).getByText("Tuần này")).toBeInTheDocument();
    expect(within(cards[2]).getByText("Sắp tới")).toBeInTheDocument();
    expect(cards[1]).toHaveAttribute("aria-current", "true");
    expect(cards[0]).not.toHaveAttribute("aria-current");
  });

  it("lists exercises and marks unavailable ones 'Không còn khả dụng'", async () => {
    mockRoadmap(roadmapWithWeeks);
    render(<RoadmapTab classId="c1" />);
    const firstCard = (await screen.findAllByRole("article"))[0];
    expect(within(firstCard).getByText("Gẩy đơn")).toBeInTheDocument();
    expect(within(firstCard).getByText("Bản cũ")).toBeInTheDocument();
    expect(within(firstCard).getByText("Không còn khả dụng")).toBeInTheDocument();
  });

  it("keeps line breaks in content", async () => {
    mockRoadmap(roadmapWithWeeks);
    render(<RoadmapTab classId="c1" />);
    const content = await screen.findByText(/Dòng một/);
    expect(content).toHaveClass("whitespace-pre-line");
  });
});
