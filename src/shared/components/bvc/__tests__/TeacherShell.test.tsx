import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { TeacherShell } from "@/shared/components/bvc/TeacherShell";

vi.mock("@/shared/context/AuthContext", () => ({
  useAuth: () => ({ user: { username: "gv01" }, logout: vi.fn() }),
}));
vi.mock("@/shared/components/bvc/NotificationBell", () => ({ NotificationBell: () => null }));

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <TeacherShell>nội dung</TeacherShell>
    </MemoryRouter>
  );
  // Sidebar desktop là nav đầu tiên, nav thứ hai là thanh cuộn ngang trên mobile
  return screen.getAllByRole("navigation", { name: "Điều hướng giảng viên" });
}

describe("TeacherShell menu", () => {
  it("shows the four top-level entries, groups collapsed when not active", () => {
    const [sidebar] = renderAt("/teacher/home");
    const nav = within(sidebar);

    expect(nav.getByRole("link", { name: "Trang chủ" })).toBeInTheDocument();
    expect(nav.getByRole("link", { name: "Lớp học" })).toBeInTheDocument();
    expect(nav.getByRole("button", { name: "Thử thách" })).toHaveAttribute("aria-expanded", "false");
    expect(nav.getByRole("button", { name: "Thư viện học liệu" })).toHaveAttribute("aria-expanded", "false");
    expect(nav.queryByRole("link", { name: "Bài tập" })).not.toBeInTheDocument();
    expect(nav.queryByRole("link", { name: "Quản lý thử thách" })).not.toBeInTheDocument();
  });

  it("opens the group of the current page and toggles on click", async () => {
    const [sidebar] = renderAt("/library/song-1");
    const nav = within(sidebar);

    expect(nav.getByRole("button", { name: "Thư viện học liệu" })).toHaveAttribute("aria-expanded", "true");
    expect(nav.getByRole("link", { name: "Thư viện công khai" })).toHaveClass("bg-bvc-ink");
    expect(nav.getByRole("link", { name: "Thư viện của tôi" })).not.toHaveClass("bg-bvc-ink");

    await userEvent.click(nav.getByRole("button", { name: "Thử thách" }));
    expect(nav.getByRole("link", { name: "Bảng xếp hạng" })).toBeInTheDocument();
  });

  it("keeps Lớp học active on class sub-pages", () => {
    const [sidebar] = renderAt("/teacher/assignments/a1");
    expect(within(sidebar).getByRole("link", { name: "Lớp học" })).toHaveClass("bg-bvc-ink");
  });

  it("flattens groups in the mobile nav", () => {
    const [, mobile] = renderAt("/teacher/home");
    const labels = within(mobile)
      .getAllByRole("link")
      .map((link) => link.textContent);
    expect(labels).toEqual([
      "Trang chủ",
      "Lớp học",
      "Quản lý thử thách",
      "Bảng xếp hạng",
      "Thư viện của tôi",
      "Thư viện công khai",
      "Phân loại nội dung",
      "Nội dung đã xác minh",
    ]);
  });
});
