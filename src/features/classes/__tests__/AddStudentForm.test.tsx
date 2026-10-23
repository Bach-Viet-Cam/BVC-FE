import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AddStudentForm } from "@/features/classes/components/AddStudentForm";
import { type MemberLookup } from "@/features/classes/types/classTypes";

function renderForm(lookup: MemberLookup) {
  const onLookup = vi.fn().mockResolvedValue(lookup);
  const onSubmit = vi.fn().mockResolvedValue(null);
  render(
    <AddStudentForm isSaving={false} isChecking={false} onCancel={vi.fn()} onLookup={onLookup} onSubmit={onSubmit} />
  );
  return { onLookup, onSubmit };
}

async function checkEmail(email: string) {
  await userEvent.type(screen.getByLabelText(/Email/), email);
  await userEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
}

describe("AddStudentForm", () => {
  it("hides name and student code until the email is checked", () => {
    renderForm({ status: "NEW", fullName: null, studentCode: null });

    expect(screen.queryByLabelText(/Mã sinh viên/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Họ tên/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Thêm" })).toBeDisabled();
  });

  it("prefills and locks the fields of an existing student account, then adds it", async () => {
    const { onLookup, onSubmit } = renderForm({
      status: "STUDENT",
      fullName: "Trần Minh Anh",
      studentCode: "SE171234",
    });

    await checkEmail("anhtm@fpt.edu.vn");

    expect(onLookup).toHaveBeenCalledWith("anhtm@fpt.edu.vn");
    expect(screen.getByLabelText(/Họ tên/)).toHaveValue("Trần Minh Anh");
    expect(screen.getByLabelText(/Họ tên/)).toHaveAttribute("readonly");
    expect(screen.getByLabelText(/Mã sinh viên/)).toHaveValue("SE171234");
    expect(screen.getByLabelText(/Mã sinh viên/)).toHaveAttribute("readonly");

    await userEvent.click(screen.getByRole("button", { name: "Thêm" }));
    expect(onSubmit).toHaveBeenCalledWith({
      email: "anhtm@fpt.edu.vn",
      fullName: "Trần Minh Anh",
      studentCode: "SE171234",
    });
  });

  it("keeps the student code editable when the existing student has none", async () => {
    renderForm({ status: "STUDENT", fullName: "Trần Minh Anh", studentCode: null });

    await checkEmail("anhtm@fpt.edu.vn");

    expect(screen.getByLabelText(/Họ tên/)).toHaveAttribute("readonly");
    expect(screen.getByLabelText(/Mã sinh viên/)).not.toHaveAttribute("readonly");
  });

  it("blocks a non-student account", async () => {
    renderForm({ status: "NOT_STUDENT", fullName: null, studentCode: null });

    await checkEmail("gv@fpt.edu.vn");

    expect(screen.getByText("Đây không phải tài khoản sinh viên.")).toBeInTheDocument();
    expect(screen.queryByLabelText(/Họ tên/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Thêm" })).toBeDisabled();
  });

  it("lets the lecturer type both fields for a new email and goes back to step 1 when the email changes", async () => {
    renderForm({ status: "NEW", fullName: null, studentCode: null });

    await checkEmail("moi@fpt.edu.vn");
    expect(screen.getByLabelText(/Họ tên/)).not.toHaveAttribute("readonly");
    expect(screen.getByLabelText(/Mã sinh viên/)).not.toHaveAttribute("readonly");

    await userEvent.type(screen.getByLabelText(/Email/), "x");
    expect(screen.queryByLabelText(/Họ tên/)).not.toBeInTheDocument();
  });
});
