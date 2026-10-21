import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SubmissionCard } from "@/features/classes/components/SubmissionCard";
import { type StudentSubmission } from "@/features/classes/types/teacherAssignmentTypes";

const SUBMISSION: StudentSubmission = {
  id: "sub1",
  attemptNumber: 3,
  version: 2,
  status: "COMPLETED",
  accuracy: 82.5,
  tempoDeviation: 4,
  audioUrl: "/samples/bvc-sample.wav",
  submittedAt: "2026-10-16T02:30:00.000Z",
  comment: null,
};

describe("SubmissionCard", () => {
  it("shows attempt, version, status, accuracy and an audio player", () => {
    const { container } = render(<SubmissionCard submission={SUBMISSION} canComment onSaveComment={vi.fn()} />);
    expect(screen.getByText("Lần nộp 3 · 16/10/2026 09:30 · phiên bản v2")).toBeInTheDocument();
    expect(screen.getByText("Hoàn tất")).toBeInTheDocument();
    expect(screen.getByText("Độ chính xác 82.5%")).toBeInTheDocument();
    expect(screen.getByText("Lệch tempo 4%")).toBeInTheDocument();
    expect(container.querySelector("audio")).toHaveAttribute("src", "/samples/bvc-sample.wav");
  });

  it("sends a first comment and validates blank content", async () => {
    const onSaveComment = vi.fn().mockResolvedValue(null);
    render(<SubmissionCard submission={SUBMISSION} canComment onSaveComment={onSaveComment} />);
    await userEvent.click(screen.getByRole("button", { name: "Gửi nhận xét" }));
    expect(await screen.findByText("Nhận xét không được để trống.")).toBeInTheDocument();
    expect(onSaveComment).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText("Nhận xét"), "  Chú ý ngón vê ");
    expect(screen.getByText("16 / 2000")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Gửi nhận xét" }));
    expect(onSaveComment).toHaveBeenCalledWith("Chú ý ngón vê");
  });

  it("offers 'Cập nhật nhận xét' when a comment exists", () => {
    render(
      <SubmissionCard
        submission={{ ...SUBMISSION, comment: { content: "Tốt", updatedAt: "2026-10-16T03:00:00.000Z" } }}
        canComment
        onSaveComment={vi.fn()}
      />
    );
    expect(screen.getByLabelText("Nhận xét")).toHaveValue("Tốt");
    expect(screen.getByRole("button", { name: "Cập nhật nhận xét" })).toBeInTheDocument();
  });

  it("is read-only when comments are locked", () => {
    render(
      <SubmissionCard
        submission={{ ...SUBMISSION, comment: { content: "Tốt", updatedAt: "2026-10-16T03:00:00.000Z" } }}
        canComment={false}
        onSaveComment={vi.fn()}
      />
    );
    expect(screen.getByLabelText("Nhận xét")).toHaveAttribute("readonly");
    expect(screen.queryByRole("button", { name: /nhận xét/ })).not.toBeInTheDocument();
    expect(
      screen.getByText("Không thể nhận xét vì lớp đã kết thúc hoặc sinh viên không còn trong lớp.")
    ).toBeInTheDocument();
  });
});
