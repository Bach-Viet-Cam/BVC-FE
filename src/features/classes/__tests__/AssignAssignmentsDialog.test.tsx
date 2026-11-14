import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AssignAssignmentsDialog } from "@/features/classes/components/AssignAssignmentsDialog";
import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import { type OverviewAssignment, type OverviewClass } from "@/features/classes/types/teacherAssignmentTypes";

vi.mock("@/features/classes/api/assignmentsApi", () => ({ assignmentsApi: { assignToClasses: vi.fn() } }));

function assignment(overrides: Partial<OverviewAssignment>): OverviewAssignment {
  return {
    id: "a1",
    classId: "c1",
    title: "Độc tấu - Lý ngựa ô",
    kind: "SOLO",
    status: "PUBLISHED",
    version: 1,
    sheetMusicId: "sh1",
    sheetTitle: "Lý ngựa ô",
    practiceCount: 0,
    submittedCount: 0,
    memberCount: 20,
    updatedAt: "2026-10-01T00:00:00.000Z",
    ...overrides,
  };
}

const CLASSES: OverviewClass[] = [
  { id: "c1", name: "TRD301", status: "ACTIVE", memberCount: 20, assignments: [assignment({})] },
  {
    id: "c2",
    name: "TRD302",
    status: "ACTIVE",
    memberCount: 18,
    assignments: [
      assignment({
        id: "a3",
        classId: "c2",
        title: "Bonus tháng 10",
        kind: "BONUS",
        sheetMusicId: null,
        sheetTitle: null,
      }),
    ],
  },
  {
    id: "c3",
    name: "TRD101",
    status: "ENDED",
    memberCount: 15,
    assignments: [
      assignment({
        id: "a4",
        classId: "c3",
        title: "Hòa tấu cũ",
        kind: "ENSEMBLE",
        sheetMusicId: null,
        sheetTitle: null,
      }),
    ],
  },
];

function renderDialog(overrides: Partial<Parameters<typeof AssignAssignmentsDialog>[0]> = {}) {
  const onClose = vi.fn();
  const onAssigned = vi.fn();
  render(
    <AssignAssignmentsDialog
      open
      onClose={onClose}
      classes={CLASSES}
      emptyReason={null}
      semester={{ name: "HK1 2026-2027", startDate: "2026-09-01", endDate: "2027-01-15" }}
      onAssigned={onAssigned}
      {...overrides}
    />
  );
  return { onClose, onAssigned };
}

const source = (name: RegExp) => within(screen.getByRole("group", { name: "Bài tập" })).getByRole("button", { name });
const submitButton = () => screen.getByRole("button", { name: /^(Gán bài tập|Gán \d+ bài cho \d+ lớp|Đã gán hết)$/ });
const classRow = (name: RegExp) =>
  within(screen.getByRole("group", { name: "Lớp nhận bài" })).getByRole("button", { name });

