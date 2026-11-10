import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { classesApi } from "@/features/classes/api/classesApi";
import { ClassForm } from "@/features/classes/components/ClassForm";
import { type ClassDetail, type Lecturer } from "@/features/classes/types/classTypes";

vi.mock("@/features/classes/api/classesApi", () => ({
  classesApi: { lookupLecturers: vi.fn() },
}));

const lecturerA: Lecturer = { id: "gv-a", fullName: "Nguyễn Văn A", email: "gv.a@fpt.edu.vn" };
const instruments = [{ id: "ins-1", code: "DNH", name: "Đàn nhạc", isActive: true }];
const semesters = [{ name: "FA99-H1", startDate: "2099-01-01", endDate: "2099-06-01" }];

const classDetail: ClassDetail = {
  id: "c1",
  name: "DNH103.M2.H1",
  cohort: "FA99-H1",
  status: "ACTIVE",
  instrument: { id: "ins-1", name: "Đàn nhạc" },
  startDate: "2099-01-01",
  endDate: "2099-06-01",
  memberCount: 0,
  isPrimaryLecturer: true,
  owner: lecturerA,
  coLecturers: [],
  description: null,
  hasStarted: false,
  isReadOnly: false,
  endedAt: null,
};

function renderForm(detail: ClassDetail | null, onSubmit = vi.fn().mockResolvedValue(null)) {
  render(
    <ClassForm
      classDetail={detail}
      instruments={instruments}
      semesters={semesters}
      defaultSemesterName="FA99-H1"
      isSaving={false}
      onCancel={vi.fn()}
      onSubmit={onSubmit}
    />
  );
  return onSubmit;
}

describe("ClassForm co-lecturers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("submits the picked co-lecturer ids when creating", async () => {
    vi.mocked(classesApi.lookupLecturers).mockResolvedValue({ data: { data: [lecturerA] } } as never);
    const onSubmit = renderForm(null);

    await userEvent.type(screen.getByLabelText(/Mã lớp/), "DNH103.M2.H1");
    await userEvent.type(screen.getByLabelText("Giảng viên cùng dạy"), "gv");
    await userEvent.click(await screen.findByRole("option", { name: /Nguyễn Văn A/ }));
    await userEvent.click(screen.getByRole("button", { name: "Tạo lớp" }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ coLecturerIds: ["gv-a"] }));
  });

  it("does not render the co-lecturer field when editing", () => {
    renderForm(classDetail);

    expect(screen.queryByText("Giảng viên cùng dạy")).not.toBeInTheDocument();
  });
});

describe("ClassForm prefill", () => {
  const prefill = {
    key: "c1",
    name: "DNH103.M2.H1",
    description: "Mô tả cũ",
    coLecturers: [{ id: "l2", fullName: "GV Hai", email: "l2@x.vn" }],
  };

  function renderPrefilled(initial: typeof prefill | null, extra: { beforeSubmit?: () => boolean } = {}) {
    const onSubmit = vi.fn().mockResolvedValue(null);
    const ui = (value: typeof prefill | null) => (
      <ClassForm
        classDetail={null}
        instruments={instruments}
        semesters={semesters}
        defaultSemesterName="FA99-H1"
        isSaving={false}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
        prefill={value}
        {...extra}
      />
    );
    const view = render(ui(initial));
    return { onSubmit, rerender: (value: typeof prefill | null) => view.rerender(ui(value)) };
  }

  it("fills name, description, co-lecturers and semester from the prefill", async () => {
    renderPrefilled(prefill);

    expect(await screen.findByLabelText(/Mã lớp/)).toHaveValue("DNH103.M2.H1");
    expect(screen.getByLabelText("Mô tả")).toHaveValue("Mô tả cũ");
    expect(screen.getByText("GV Hai")).toBeInTheDocument();
    expect(screen.getByLabelText(/Học kỳ/)).toHaveValue("FA99-H1");
  });

  it("falls back to the default semester when the copied code cannot be parsed", async () => {
    renderPrefilled({ ...prefill, name: "TRD301" });

    expect(await screen.findByDisplayValue("TRD301")).toBeInTheDocument();
    expect(screen.getByLabelText(/Học kỳ/)).toHaveValue("FA99-H1");
  });

  it("clears everything when the prefill is removed", async () => {
    const { rerender } = renderPrefilled(null);
    rerender(prefill);
    expect(await screen.findByDisplayValue("DNH103.M2.H1")).toBeInTheDocument();

    rerender(null);

    expect(screen.getByLabelText(/Mã lớp/)).toHaveValue("");
    expect(screen.queryByText("GV Hai")).not.toBeInTheDocument();
  });

  it("keeps instrument and semester filled when switching to a source with the same subject and half", async () => {
    const { onSubmit, rerender } = renderPrefilled(prefill);
    expect(await screen.findByDisplayValue("DNH103.M2.H1")).toBeInTheDocument();

    rerender({ ...prefill, key: "c2", name: "DNH104.M3.H1" });

    expect(await screen.findByDisplayValue("DNH104.M3.H1")).toBeInTheDocument();
    expect(screen.getByLabelText(/Học kỳ/)).toHaveValue("FA99-H1");
    await userEvent.click(screen.getByRole("button", { name: "Tạo lớp" }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: "DNH104.M3.H1", instrumentId: "ins-1", cohort: "FA99-H1" })
    );
  });

  it("fills instrument and semester when a prefill follows a hand-typed code with the same subject and half", async () => {
    const { onSubmit, rerender } = renderPrefilled(null);
    await userEvent.type(screen.getByLabelText(/Mã lớp/), "DNH104.M3.H1");

    rerender(prefill);

    expect(await screen.findByDisplayValue("DNH103.M2.H1")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Tạo lớp" }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ instrumentId: "ins-1", cohort: "FA99-H1" }));
  });

  it("does not submit when beforeSubmit returns false", async () => {
    const { onSubmit } = renderPrefilled(prefill, { beforeSubmit: () => false });

    await userEvent.click(screen.getByRole("button", { name: "Tạo lớp" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
