import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MySubmissionList } from "@/features/classes/components/MySubmissionList";
import { type MySubmission } from "@/features/classes/types/assignmentTypes";

const submission = (id: string, attemptNumber: number, comment: MySubmission["comment"]): MySubmission => ({
  id,
  attemptNumber,
  status: "COMPLETED",
  accuracy: 87,
  submittedAt: "2026-10-21T07:30:00.000Z",
  comment,
});

describe("MySubmissionList", () => {
  it("shows the lecturer comment on attempts that have one", () => {
    render(
      <MySubmissionList
        submissions={[
          submission("x2", 2, { content: "Nhịp ổn, chú ý ô nhịp 12.", updatedAt: "2026-10-21T09:00:00.000Z" }),
          submission("x1", 1, null),
        ]}
      />
    );
    const [latest, first] = screen.getAllByRole("listitem");
    expect(within(latest).getByText("Lượt 2 · 21/10 14:30")).toBeInTheDocument();
    expect(within(latest).getByText("Nhận xét của giảng viên")).toBeInTheDocument();
    expect(within(latest).getByText("Nhịp ổn, chú ý ô nhịp 12.")).toBeInTheDocument();
    expect(within(latest).getByText("Cập nhật 21/10 16:00")).toBeInTheDocument();
    expect(within(first).getByText("Chưa có nhận xét")).toBeInTheDocument();
  });

  it("tells the student when nothing has been submitted", () => {
    render(<MySubmissionList submissions={[]} />);
    expect(screen.getByText("Bạn chưa nộp bài này.")).toBeInTheDocument();
  });
});
