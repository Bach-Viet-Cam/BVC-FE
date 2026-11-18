import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { AiFeedbackRating } from "@/features/platform/components/AiFeedbackRating";
import { aiRatingApi, type AiRatingState } from "@/features/platform/api/aiRatingApi";

vi.mock("@/features/platform/api/aiRatingApi", () => ({ aiRatingApi: { get: vi.fn(), save: vi.fn() } }));
const state: AiRatingState = {
  feedback: "Giữ đều nhịp câu cuối.",
  feedbackKey: "a".repeat(64),
  canComment: false,
  rating: null,
};
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(aiRatingApi.get).mockResolvedValue(state);
  vi.mocked(aiRatingApi.save).mockResolvedValue({
    ...state,
    rating: { id: "rating", accuracyStars: 4, satisfactionStars: 5, comment: null, updatedAt: "2026-11-12T10:00:00Z" },
  });
});

it("students may skip, and submit two star scores without a comment", async () => {
  render(<AiFeedbackRating submissionId="s1" />);
  expect(await screen.findByRole("heading", { name: "Đánh giá phản hồi AI" })).toBeInTheDocument();
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  expect(aiRatingApi.save).not.toHaveBeenCalled();
  const submit = screen.getByRole("button", { name: "Gửi đánh giá" });
  expect(submit).toBeDisabled();
  await userEvent.click(
    within(screen.getByRole("group", { name: "Độ chính xác của AI" })).getByRole("radio", { name: "4 sao" })
  );
  await userEvent.click(
    within(screen.getByRole("group", { name: "Mức độ hài lòng" })).getByRole("radio", { name: "5 sao" })
  );
  await userEvent.click(submit);
  expect(await screen.findByRole("status")).toHaveTextContent("Đã lưu đánh giá");
  expect(aiRatingApi.save).toHaveBeenCalledWith("s1", {
    feedbackKey: state.feedbackKey,
    accuracyStars: 4,
    satisfactionStars: 5,
  });
});
it("lecturers see the exact feedback and can add a comment", async () => {
  vi.mocked(aiRatingApi.get).mockResolvedValue({
    ...state,
    canComment: true,
    rating: {
      id: "r",
      accuracyStars: 3,
      satisfactionStars: 4,
      comment: "Nhận xét cũ",
      updatedAt: "2026-11-12T10:00:00Z",
    },
  });
  render(<AiFeedbackRating submissionId="s2" showFeedback />);
  expect(await screen.findByText(state.feedback!)).toBeInTheDocument();
  const comment = screen.getByRole("textbox", { name: "Nhận xét về độ chính xác của AI" });
  expect(comment).toHaveValue("Nhận xét cũ");
  await userEvent.clear(comment);
  await userEvent.type(comment, "AI chưa chỉ rõ câu nào.");
  await userEvent.click(screen.getByRole("button", { name: "Cập nhật đánh giá" }));
  expect(aiRatingApi.save).toHaveBeenCalledWith(
    "s2",
    expect.objectContaining({ accuracyStars: 3, satisfactionStars: 4, comment: "AI chưa chỉ rõ câu nào." })
  );
});
it("does not show a rating form when AI feedback is unavailable", async () => {
  vi.mocked(aiRatingApi.get).mockResolvedValue({ ...state, feedback: null, feedbackKey: null });
  const { container } = render(<AiFeedbackRating submissionId="none" />);
  await act(async () => {});
  expect(container.querySelector("form")).toBeNull();
});

it("opens on demand, closes after saving and restores scores when editing", async () => {
  render(<AiFeedbackRating submissionId="dialog" presentation="dialog" />);
  await userEvent.click(await screen.findByRole("button", { name: "Đánh giá phản hồi AI" }));
  const dialog = await screen.findByRole("dialog");
  expect(within(dialog).queryByRole("textbox")).not.toBeInTheDocument();
  await userEvent.click(
    within(within(dialog).getByRole("group", { name: "Độ chính xác của AI" })).getByRole("radio", { name: "4 sao" })
  );
  await userEvent.click(
    within(within(dialog).getByRole("group", { name: "Mức độ hài lòng" })).getByRole("radio", { name: "5 sao" })
  );
  await userEvent.click(within(dialog).getByRole("button", { name: "Gửi đánh giá" }));
  expect(await screen.findByRole("button", { name: "Sửa đánh giá" })).toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Sửa đánh giá" }));
  const reopened = await screen.findByRole("dialog");
  expect(
    within(within(reopened).getByRole("group", { name: "Độ chính xác của AI" })).getByRole("radio", { name: "4 sao" })
  ).toBeChecked();
  expect(
    within(within(reopened).getByRole("group", { name: "Mức độ hài lòng" })).getByRole("radio", { name: "5 sao" })
  ).toBeChecked();
});

it("closing the student dialog does not submit a rating", async () => {
  render(<AiFeedbackRating submissionId="cancel" presentation="dialog" />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await userEvent.click(await screen.findByRole("button", { name: "Đánh giá phản hồi AI" }));
  await userEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Đóng" }));
  expect(aiRatingApi.save).not.toHaveBeenCalled();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("keeps the student dialog open when saving fails", async () => {
  vi.mocked(aiRatingApi.save).mockRejectedValue(new Error("Không thể lưu"));
  render(<AiFeedbackRating submissionId="error" presentation="dialog" />);
  await userEvent.click(await screen.findByRole("button", { name: "Đánh giá phản hồi AI" }));
  const dialog = await screen.findByRole("dialog");
  for (const group of within(dialog).getAllByRole("group")) {
    await userEvent.click(within(group).getByRole("radio", { name: "4 sao" }));
  }
  await userEvent.click(within(dialog).getByRole("button", { name: "Gửi đánh giá" }));
  expect(await within(dialog).findByRole("alert")).toBeInTheDocument();
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(within(dialog).getByRole("button", { name: "Gửi đánh giá" })).toBeEnabled();
});

it("does not rate a different feedback version from the one the student has read", async () => {
  const reload = vi.fn();
  render(<AiFeedbackRating submissionId="stale" expectedFeedback="Nội dung cũ" onReloadFeedback={reload} />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Phản hồi AI đã được cập nhật.");
  expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Tải lại kết quả" }));
  expect(reload).toHaveBeenCalled();
  expect(aiRatingApi.save).not.toHaveBeenCalled();
});
