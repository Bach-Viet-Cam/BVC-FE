import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AssignmentClassSection } from "@/features/classes/components/AssignmentClassSection";
import { SemesterEmptyNotice } from "@/features/classes/components/SemesterEmptyNotice";
import { type OverviewAssignment, type OverviewClass } from "@/features/classes/types/teacherAssignmentTypes";

const OPEN: OverviewAssignment = {
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
};
const CLOSED: OverviewAssignment = {
  ...OPEN,
  id: "a2",
  title: "Bonus tháng 9",
  kind: "BONUS",
  status: "CLOSED",
  practiceCount: 1,
};
const CLASS: OverviewClass = {
  id: "c1",
  name: "TRD301",
  status: "ACTIVE",
  memberCount: 20,
  assignments: [OPEN, CLOSED],
};

function renderSection(props: Partial<Parameters<typeof AssignmentClassSection>[0]> = {}) {
  const onToggle = vi.fn();
  render(
    <MemoryRouter>
      <AssignmentClassSection cls={CLASS} open onToggle={onToggle} highlightIds={new Set()} {...props} />
    </MemoryRouter>
  );
  return { onToggle };
}

describe("AssignmentClassSection", () => {
  it("shows the class summary and toggles from the header button", async () => {
    const { onToggle } = renderSection({ open: false });
    const header = screen.getByRole("button", { name: /TRD301/ });
    expect(header).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("20 SV · 2 bài tập · 1 đang mở")).toBeInTheDocument();
    expect(screen.getByText("lượt luyện tập")).toBeInTheDocument();
    expect(screen.queryByText("Đã luyện")).not.toBeInTheDocument();
    await userEvent.click(header);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("renders the six-column table without a week column when open", () => {
    renderSection();
    for (const heading of ["Bài tập", "Loại", "Đã luyện", "Luyện tập", "Trạng thái"]) {
      expect(screen.getByText(heading)).toBeInTheDocument();
    }
    expect(screen.queryByText("Tuần")).not.toBeInTheDocument();
  });

  it("links each row to the detail page with progress, practice count and status", () => {
    renderSection();
    const row = screen.getByText("Độc tấu - Lý ngựa ô").closest("a") as HTMLElement;
    expect(row).toHaveAttribute("href", "/teacher/assignments/a1");
    expect(row).toHaveTextContent("Lý ngựa ô");
    expect(row).toHaveTextContent("Độc tấu");
    expect(row).toHaveTextContent("3 / 20 SV");
    expect(row).toHaveTextContent("5 lượt");
    expect(row).toHaveTextContent("Đang mở");
    expect(screen.getByText("Bonus tháng 9").closest("a")).toHaveTextContent("Đã đóng");
  });

  it("marks only highlighted assignments as just assigned", () => {
    renderSection({ highlightIds: new Set(["a2"]) });
    expect(screen.getAllByText("Vừa gán")).toHaveLength(1);
    expect(screen.getByText("Bonus tháng 9").closest("a")).toHaveTextContent("Vừa gán");
  });

  it("says when the class has no assignment", () => {
    renderSection({ cls: { ...CLASS, assignments: [] } });
    expect(screen.getByText("Lớp này chưa có bài tập nào.")).toBeInTheDocument();
  });
});

describe("SemesterEmptyNotice", () => {
  const semester = { name: "HK1 2026-2027", startDate: "2026-09-01", endDate: "2027-01-15" };

  it("explains a missing semester configuration", () => {
    render(<SemesterEmptyNotice reason="NO_SEMESTER_CONFIGURED" semester={null} />);
    expect(screen.getByRole("status")).toHaveTextContent("Chưa có học kỳ nào được cấu hình.");
  });

  it("explains that today is outside every semester", () => {
    render(<SemesterEmptyNotice reason="NO_CURRENT_SEMESTER" semester={null} />);
    expect(screen.getByRole("status")).toHaveTextContent("không nằm trong học kỳ nào đã cấu hình");
  });

  it("explains that the lecturer has no class in the semester", () => {
    render(<SemesterEmptyNotice reason="NO_CLASSES_IN_SEMESTER" semester={semester} />);
    expect(screen.getByRole("status")).toHaveTextContent("Bạn chưa có lớp nào trong học kỳ HK1 2026-2027.");
  });
});
