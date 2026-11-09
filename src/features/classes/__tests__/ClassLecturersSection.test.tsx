import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { classesApi } from "@/features/classes/api/classesApi";
import { ClassLecturersSection } from "@/features/classes/components/ClassLecturersSection";
import { toast } from "@/shared/components/ui/toast";
import { type ClassDetail, type Lecturer } from "@/features/classes/types/classTypes";

vi.mock("@/features/classes/api/classesApi", () => ({
  classesApi: { lookupLecturers: vi.fn(), addLecturer: vi.fn(), removeLecturer: vi.fn() },
}));
vi.mock("@/shared/components/ui/toast", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const owner: Lecturer = { id: "gv-o", fullName: "Lê Chính", email: "owner@fpt.edu.vn" };
const lecturerA: Lecturer = { id: "gv-a", fullName: "Nguyễn Văn A", email: "gv.a@fpt.edu.vn" };

function makeClass(overrides: Partial<ClassDetail>): ClassDetail {
  return {
    id: "class-1",
    name: "Lớp 1",
    cohort: "K1",
    status: "ACTIVE",
    instrument: { id: "i1", name: "Piano" },
    startDate: "2026-01-01",
    endDate: "2026-06-01",
    memberCount: 3,
    isPrimaryLecturer: true,
    owner,
    coLecturers: [lecturerA],
    description: null,
    hasStarted: true,
    isReadOnly: false,
    endedAt: null,
    ...overrides,
  } as ClassDetail;
}

describe("ClassLecturersSection", () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows owner with "Chính" and co-lecturers read-only for a co-lecturer', () => {
    render(<ClassLecturersSection classDetail={makeClass({ isPrimaryLecturer: false })} onChanged={vi.fn()} />);
    expect(screen.getByRole("region", { name: "Giảng viên" })).toBeInTheDocument();
    expect(screen.getByText("Chính")).toBeInTheDocument();
    expect(screen.getByText("gv.a@fpt.edu.vn")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Gỡ/ })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Thêm giảng viên cùng dạy")).not.toBeInTheDocument();
  });

  it("lets the primary lecturer remove a co-lecturer after confirming", async () => {
    vi.mocked(classesApi.removeLecturer).mockResolvedValue({ data: { data: null, message: "Đã gỡ" } } as never);
    const onChanged = vi.fn();
    render(<ClassLecturersSection classDetail={makeClass({})} onChanged={onChanged} />);
    await userEvent.click(screen.getByRole("button", { name: "Gỡ Nguyễn Văn A" }));
    expect(await screen.findByText("Gỡ Nguyễn Văn A khỏi lớp?")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Gỡ" }));
    await waitFor(() => expect(classesApi.removeLecturer).toHaveBeenCalledWith("class-1", "gv-a"));
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(onChanged.mock.calls[0][0]([lecturerA])).toEqual([]);
  });

  it("shows an error toast and does not call onChanged when removal fails", async () => {
    vi.mocked(classesApi.removeLecturer).mockRejectedValue(new Error("fail"));
    const onChanged = vi.fn();
    render(<ClassLecturersSection classDetail={makeClass({})} onChanged={onChanged} />);
    await userEvent.click(screen.getByRole("button", { name: "Gỡ Nguyễn Văn A" }));
    await userEvent.click(await screen.findByRole("button", { name: "Gỡ" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(onChanged).not.toHaveBeenCalled();
  });

  it("adds a picked lecturer immediately", async () => {
    vi.mocked(classesApi.lookupLecturers).mockResolvedValue({
      data: { data: [{ id: "gv-b", fullName: "Trần B", email: "b@fpt.edu.vn" }] },
    } as never);
    vi.mocked(classesApi.addLecturer).mockResolvedValue({
      data: { data: { id: "gv-b", fullName: "Trần B", email: "b@fpt.edu.vn" }, message: "Đã thêm" },
    } as never);
    const onChanged = vi.fn();
    render(<ClassLecturersSection classDetail={makeClass({ coLecturers: [] })} onChanged={onChanged} />);
    await userEvent.type(screen.getByLabelText("Thêm giảng viên cùng dạy"), "b");
    await userEvent.click(await screen.findByRole("option", { name: /Trần B/ }));
    await waitFor(() => expect(classesApi.addLecturer).toHaveBeenCalledWith("class-1", "gv-b"));
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(onChanged.mock.calls[0][0]([lecturerA])).toEqual([
      lecturerA,
      { id: "gv-b", fullName: "Trần B", email: "b@fpt.edu.vn" },
    ]);
  });

  it("disables the remove buttons while a removal is pending", async () => {
    let resolveRemove: (value: unknown) => void = () => undefined;
    vi.mocked(classesApi.removeLecturer).mockReturnValue(new Promise((resolve) => (resolveRemove = resolve)) as never);
    const lecturerB: Lecturer = { id: "gv-b", fullName: "Trần B", email: "b@fpt.edu.vn" };
    const onChanged = vi.fn();
    render(
      <ClassLecturersSection classDetail={makeClass({ coLecturers: [lecturerA, lecturerB] })} onChanged={onChanged} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Gỡ Nguyễn Văn A" }));
    await userEvent.click(await screen.findByRole("button", { name: "Gỡ" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Gỡ Trần B", hidden: true })).toBeDisabled());
    expect(screen.getByRole("button", { name: "Gỡ Nguyễn Văn A", hidden: true })).toBeDisabled();
    resolveRemove({ data: { data: null, message: "Đã gỡ" } });
    await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1));
    expect(onChanged.mock.calls[0][0]([lecturerA, lecturerB])).toEqual([lecturerB]);
  });

  it("hides management on an ended class", () => {
    render(<ClassLecturersSection classDetail={makeClass({ isReadOnly: true })} onChanged={vi.fn()} />);
    expect(screen.getByText("gv.a@fpt.edu.vn")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Gỡ/ })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Thêm giảng viên cùng dạy")).not.toBeInTheDocument();
  });
});
