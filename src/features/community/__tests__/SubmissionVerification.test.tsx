import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SubmissionSharing, SubmissionVerification } from "@/features/community/components/SubmissionVerification";
import { verifiedApi } from "@/features/community/api/verifiedApi";

vi.mock("@/features/community/api/verifiedApi", () => ({
  verifiedApi: { review: vi.fn(), decide: vi.fn(), consent: vi.fn() },
}));
const pending = { review: null, shareConsent: false, canReview: true, verifiedContentId: null };

const approved = {
  ...pending,
  canReview: false,
  verifiedContentId: "verified-b",
  review: { status: "APPROVED" as const, reviewedAt: "2026-11-05T04:00:00.000Z", reason: null },
};

async function openVerification() {
  const trigger = await screen.findByRole("button", { name: "Xác minh bản thu" });
  await waitFor(() => expect(trigger).toBeEnabled());
  await userEvent.click(trigger);
  await screen.findByRole("dialog", { name: "Xác minh bản thu" });
  await screen.findByRole("button", { name: "Xác minh" });
}

describe("Submission verification lifecycle", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(verifiedApi.review).mockResolvedValue(pending);
    vi.mocked(verifiedApi.decide).mockResolvedValue(approved);
  });
  it("never grants sharing implicitly and sends explicit student consent", async () => {
    vi.mocked(verifiedApi.consent).mockResolvedValue({ ...pending, shareConsent: true });
    render(<SubmissionSharing submissionId="submission-a" />);
    const checkbox = await screen.findByRole("checkbox");
    await waitFor(() => expect(checkbox).toBeEnabled());
    expect(checkbox).not.toBeChecked();
    expect(verifiedApi.consent).not.toHaveBeenCalled();
    await userEvent.click(checkbox);
    expect(verifiedApi.consent).toHaveBeenCalledWith("submission-a", true);
  });
  it("approves the selected recording and keeps the AI status separate", async () => {
    vi.mocked(verifiedApi.decide).mockResolvedValue(approved);
    render(<SubmissionVerification submissionId="submission-b" />);
    await openVerification();
    expect(verifiedApi.decide).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Xác minh" }));
    expect(await screen.findByRole("heading", { name: "Đã xác minh" })).toBeInTheDocument();
    expect(verifiedApi.decide).toHaveBeenCalledWith("submission-b", "APPROVE", undefined, false);
  });
  it("offers confirmation and cancellation without a rejection action", async () => {
    render(<SubmissionVerification submissionId="submission-c" />);
    await openVerification();
    expect(screen.queryByText(/Không bắt buộc|Bản thu chưa phù hợp|Từ chối/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hủy" })).toBeEnabled();
    expect(verifiedApi.decide).not.toHaveBeenCalled();
  });
  it("keeps approval optional and does not expose the confirmation on the card", async () => {
    render(<SubmissionVerification submissionId="optional" />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Xác minh bản thu" })).toBeEnabled());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Xác minh" })).not.toBeInTheDocument();
    expect(screen.queryByText("Sinh viên chưa đồng ý chia sẻ")).not.toBeInTheDocument();
    expect(verifiedApi.decide).not.toHaveBeenCalled();
  });
  it("allows deferring without submitting a decision", async () => {
    render(<SubmissionVerification submissionId="defer" submissionLabel="Lần nộp 1" />);
    await openVerification();
    expect(screen.getByText("Lần nộp 1")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Hủy" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(verifiedApi.decide).not.toHaveBeenCalled();
  });
  it("requires acknowledgement before manual verification", async () => {
    render(<SubmissionVerification submissionId="manual" manual />);
    await openVerification();
    const confirm = screen.getByRole("button", { name: "Xác minh" });
    expect(confirm).toBeDisabled();
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(confirm);
    expect(verifiedApi.decide).toHaveBeenCalledWith("manual", "APPROVE", undefined, true);
  });
  it("does not show success before the API returns and blocks repeat confirmation", async () => {
    let complete!: (value: typeof approved) => void;
    vi.mocked(verifiedApi.decide).mockImplementation(
      () =>
        new Promise((resolve) => {
          complete = resolve;
        })
    );
    render(<SubmissionVerification submissionId="saving" />);
    await openVerification();
    await userEvent.click(screen.getByRole("button", { name: "Xác minh" }));
    expect(screen.getByRole("button", { name: "Đang xử lý..." })).toBeDisabled();
    expect(screen.queryByRole("heading", { name: "Đã xác minh" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Đóng" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(verifiedApi.decide).toHaveBeenCalledTimes(1);
    await act(async () => complete(approved));
    expect(await screen.findByRole("heading", { name: "Đã xác minh" })).toBeInTheDocument();
  });
  it("keeps API errors inside the dialog and supports retry", async () => {
    vi.mocked(verifiedApi.decide).mockRejectedValueOnce(new Error("Không lưu được quyết định."));
    render(<SubmissionVerification submissionId="retry" />);
    await openVerification();
    await userEvent.click(screen.getByRole("button", { name: "Xác minh" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Không lưu được quyết định.");
    expect(screen.queryByRole("heading", { name: "Đã xác minh" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Xác minh" }));
    expect(await screen.findByRole("heading", { name: "Đã xác minh" })).toBeInTheDocument();
  });
  it("explains that approval without sharing consent keeps the recording hidden", async () => {
    render(<SubmissionVerification submissionId="private" />);
    await openVerification();
    expect(screen.getByText("Sinh viên chưa đồng ý chia sẻ. Bản thu sẽ được giữ ẩn.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Xác minh" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Bản thu được giữ ẩn.");
  });
});
