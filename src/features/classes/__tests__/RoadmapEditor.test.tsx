import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RoadmapEditor } from "@/features/classes/components/RoadmapEditor";
import { type RoadmapVersion } from "@/features/classes/types/roadmapTypes";

vi.mock("@/features/classes/api/roadmapsApi", () => ({
  roadmapsApi: {
    listFingerExercises: vi.fn().mockResolvedValue({
      data: { data: [{ id: "p3", title: "Luyện ngón — Láy", defaultBpm: null }], message: "", success: true },
    }),
  },
}));

function buildRoadmap(overrides: Partial<RoadmapVersion> = {}): RoadmapVersion {
  return {
    id: "r1",
    instrument: { id: "i1", name: "Đàn tranh" },
    version: 2,
    isTemplate: false,
    createdAt: "2026-10-16T03:00:00.000Z",
    weeks: [1, 2, 3, 4, 5, 6].map((weekNumber) => ({
      weekNumber,
      title: `Tuần số ${weekNumber}`,
      content: `Nội dung ${weekNumber}`,
      exercises:
        weekNumber === 1
          ? [
              { pieceId: "p1", title: "Gẩy đơn", isAvailable: true },
              { pieceId: "p2", title: "Vê", isAvailable: true },
            ]
          : [],
    })),
    ...overrides,
  };
}

function renderEditor(roadmap: RoadmapVersion = buildRoadmap(), onSave = vi.fn().mockResolvedValue(null)) {
  render(<RoadmapEditor roadmap={roadmap} isSaving={false} onSave={onSave} />);
  return onSave;
}

const week = (weekNumber: number) => screen.getByRole("region", { name: `Tuần ${weekNumber}` });
const exerciseTitles = (weekNumber: number) =>
  within(week(weekNumber))
    .queryAllByTestId("roadmap-exercise-title")
    .map((element) => element.textContent);

describe("RoadmapEditor", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows MSG-35 under the blank week title and does not call onSave", async () => {
    const onSave = renderEditor();
    await userEvent.clear(within(week(1)).getByLabelText("Tiêu đề"));
    await userEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(await within(week(1)).findByText("Tiêu đề tuần 1 không được để trống.")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("moves an exercise down and up", async () => {
    const onSave = renderEditor();
    await userEvent.click(within(week(1)).getByRole("button", { name: "Đưa Gẩy đơn xuống" }));
    expect(exerciseTitles(1)).toEqual(["Vê", "Gẩy đơn"]);
    await userEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        weeks: expect.arrayContaining([expect.objectContaining({ weekNumber: 1, exerciseIds: ["p2", "p1"] })]),
      })
    );

    await userEvent.click(within(week(1)).getByRole("button", { name: "Đưa Gẩy đơn lên" }));
    expect(exerciseTitles(1)).toEqual(["Gẩy đơn", "Vê"]);
  });

  it("sends the loaded version as baseVersion (null for the standard framework)", async () => {
    const onSave = renderEditor();
    await userEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ baseVersion: 2 }));
  });

  it("sends baseVersion null when saving the standard framework", async () => {
    const onSave = renderEditor(buildRoadmap({ id: null, version: null, isTemplate: true, createdAt: null }));
    await userEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ baseVersion: null }));
  });

  it("removes an exercise and Hủy restores it", async () => {
    renderEditor();
    await userEvent.click(within(week(1)).getByRole("button", { name: "Xóa Vê" }));
    expect(exerciseTitles(1)).toEqual(["Gẩy đơn"]);
    await userEvent.click(screen.getByRole("button", { name: "Hủy" }));
    expect(exerciseTitles(1)).toEqual(["Gẩy đơn", "Vê"]);
  });

  it("adds exercises from the picker", async () => {
    renderEditor();
    await userEvent.click(within(week(2)).getByRole("button", { name: "Thêm bài luyện ngón" }));
    await userEvent.click(await screen.findByRole("checkbox", { name: "Luyện ngón — Láy" }));
    await userEvent.click(screen.getByRole("button", { name: "Thêm" }));
    expect(exerciseTitles(2)).toEqual(["Luyện ngón — Láy"]);
  });

  it("shows the unavailable warning and MSG-48 for an unavailable exercise", async () => {
    const roadmap = buildRoadmap();
    roadmap.weeks[2].exercises = [{ pieceId: "old", title: "Bản cũ", isAvailable: false }];
    const onSave = renderEditor(roadmap);
    expect(within(week(3)).getByText("Không còn khả dụng")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(
      await within(week(3)).findByText(
        "Bài luyện ngón đã chọn không còn khả dụng trong thư viện. Vui lòng chọn mục khác."
      )
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("maps server error weeks.2.content under week 2 content", async () => {
    renderEditor(
      buildRoadmap(),
      vi.fn().mockResolvedValue([
        {
          field: "weeks.2.content",
          code: "MSG-37",
          message: "Nội dung học tập tuần 2 không được vượt quá 1000 ký tự.",
        },
      ])
    );
    await userEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(
      await within(week(2)).findByText("Nội dung học tập tuần 2 không được vượt quá 1000 ký tự.")
    ).toBeInTheDocument();
  });

  it("template roadmap shows 'Chưa có lộ trình · khởi tạo từ khung chuẩn'", () => {
    renderEditor(buildRoadmap({ id: null, version: null, isTemplate: true, createdAt: null }));
    expect(screen.getByText("Chưa có lộ trình · khởi tạo từ khung chuẩn")).toBeInTheDocument();
  });
});
