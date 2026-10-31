import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import { classesApi } from "@/features/classes/api/classesApi";
import { progressApi } from "@/features/classes/api/progressApi";
import { AttentionStudentsPage } from "@/features/classes/pages/AttentionStudentsPage";
import { TodaySubmissionsPage } from "@/features/classes/pages/TodaySubmissionsPage";

vi.mock("@/features/classes/api/classesApi", () => ({ classesApi: { listClasses: vi.fn() } }));
vi.mock("@/features/classes/api/progressApi", () => ({ progressApi: { getProgress: vi.fn() } }));
vi.mock("@/features/classes/api/assignmentsApi", () => ({
  assignmentsApi: { listAssignments: vi.fn(), getAssignment: vi.fn() },
}));

const navigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

const cls = (id: string, name: string, cohort: string) => ({
  id,
  name,
  cohort,
  status: "ACTIVE",
  instrument: { id: "i1", name: "Đàn tranh" },
  startDate: "2026-10-01",
  endDate: "2026-11-12",
  memberCount: 10,
});
const CLASSES = [cls("c1", "TRD301", "FA26"), cls("c2", "TRD302", "FA26"), cls("c3", "TRD101", "SU26")];

const student = (userId: string, username: string, status: string, averageAccuracy: number | null) => ({
  userId,
  username,
  studentCode: `SE${userId}`,
  submissionCount: 1,
  averageAccuracy,
  status,
});
const PROGRESS: Record<string, ReturnType<typeof student>[]> = {
  c1: [student("1", "Nguyễn Văn Đức", "BEHIND", 30), student("2", "Trần An", "ON_TRACK", 90)],
  c2: [student("3", "Lê Bình", "AT_RISK", 65)],
  c3: [],
};

// c1: solo 2 today, ensemble 1 today · c2: solo, nobody today · c3: no assignment.
const ASSIGNMENTS = [
  { id: "a1", classId: "c1", kind: "SOLO", students: ["today", "today", null] },
  { id: "a2", classId: "c1", kind: "ENSEMBLE", students: ["today", null] },
  { id: "a3", classId: "c2", kind: "SOLO", students: [null] },
];

function mockApis() {
  vi.mocked(classesApi.listClasses).mockResolvedValue({
    data: {
      data: {
        items: CLASSES,
        pagination: { page: 1, limit: 200, total: 3 },
        activeCount: 3,
        cohorts: ["FA26", "SU26"],
      },
    },
  } as never);
  vi.mocked(progressApi.getProgress).mockImplementation((async (classId: string) => ({
    data: { data: { summary: { onTrack: 0, atRisk: 0, behind: 0 }, items: PROGRESS[classId] } },
  })) as never);
  vi.mocked(assignmentsApi.listAssignments).mockResolvedValue({
    data: { data: { items: ASSIGNMENTS, pagination: { page: 1, limit: 100, total: 3 } } },
  } as never);
  vi.mocked(assignmentsApi.getAssignment).mockImplementation((async (id: string) => {
    const item = ASSIGNMENTS.find((assignment) => assignment.id === id)!;
    const students = item.students.map((day, index) => ({
      studentId: `s${index}`,
      lastSubmittedAt: day ? new Date().toISOString() : null,
    }));
    return { data: { data: { ...item, students } } };
  }) as never);
}

const renderPage = (page: React.ReactNode) => render(<MemoryRouter>{page}</MemoryRouter>);
const rowNames = () => screen.getAllByRole("listitem").map((row) => row.textContent);

describe("AttentionStudentsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApis();
  });

  it("lists every student to watch with accent-insensitive search and class / status filters", async () => {
    renderPage(<AttentionStudentsPage />);
    expect(await screen.findByText("Nguyễn Văn Đức")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.queryByText("Trần An")).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("Tìm theo tên hoặc mã sinh viên"), "duc");
    expect(rowNames()).toEqual([expect.stringContaining("Nguyễn Văn Đức")]);
    await userEvent.clear(screen.getByLabelText("Tìm theo tên hoặc mã sinh viên"));

    // The class filter is an autocomplete: typing narrows the options, picking one filters the list.
    const classInput = screen.getByRole("combobox", { name: "Lớp" });
    await userEvent.type(classInput, "302");
    const options = await screen.findAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual(["TRD302"]);
    await userEvent.click(options[0]);
    expect(classInput).toHaveValue("TRD302");
    expect(rowNames()).toEqual([expect.stringContaining("Lê Bình")]);
    await userEvent.selectOptions(screen.getByLabelText("Trạng thái"), "BEHIND");
    expect(screen.getByText("Không có sinh viên nào khớp bộ lọc.")).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText("Trạng thái"), "ALL");
    await userEvent.click(screen.getByRole("button", { name: "Bỏ lọc lớp" }));
    expect(classInput).toHaveValue("");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("opens the student's history and remembers to come back to the list", async () => {
    renderPage(<AttentionStudentsPage />);
    await userEvent.click(await screen.findByText("Lê Bình"));
    expect(navigate).toHaveBeenCalledWith("/teacher/classes/c2/students/3", {
      state: { from: "/teacher/attention-students" },
    });
  });
});

describe("TodaySubmissionsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApis();
  });

  it("lists every running class, most submitters first, with search and cohort / activity filters", async () => {
    renderPage(<TodaySubmissionsPage />);
    expect(await screen.findByText("TRD301")).toBeInTheDocument();
    expect(rowNames().map((text) => text?.slice(0, 6))).toEqual(["TRD301", "TRD101", "TRD302"]);

    const first = screen.getAllByRole("listitem")[0];
    expect(within(first).getByText("Độc tấu").nextElementSibling).toHaveTextContent("2/10");
    expect(within(first).getByText("Hòa tấu").nextElementSibling).toHaveTextContent("1/10");
    expect(screen.getByText("3 lớp · 2 sinh viên nộp Độc tấu · 1 sinh viên nộp Hòa tấu")).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText("Tình trạng"), "NONE");
    expect(rowNames().map((text) => text?.slice(0, 6))).toEqual(["TRD101", "TRD302"]);
    const cohortInput = screen.getByRole("combobox", { name: "Kỳ" });
    await userEvent.type(cohortInput, "su");
    const options = await screen.findAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual(["SU26"]);
    await userEvent.click(options[0]);
    expect(rowNames().map((text) => text?.slice(0, 6))).toEqual(["TRD101"]);

    await userEvent.type(screen.getByLabelText("Tìm theo tên lớp"), "302");
    expect(screen.getByText("Không có lớp nào khớp bộ lọc.")).toBeInTheDocument();
  });
});
