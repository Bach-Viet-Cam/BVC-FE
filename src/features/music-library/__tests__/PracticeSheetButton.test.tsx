import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PracticeSheetButton } from "@/features/music-library/components/PracticeSheetButton";

const viewer = vi.hoisted(() => ({ role: "student" as string }));
vi.mock("@/shared/hooks/useViewerRole", () => ({ useViewerRole: () => viewer.role }));

function renderButton() {
  render(
    <MemoryRouter>
      <PracticeSheetButton sheetId="s1" sheetName="Bản dễ" assignmentId="a1" />
    </MemoryRouter>
  );
}

describe("PracticeSheetButton", () => {
  beforeEach(() => {
    viewer.role = "student";
  });

  it("takes a student straight to recording that sheet, keeping the assignment", () => {
    renderButton();
    expect(screen.getByRole("link", { name: "Luyện tập Bản dễ" })).toHaveAttribute(
      "href",
      "/practice/sheets/s1/record?assignmentId=a1"
    );
  });

  it("asks a guest to sign in first", async () => {
    viewer.role = "guest";
    renderButton();
    await userEvent.click(screen.getByRole("button", { name: "Luyện tập Bản dễ" }));
    expect(await screen.findByRole("link", { name: /Đăng nhập bằng Google/ })).toBeInTheDocument();
  });

  it("is hidden for lecturers", () => {
    viewer.role = "teacher";
    renderButton();
    expect(screen.queryByText("Luyện tập")).not.toBeInTheDocument();
  });
});
