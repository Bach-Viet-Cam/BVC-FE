import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StudentEvaluationForm } from "@/features/classes/components/StudentEvaluationForm";

const evaluation = { content: "Tiến bộ tốt", lecturerName: "Nguyễn Thu Hương", updatedAt: "2026-11-13T03:00:00.000Z" };

describe("StudentEvaluationForm", () => {
  it("is read-only with the lock message when evaluation is not allowed", () => {
    render(<StudentEvaluationForm evaluation={evaluation} canEvaluate={false} onSave={vi.fn()} />);
    expect(screen.getByRole("textbox", { name: "Đánh giá chung" })).toHaveAttribute("readonly");
    expect(screen.queryByRole("button", { name: /đánh giá/i })).not.toBeInTheDocument();
    expect(
      screen.getByText("Không thể đánh giá vì lớp đã kết thúc hoặc sinh viên không còn trong lớp.")
    ).toBeInTheDocument();
  });

  it("rejects an empty evaluation", async () => {
    const onSave = vi.fn();
    render(<StudentEvaluationForm evaluation={null} canEvaluate onSave={onSave} />);
    await userEvent.click(screen.getByRole("button", { name: "Lưu đánh giá" }));
    expect(await screen.findByText("Đánh giá không được để trống.")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("rejects an evaluation over 2000 characters", async () => {
    render(<StudentEvaluationForm evaluation={null} canEvaluate onSave={vi.fn()} />);
    const textbox = screen.getByRole("textbox", { name: "Đánh giá chung" });
    await userEvent.click(textbox);
    await userEvent.paste("a".repeat(2001));
    await userEvent.click(screen.getByRole("button", { name: "Lưu đánh giá" }));
    expect(await screen.findByText("Đánh giá không được vượt quá 2000 ký tự.")).toBeInTheDocument();
  });

  it("shows the last editor and an update button for an existing evaluation", async () => {
    const onSave = vi.fn().mockResolvedValue(null);
    render(<StudentEvaluationForm evaluation={evaluation} canEvaluate onSave={onSave} />);
    expect(screen.getByText(/Sửa lần cuối: Nguyễn Thu Hương, 13\/11\/2026/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Cập nhật đánh giá" }));
    expect(onSave).toHaveBeenCalledWith("Tiến bộ tốt");
  });

  it("shows field errors returned by the server", async () => {
    render(
      <StudentEvaluationForm
        evaluation={evaluation}
        canEvaluate
        onSave={vi.fn().mockResolvedValue([{ field: "content", message: "Lỗi máy chủ" }])}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Cập nhật đánh giá" }));
    expect(await screen.findByText("Lỗi máy chủ")).toBeInTheDocument();
  });
});
