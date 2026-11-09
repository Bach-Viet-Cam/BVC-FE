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
