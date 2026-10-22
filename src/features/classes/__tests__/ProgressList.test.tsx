import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProgressList } from "@/features/classes/components/ProgressList";
import { progressApi } from "@/features/classes/api/progressApi";

vi.mock("@/features/classes/api/progressApi", () => ({ progressApi: { getClassProgress: vi.fn() } }));

const STUDENTS = [
  {
    studentId: "s1",
    fullName: "An Giỏi",
    studentCode: "SE1",
    average: 80,
    status: "ON_TRACK",
    assignmentsWithSubmissions: 2,
    lastSubmittedAt: "2026-10-16T02:30:00.000Z",
  },
  {
    studentId: "s2",
    fullName: "Bình Trung",
    studentCode: "SE2",
    average: 50,
    status: "AT_RISK",
    assignmentsWithSubmissions: 1,
    lastSubmittedAt: "2026-10-15T02:30:00.000Z",
  },
  {
    studentId: "s3",
    fullName: "Cường Yếu",
    studentCode: "SE3",
    average: 20,
    status: "BEHIND",
    assignmentsWithSubmissions: 1,
    lastSubmittedAt: null,
  },
  {
    studentId: "s4",
    fullName: "Dung",
    studentCode: "SE4",
    average: null,
    status: null,
    assignmentsWithSubmissions: 0,
    lastSubmittedAt: null,
  },
];

function mockProgress(students: unknown[], counts = { ON_TRACK: 1, AT_RISK: 1, BEHIND: 1, NO_DATA: 1 }) {
  vi.mocked(progressApi.getClassProgress).mockResolvedValue({
    data: { data: { counts, students }, message: "", success: true },
  } as never);
}

const renderList = () =>
  render(
    <MemoryRouter>
      <ProgressList classId="c1" />
    </MemoryRouter>
  );

const rowNames = () => screen.queryAllByTestId("progress-row-name").map((element) => element.textContent);

describe("ProgressList", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows the four counters and links rows to the student page", async () => {
    mockProgress(STUDENTS);
    renderList();
    expect(await screen.findByText("Đúng tiến độ 1")).toBeInTheDocument();
    expect(screen.getByText("Có nguy cơ 1")).toBeInTheDocument();
    expect(screen.getByText("Chậm tiến độ 1")).toBeInTheDocument();
    expect(screen.getByText("Chưa có dữ liệu 1")).toBeInTheDocument();
    expect(screen.getByText("An Giỏi").closest("a")).toHaveAttribute("href", "/teacher/classes/c1/students/s1");
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("filters by status and hides students without status", async () => {
    mockProgress(STUDENTS);
    renderList();
    await screen.findByText("An Giỏi");
    await userEvent.selectOptions(screen.getByLabelText("Trạng thái tiến độ"), "AT_RISK");
    expect(rowNames()).toEqual(["Bình Trung"]);
  });

  it("searches by code and sorts by average descending", async () => {
    mockProgress(STUDENTS);
    renderList();
    await screen.findByText("An Giỏi");
    await userEvent.selectOptions(screen.getByLabelText("Sắp xếp"), "average");
    await userEvent.click(screen.getByRole("button", { name: "Tăng dần" }));
    expect(rowNames()).toEqual(["An Giỏi", "Bình Trung", "Cường Yếu", "Dung"]);
    await userEvent.type(screen.getByLabelText("Mã hoặc tên sinh viên"), "se3");
    expect(await screen.findByText("Cường Yếu")).toBeInTheDocument();
    await vi.waitFor(() => expect(rowNames()).toEqual(["Cường Yếu"]));
  });

  it("shows empty and no-match messages", async () => {
    mockProgress([], { ON_TRACK: 0, AT_RISK: 0, BEHIND: 0, NO_DATA: 0 });
    renderList();
    expect(await screen.findByText("Lớp chưa có sinh viên.")).toBeInTheDocument();
  });

  it("shows the no-match message when filters exclude everyone", async () => {
    mockProgress([STUDENTS[0]], { ON_TRACK: 1, AT_RISK: 0, BEHIND: 0, NO_DATA: 0 });
    renderList();
    await screen.findByText("An Giỏi");
    await userEvent.selectOptions(screen.getByLabelText("Trạng thái tiến độ"), "BEHIND");
    expect(screen.getByText("Không tìm thấy sinh viên phù hợp.")).toBeInTheDocument();
  });

  it("does not show the previous class while another class fails to load", async () => {
    mockProgress(STUDENTS);
    const view = renderList();
    await screen.findByText("An Giỏi");
    vi.mocked(progressApi.getClassProgress).mockRejectedValueOnce(new Error("network"));
    view.rerender(
      <MemoryRouter>
        <ProgressList classId="c2" />
      </MemoryRouter>
    );
    expect(await screen.findByText("Tải dữ liệu thất bại. Vui lòng thử lại.")).toBeInTheDocument();
    expect(screen.queryByText("An Giỏi")).not.toBeInTheDocument();
    expect(screen.queryByText("Đúng tiến độ 1")).not.toBeInTheDocument();
  });
});
