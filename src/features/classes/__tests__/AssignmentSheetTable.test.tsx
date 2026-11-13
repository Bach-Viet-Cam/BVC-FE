import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AssignmentSheetTable } from "@/features/classes/components/AssignmentSheetTable";
import { type SheetGroup } from "@/features/classes/utils/assignmentOverviewFormat";
import { type OverviewAssignment } from "@/features/classes/types/teacherAssignmentTypes";

function assignment(id: string, title: string, classId: string): OverviewAssignment {
  return {
    id,
    classId,
    title,
    kind: "SOLO",
    status: "PUBLISHED",
    version: 1,
    sheetMusicId: "sh1",
    sheetTitle: "Lý ngựa ô",
    practiceCount: 4,
    submittedCount: 5,
    memberCount: 20,
    updatedAt: "2026-10-01T00:00:00.000Z",
  };
}

const GROUPS: SheetGroup[] = [
  {
    sheetMusicId: "sh1",
    sheetTitle: "Lý ngựa ô",
    assignments: [assignment("a1", "Độc tấu A", "c1"), assignment("a2", "Độc tấu B", "c2")],
    classNames: ["TRD301", "TRD302"],
    kinds: ["SOLO", "ENSEMBLE"],
    practicedStudents: 10,
    memberCount: 40,
    practiceCount: 8,
  },
  {
    sheetMusicId: "sh2",
    sheetTitle: "Hò kéo pháo",
    assignments: [{ ...assignment("a3", "Bonus", "c1"), sheetMusicId: "sh2", sheetTitle: "Hò kéo pháo" }],
    classNames: ["TRD301"],
    kinds: ["BONUS"],
    practicedStudents: 1,
    memberCount: 20,
    practiceCount: 0,
  },
];

const renderTable = (groups: SheetGroup[]) =>
  render(
    <MemoryRouter>
      <AssignmentSheetTable groups={groups} />
    </MemoryRouter>
  );

describe("AssignmentSheetTable", () => {
  it("renders one row per sheet linking to its sheet-mode detail", () => {
    renderTable(GROUPS);
    expect(screen.getByText("Bài tập theo sheet nhạc")).toBeInTheDocument();
    expect(screen.getByText("2 sheet nhạc · 3 bài tập")).toBeInTheDocument();
    const row = screen.getByText("Lý ngựa ô").closest("a") as HTMLElement;
    expect(row).toHaveAttribute("href", "/teacher/assignments?tab=sheet&sheet=sh1");
    expect(screen.getByText("Hò kéo pháo").closest("a")).toHaveAttribute(
      "href",
      "/teacher/assignments?tab=sheet&sheet=sh2"
    );
  });

  it("shows kinds, class chips, usage count, progress and practice count", () => {
    renderTable(GROUPS);
    const row = screen.getByText("Lý ngựa ô").closest("a") as HTMLElement;
    expect(row).toHaveTextContent("Độc tấu");
    expect(row).toHaveTextContent("Hòa tấu");
    expect(row).toHaveTextContent("TRD301");
    expect(row).toHaveTextContent("TRD302");
    expect(row).toHaveTextContent("2 bài tập");
    expect(row).toHaveTextContent("Độc tấu A, Độc tấu B");
    expect(row).toHaveTextContent("10 / 40 SV");
    expect(row).toHaveTextContent("8 lượt");
  });

  it("explains when no assignment is linked to a sheet", () => {
    renderTable([]);
    expect(screen.getByText("Chưa có bài tập nào gắn sheet nhạc.")).toBeInTheDocument();
  });
});
