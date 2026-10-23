import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { progressApi } from "@/features/classes/api/progressApi";
import { ClassProgressBoard } from "@/features/classes/components/ClassProgressBoard";

vi.mock("@/features/classes/api/progressApi", () => ({ progressApi: { getProgress: vi.fn() } }));

const isMobile = vi.fn(() => false);
vi.mock("@/shared/hooks/use-mobile", () => ({ useIsMobile: () => isMobile() }));

const PROGRESS = {
  summary: { onTrack: 1, atRisk: 0, behind: 1 },
  items: [
    {
      userId: "u1",
      username: "Nguyễn An",
      studentCode: "HE001",
      submissionCount: 3,
      averageAccuracy: 82,
      status: "ON_TRACK",
    },
    {
      userId: "u2",
      username: "Trần Bình",
      studentCode: "HE002",
      submissionCount: 0,
      averageAccuracy: null,
      status: null,
    },
  ],
};

describe("ClassProgressBoard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isMobile.mockReturnValue(false);
    vi.mocked(progressApi.getProgress).mockResolvedValue({ data: { data: PROGRESS } } as never);
  });

  it("shows the class progress as a sortable table on web", async () => {
    render(<ClassProgressBoard classId="c1" />);
    expect(await screen.findByText("Nguyễn An")).toBeInTheDocument();
    expect(screen.getByText("82%")).toBeInTheDocument();
    expect(progressApi.getProgress).toHaveBeenCalledWith("c1", expect.objectContaining({ sortBy: "studentCode" }));

    await userEvent.click(screen.getByRole("button", { name: /Accuracy TB/ }));
    expect(progressApi.getProgress).toHaveBeenLastCalledWith(
      "c1",
      expect.objectContaining({ sortBy: "averageAccuracy", sortDir: "asc" })
    );
  });

  it("filters by status chip", async () => {
    render(<ClassProgressBoard classId="c1" />);
    await screen.findByText("Nguyễn An");
    await userEvent.click(screen.getByRole("button", { name: /Chậm tiến độ/ }));
    expect(progressApi.getProgress).toHaveBeenLastCalledWith("c1", expect.objectContaining({ status: "BEHIND" }));
  });

  it("renders one card per student with a sort picker on a phone", async () => {
    isMobile.mockReturnValue(true);
    render(<ClassProgressBoard classId="c1" />);
    expect(await screen.findByText("Nguyễn An")).toBeInTheDocument();
    expect(screen.getByText("3 bài nộp")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Accuracy TB/ })).not.toBeInTheDocument();

    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Sắp xếp" }), "averageAccuracy:desc");
    expect(progressApi.getProgress).toHaveBeenLastCalledWith(
      "c1",
      expect.objectContaining({ sortBy: "averageAccuracy", sortDir: "desc" })
    );
  });
});
