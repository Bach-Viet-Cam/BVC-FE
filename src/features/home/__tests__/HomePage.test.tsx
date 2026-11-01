import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HomePage } from "@/features/home/pages/HomePage";
import type { StudentDashboard } from "@/features/home/types/homeTypes";

const user = { userId: "u1", username: "Minh", email: "minh@example.com", role: 1 };
vi.mock("@/shared/context/AuthContext", () => ({ useAuth: () => ({ user }) }));
vi.mock("@/shared/components/bvc/StudentShell", () => ({
  StudentShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/features/classes/hooks/useMyAssignments", () => ({
  useMyAssignments: () => ({ items: assignments, isLoading: false, error: null }),
}));
vi.mock("@/features/home/hooks/useStudentDashboard", () => ({
  useStudentDashboard: () => ({
    dashboard,
    isLoading: false,
    error: null,
    reload: vi.fn(),
    recentSubmissions,
    isRecentLoading: false,
    recentError: null,
  }),
}));
vi.mock("@/features/music-library/hooks/useTrendingSongs", () => ({
  useTrendingSongs: () => ({ songs: [], error: null, isFirstLoad: false }),
}));
vi.mock("@/features/music-library/hooks/useLibrarySongs", () => ({
  useLibrarySongs: () => ({
    result: {
      data: [
        {
          id: "p1",
          title: "Lý ngựa ô",
          composer: "",
          description: "",
          genre: { id: "g", name: "Dân ca" },
          instruments: [],
          instrumentCount: 2,
          coverTone: "ink",
          visibility: "PUBLIC",
          createdAt: "",
          updatedAt: "",
          isSaved: false,
        },
      ],
    },
  }),
}));

const emptyMode = { completed: 0, points: [], latestAccuracy: null, averageAccuracy: null, deltaPercent: null };
const days = Array.from({ length: 7 }, (_, index) => ({
  date: `2026-10-${16 + index}`,
  submitted: index === 6 ? 2 : 0,
  averageAccuracy: index === 6 ? 80 : null,
}));

let dashboard: StudentDashboard | null;
let assignments: unknown[];
let recentSubmissions: unknown[];

function renderPage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
}

describe("HomePage", () => {
  beforeEach(() => {
    assignments = [
      { id: "a1", title: "Bài 1", className: "Lớp A", status: "NOT_SUBMITTED", deadline: "2026-11-05T10:00:00Z" },
      { id: "a2", title: "Bài 2", className: "Lớp A", status: "PASSED", deadline: "2026-10-05T10:00:00Z" },
    ];
    recentSubmissions = [];
  });

  it("shows today's stats, recent submissions and assignment highlights when the student has submitted", () => {
    dashboard = {
      totalSubmissions: 5,
      today: { submitted: 2, completed: 2, bestAccuracy: 90, averageAccuracy: 80 },
      recentDays: days,
      mostSubmittedAssignment: {
        assignmentId: "a2",
        title: "Bài 2",
        submissionCount: 4,
        firstAccuracy: 60,
        latestAccuracy: 75,
        deltaPercent: 15,
      },
      mostImprovedAssignment: {
        assignmentId: "a2",
        title: "Bài 2",
        submissionCount: 4,
        firstAccuracy: 60,
        latestAccuracy: 75,
        deltaPercent: 15,
      },
      solo: {
        completed: 3,
        points: [
          { accuracy: 60, submittedAt: "2026-10-20T03:00:00Z" },
          { accuracy: 75, submittedAt: "2026-10-22T03:00:00Z" },
        ],
        latestAccuracy: 75,
        averageAccuracy: 67.5,
        deltaPercent: 15,
      },
      ensemble: emptyMode,
    };
    recentSubmissions = [
      {
        id: "s1",
        pieceId: "p1",
        pieceTitle: "Lý ngựa ô",
        sheetMusicId: null,
        assignmentId: null,
        submittedAt: "2026-10-22T03:00:00Z",
        status: "COMPLETED",
        accuracy: 88,
        kind: "PRACTICE",
      },
    ];
    renderPage();

    expect(screen.getByText("Điểm cao nhất").nextSibling).toHaveTextContent("90%");
    expect(screen.getByRole("link", { name: /Lý ngựa ô/ })).toHaveAttribute("href", "/practice/submissions/s1");
    expect(screen.getAllByRole("link", { name: "Xem tất cả" })[0]).toHaveAttribute("href", "/practice/submissions");
    const summary = screen.getByRole("region", { name: "Tổng hợp bài tập" });
    expect(within(summary).getByText("1 đạt · 0 đã nộp · 1 chưa nộp")).toBeInTheDocument();
    expect(within(summary).getByText("4 lần nộp")).toBeInTheDocument();
    expect(within(summary).getAllByText("+15%").length).toBeGreaterThan(0);
    expect(within(summary).getByText("Chưa có bài hòa tấu nào được chấm.", { exact: false })).toBeInTheDocument();
  });

  it("points a student without any submission to the library instead of empty stats", () => {
    dashboard = {
      totalSubmissions: 0,
      today: { submitted: 0, completed: 0, bestAccuracy: null, averageAccuracy: null },
      recentDays: days.map((day) => ({ ...day, submitted: 0, averageAccuracy: null })),
      mostSubmittedAssignment: null,
      mostImprovedAssignment: null,
      solo: emptyMode,
      ensemble: emptyMode,
    };
    renderPage();

    expect(screen.queryByRole("region", { name: "Tổng hợp bài tập" })).not.toBeInTheDocument();
    expect(screen.getByText("Bạn chưa có lần nộp nào")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Khám phá thư viện" })).toHaveAttribute("href", "/library");
    expect(screen.getByRole("heading", { name: "Bài mới trong thư viện" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Bài tập sắp đến hạn" })).toBeInTheDocument();
  });
});
