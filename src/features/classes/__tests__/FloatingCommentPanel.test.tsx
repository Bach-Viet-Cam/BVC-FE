import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { COMMENT_PANEL_STORAGE_KEY, FloatingCommentPanel } from "@/features/classes/components/FloatingCommentPanel";
import { COMMENT_LOCKED_MESSAGE } from "@/features/classes/components/SubmissionCard";

// hidden: true để vẫn tìm thấy ô khi khung đang thu nhỏ, rồi kiểm tra bằng toBeVisible
const commentBox = () => screen.queryByRole("textbox", { name: "Nhận xét", hidden: true });

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("FloatingCommentPanel", () => {
  it("keeps unsent text when collapsed and reopened", async () => {
    render(<FloatingCommentPanel submissionLabel="Lần 2" comment={null} canComment onSave={vi.fn()} />);
    await userEvent.type(commentBox()!, "Tốt");
    await userEvent.click(screen.getByRole("button", { name: "Thu nhỏ nhận xét" }));
    expect(commentBox()).not.toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: /Mở nhận xét/ }));
    expect(commentBox()).toBeVisible();
    expect(commentBox()).toHaveValue("Tốt");
  });

  it("remembers the collapsed state", async () => {
    const { unmount } = render(<FloatingCommentPanel submissionLabel="Lần 2" comment={null} canComment onSave={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Thu nhỏ nhận xét" }));
    expect(localStorage.getItem(COMMENT_PANEL_STORAGE_KEY)).toBe("1");
    unmount();
    render(<FloatingCommentPanel submissionLabel="Lần 2" comment={null} canComment onSave={vi.fn()} />);
    expect(commentBox()).not.toBeVisible();
  });

  it("still opens when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    render(<FloatingCommentPanel submissionLabel="Lần 2" comment={null} canComment onSave={vi.fn()} />);
    expect(commentBox()).toBeVisible();
  });

  it("is read-only with the lock message when commenting is not allowed", () => {
    render(
      <FloatingCommentPanel
        submissionLabel="Lần 2"
        comment={{ content: "Cũ", updatedAt: "2026-11-01T00:00:00Z" }}
        canComment={false}
        onSave={vi.fn()}
      />
    );
    expect(commentBox()).toHaveAttribute("readonly");
    expect(screen.getByText(COMMENT_LOCKED_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Gửi nhận xét" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cập nhật nhận xét" })).not.toBeInTheDocument();
  });

  it("sends the trimmed comment and shows server field errors", async () => {
    const onSave = vi.fn().mockResolvedValue([{ field: "content", message: "Lỗi máy chủ" }]);
    render(<FloatingCommentPanel submissionLabel="Lần 2" comment={null} canComment onSave={onSave} />);
    await userEvent.type(commentBox()!, "  Cần luyện nhịp  ");
    await userEvent.click(screen.getByRole("button", { name: "Gửi nhận xét" }));
    expect(onSave).toHaveBeenCalledWith("Cần luyện nhịp");
    expect(await screen.findByText("Lỗi máy chủ")).toBeInTheDocument();
  });
});
