import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { classesApi } from "@/features/classes/api/classesApi";
import { LecturerPicker } from "@/features/classes/components/LecturerPicker";
import { type Lecturer } from "@/features/classes/types/classTypes";

vi.mock("@/features/classes/api/classesApi", () => ({
  classesApi: { lookupLecturers: vi.fn() },
}));

const lecturerA: Lecturer = { id: "gv-a", fullName: "Nguyễn Văn A", email: "gv.a@fpt.edu.vn" };
const lecturerB: Lecturer = { id: "gv-b", fullName: "Trần Thị B", email: "gv.b@fpt.edu.vn" };

function mockLookup(items: Lecturer[]) {
  vi.mocked(classesApi.lookupLecturers).mockResolvedValue({ data: { data: items } } as never);
}

describe("LecturerPicker", () => {
  beforeEach(() => vi.clearAllMocks());

  it("searches by email, adds a chip, hides it from suggestions and removes it", async () => {
    mockLookup([lecturerA, lecturerB]);
    const onChange = vi.fn();
    const { rerender } = render(<LecturerPicker id="lp" label="Giảng viên cùng dạy" value={[]} onChange={onChange} />);

    await userEvent.type(screen.getByLabelText("Giảng viên cùng dạy"), "gv");
    const option = await screen.findByRole("option", { name: /Nguyễn Văn A · gv\.a@fpt\.edu\.vn/ });
    expect(classesApi.lookupLecturers).toHaveBeenCalledWith("gv");
    await userEvent.click(option);
    expect(onChange).toHaveBeenCalledWith([lecturerA]);

    rerender(<LecturerPicker id="lp" label="Giảng viên cùng dạy" value={[lecturerA]} onChange={onChange} />);
    expect(screen.getByText("gv.a@fpt.edu.vn")).toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText("Giảng viên cùng dạy"));
    await userEvent.type(screen.getByLabelText("Giảng viên cùng dạy"), "gv");
    await screen.findByRole("option", { name: /Trần Thị B/ });
    expect(screen.queryByRole("option", { name: /Nguyễn Văn A/ })).not.toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByRole("button", { name: "Bỏ Nguyễn Văn A" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("hides excluded ids and shows an empty message", async () => {
    mockLookup([lecturerA]);
    render(<LecturerPicker id="lp" label="Giảng viên cùng dạy" value={[]} onChange={vi.fn()} excludedIds={["gv-a"]} />);

    await userEvent.type(screen.getByLabelText("Giảng viên cùng dạy"), "gv");

    expect(await screen.findByText("Không tìm thấy giảng viên")).toBeInTheDocument();
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("does not call the API for a blank query", async () => {
    mockLookup([]);
    render(<LecturerPicker id="lp" label="Giảng viên cùng dạy" value={[]} onChange={vi.fn()} />);

    await userEvent.type(screen.getByLabelText("Giảng viên cùng dạy"), "  ");
    await new Promise((resolve) => setTimeout(resolve, 400));

    await waitFor(() => expect(classesApi.lookupLecturers).not.toHaveBeenCalled());
  });
});
