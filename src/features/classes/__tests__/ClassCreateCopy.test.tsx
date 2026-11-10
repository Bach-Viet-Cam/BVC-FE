import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import { classesApi } from "@/features/classes/api/classesApi";
import { ClassCreateDialog } from "@/features/classes/components/ClassCreateDialog";

vi.mock("@/features/classes/api/classesApi", () => ({
  classesApi: {
    listClasses: vi.fn(),
    getCopySource: vi.fn(),
    createClass: vi.fn(),
    listInstruments: vi.fn(),
    listSemesters: vi.fn(),
    lookupLecturers: vi.fn(),
  },
}));
vi.mock("@/features/classes/api/assignmentsApi", () => ({ assignmentsApi: { listClassSheetMusic: vi.fn() } }));
vi.mock("@/shared/components/ui/toast", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const summary = {
  id: "src",
  name: "DNH103.M2.H1",
  cohort: "FA99-H1",
  status: "ACTIVE",
  instrument: { id: "ins-1", name: "Đàn nhạc" },
  startDate: "2099-01-01",
  endDate: "2099-06-01",
  memberCount: 3,
  isPrimaryLecturer: true,
};
const copySource = {
  ...summary,
  description: "Mô tả cũ",
  coLecturers: [],
  assignments: [
    {
      id: "a1",
      title: "Bài một",
      kind: "SOLO",
      description: null,
      sheetMusic: null,
      requiredBpm: null,
      status: "CLOSED",
    },
    {
      id: "a2",
      title: "Bài hai",
      kind: "OTHER",
      description: null,
      sheetMusic: null,
      requiredBpm: 80,
      status: "DRAFT",
    },
  ],
};

function ok<T>(data: T) {
  return Promise.resolve({ data: { data, message: "ok" } } as never);
}

async function openAndPick() {
  await userEvent.click(await screen.findByRole("button", { name: "Sao chép từ lớp khác" }));
  expect(await screen.findByText(/Sẽ sao chép: mã lớp, mô tả/)).toBeInTheDocument();
  await userEvent.click(await screen.findByRole("button", { name: /DNH103\.M2\.H1/ }));
  expect(await screen.findByText(/Đang sao chép từ DNH103\.M2\.H1 \(FA99-H1\)/)).toBeInTheDocument();
  expect(screen.queryByText(/Sẽ sao chép: mã lớp, mô tả/)).not.toBeInTheDocument();
}

describe("ClassCreateDialog copy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(classesApi.listInstruments).mockReturnValue(
      ok([{ id: "ins-1", code: "DNH", name: "Đàn nhạc", isActive: true }])
    );
    vi.mocked(classesApi.listSemesters).mockReturnValue(
      ok({ items: [{ name: "FA99-H1", startDate: "2099-01-01", endDate: "2099-06-01" }], defaultName: "FA99-H1" })
    );
    vi.mocked(classesApi.listClasses).mockReturnValue(
      ok({ items: [summary], pagination: {}, activeCount: 1, cohorts: [] })
    );
    vi.mocked(classesApi.getCopySource).mockReturnValue(ok(copySource));
    vi.mocked(assignmentsApi.listClassSheetMusic).mockReturnValue(ok([]));
    vi.mocked(classesApi.createClass).mockReturnValue(ok({ ...summary, id: "new" }));
  });

  function renderDialog() {
    render(
      <MemoryRouter>
        <ClassCreateDialog open onClose={vi.fn()} />
      </MemoryRouter>
    );
  }

  it("picks a source class and shows its assignments", async () => {
    renderDialog();
    await openAndPick();

    expect(await screen.findByText("Bài tập sẽ sao chép (2/2)")).toBeInTheDocument();
  });

  it("sends only the ticked assignments with the source class id", async () => {
    renderDialog();
    await openAndPick();
    await userEvent.click(await screen.findByRole("button", { name: "Sao chép Bài hai" }));
    await userEvent.click(screen.getByRole("button", { name: "Tạo lớp" }));

    expect(classesApi.createClass).toHaveBeenCalledTimes(1);
    const payload = vi.mocked(classesApi.createClass).mock.calls[0][0];
    expect(payload.sourceClassId).toBe("src");
    expect(payload.assignments).toHaveLength(1);
    expect(payload.assignments?.[0]).toMatchObject({ title: "Bài một", status: "PUBLISHED" });
  });

  it("shows a server error under the matching ticked row", async () => {
    const message = "Bản nhạc đã chọn không còn khả dụng trong thư viện. Vui lòng chọn mục khác.";
    vi.mocked(classesApi.createClass).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        data: { message: "Dữ liệu không hợp lệ", errors: [{ field: "assignments.0.sheetMusicId", message }] },
      },
    });
    renderDialog();
    await openAndPick();
    await userEvent.click(screen.getByRole("button", { name: "Tạo lớp" }));

    const alert = await screen.findByText(message);
    expect(alert.closest("li")).toHaveTextContent("Bài một");
    expect(within(alert.closest("li") as HTMLElement).queryByText("Bài hai")).not.toBeInTheDocument();
  });

  it("blocks submit when two ticked rows are SOLO", async () => {
    vi.mocked(classesApi.getCopySource).mockReturnValue(
      ok({
        ...copySource,
        assignments: [copySource.assignments[0], { ...copySource.assignments[1], kind: "SOLO" }],
      })
    );
    renderDialog();
    await openAndPick();
    await userEvent.click(screen.getByRole("button", { name: "Tạo lớp" }));

    const messages = await screen.findAllByText(/nhiều hơn một bài Độc tấu/);
    expect(messages).toHaveLength(2);
    expect(classesApi.createClass).not.toHaveBeenCalled();
  });

  it("drops the copy when 'Bỏ sao chép' is pressed", async () => {
    renderDialog();
    await openAndPick();
    await userEvent.click(screen.getByRole("button", { name: "Bỏ sao chép" }));

    expect(screen.queryByText(/Bài tập sẽ sao chép/)).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/Mã lớp/), "DNH103.M2.H1");
    await userEvent.click(screen.getByRole("button", { name: "Tạo lớp" }));

    const payload = vi.mocked(classesApi.createClass).mock.calls[0][0];
    expect(payload).not.toHaveProperty("assignments");
    expect(payload).not.toHaveProperty("sourceClassId");
  });

  it("keeps the picker open and shows no source when loading the source fails", async () => {
    vi.mocked(classesApi.getCopySource).mockRejectedValue(new Error("boom"));
    renderDialog();
    await userEvent.click(await screen.findByRole("button", { name: "Sao chép từ lớp khác" }));
    await userEvent.click(await screen.findByRole("button", { name: /DNH103\.M2\.H1/ }));

    expect(await screen.findByText(/Sẽ sao chép: mã lớp, mô tả/)).toBeInTheDocument();
    expect(screen.queryByText(/Đang sao chép từ/)).not.toBeInTheDocument();
  });

  it("disables Tạo lớp while the source class is loading", async () => {
    vi.mocked(classesApi.getCopySource).mockReturnValue(new Promise(() => undefined) as never);
    renderDialog();
    await userEvent.click(await screen.findByRole("button", { name: "Sao chép từ lớp khác" }));
    await userEvent.click(await screen.findByRole("button", { name: /DNH103\.M2\.H1/ }));

    expect(await screen.findByRole("button", { name: "Đang tải lớp nguồn…", hidden: true })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Tạo lớp", hidden: true })).toBeDisabled();
  });
});