describe("AssignAssignmentsDialog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("enables Gán only after at least one assignment and one class are selected", async () => {
    renderDialog();
    expect(submitButton()).toHaveTextContent("Gán bài tập");
    expect(submitButton()).toBeDisabled();
    expect(screen.getByText("Chọn ít nhất 1 bài tập và 1 lớp.")).toBeInTheDocument();
    await userEvent.click(source(/Bonus tháng 10/));
    expect(submitButton()).toBeDisabled();
    await userEvent.click(classRow(/TRD301/));
    expect(submitButton()).toBeEnabled();
    expect(submitButton()).toHaveTextContent("Gán 1 bài cho 1 lớp");
    expect(screen.getByText("Sẽ tạo 1 lượt gán mới.")).toBeInTheDocument();
  });

  it("checks the groups given in initialSelectedKeys", () => {
    renderDialog({ initialSelectedKeys: ["độc tấu - lý ngựa ô|SOLO|sh1"] });
    const sources = within(screen.getByRole("group", { name: "Bài tập" }));
    expect(sources.getByText("Độc tấu - Lý ngựa ô").closest("button")).toHaveAttribute("aria-pressed", "true");
    expect(sources.getByText("Bonus tháng 10").closest("button")).toHaveAttribute("aria-pressed", "false");
    expect(sources.getByText("1 / 3 đã chọn")).toBeInTheDocument();
  });

  it("lists only active classes as targets", () => {
    renderDialog();
    expect(classRow(/TRD301/)).toBeInTheDocument();
    expect(classRow(/TRD302/)).toBeInTheDocument();
    expect(
      within(screen.getByRole("group", { name: "Lớp nhận bài" })).queryByRole("button", { name: /TRD101/ })
    ).not.toBeInTheDocument();
  });

  it("flags classes that already hold the selected assignment", async () => {
    renderDialog();
    await userEvent.click(source(/Độc tấu - Lý ngựa ô/));
    expect(classRow(/TRD301/)).toHaveTextContent("Đã có bài này");
    expect(classRow(/TRD302/)).not.toHaveTextContent("Đã có bài");
  });

  it("disables Gán when every selected pair already exists", async () => {
    renderDialog();
    await userEvent.click(source(/Độc tấu - Lý ngựa ô/));
    await userEvent.click(classRow(/TRD301/));
    expect(submitButton()).toHaveTextContent("Đã gán hết");
    expect(submitButton()).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("Tất cả bài tập đã chọn đã có trong tất cả các lớp đã chọn");
  });

  it("sends the selected assignment and class ids", async () => {
    vi.mocked(assignmentsApi.assignToClasses).mockResolvedValue({
      data: { data: { created: [{ id: "n1" }], skipped: [] }, message: "ok", success: true },
    } as never);
    const { onClose, onAssigned } = renderDialog();
    await userEvent.click(source(/Độc tấu - Lý ngựa ô/));
    await userEvent.click(classRow(/TRD302/));
    await userEvent.click(submitButton());
    await waitFor(() =>
      expect(assignmentsApi.assignToClasses).toHaveBeenCalledWith({ assignmentIds: ["a1"], classIds: ["c2"] })
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onAssigned).toHaveBeenCalledWith([{ id: "n1" }]);
  });

  it("stays open and explains every skipped pair", async () => {
    vi.mocked(assignmentsApi.assignToClasses).mockResolvedValue({
      data: {
        data: { created: [], skipped: [{ assignmentId: "a1", classId: "c1", reason: "ALREADY_ASSIGNED" }] },
        message: "ok",
        success: true,
      },
    } as never);
    const { onClose } = renderDialog();
    await userEvent.click(source(/Độc tấu - Lý ngựa ô/));
    await userEvent.click(classRow(/TRD301/));
    await userEvent.click(classRow(/TRD302/));
    await userEvent.click(submitButton());
    expect(await screen.findByText(/TRD301 — Độc tấu - Lý ngựa ô: Lớp đã có bài này/)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows the API error in an alert and refreshes the list because some clones may already exist", async () => {
    vi.mocked(assignmentsApi.assignToClasses).mockRejectedValue(new Error("boom"));
    const { onAssigned } = renderDialog();
    await userEvent.click(source(/Bonus tháng 10/));
    await userEvent.click(classRow(/TRD301/));
    await userEvent.click(submitButton());
    expect(await screen.findByRole("alert")).toHaveTextContent("Gán bài tập thất bại");
    expect(onAssigned).toHaveBeenCalledWith([]);
  });

  it("explains the empty reason and blocks assigning", () => {
    renderDialog({ classes: [], emptyReason: "NO_CURRENT_SEMESTER", semester: null });
    expect(screen.getByRole("status")).toHaveTextContent("không nằm trong học kỳ nào đã cấu hình");
    expect(submitButton()).toBeDisabled();
  });

  it("filters the assignment list by kind and by search text", async () => {
    renderDialog();
    const chips = within(screen.getByRole("group", { name: "Lọc theo loại bài" }));
    await userEvent.click(chips.getByRole("button", { name: /^Bonus/ }));
    expect(
      within(screen.getByRole("group", { name: "Bài tập" })).queryByRole("button", { name: /Độc tấu - Lý ngựa ô/ })
    ).not.toBeInTheDocument();
    expect(source(/Bonus tháng 10/)).toBeInTheDocument();
    await userEvent.click(chips.getByRole("button", { name: /^Tất cả/ }));
    await userEvent.type(screen.getByRole("searchbox", { name: "Tìm theo tên bài" }), "ngua");
    expect(source(/Độc tấu - Lý ngựa ô/)).toBeInTheDocument();
    expect(
      within(screen.getByRole("group", { name: "Bài tập" })).queryByRole("button", { name: /Bonus tháng 10/ })
    ).not.toBeInTheDocument();
  });
});
