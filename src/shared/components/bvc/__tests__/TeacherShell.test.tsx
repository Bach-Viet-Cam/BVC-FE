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
  // Sidebar desktop là nav duy nhất lúc đầu; menu mobile chỉ render khi mở ngăn kéo
  return screen.getAllByRole("navigation", { name: "Điều hướng giảng viên" });
}

describe("TeacherShell menu", () => {
  it("shows the four top-level entries, groups collapsed when not active", () => {
    const [sidebar] = renderAt("/teacher/home");
    const nav = within(sidebar);

    expect(nav.getByRole("link", { name: "Trang chủ" })).toBeInTheDocument();
    expect(nav.getByRole("button", { name: "Lớp học" })).toHaveAttribute("aria-expanded", "false");
    expect(nav.getByRole("button", { name: "Thử thách" })).toHaveAttribute("aria-expanded", "false");
    expect(nav.getByRole("button", { name: "Thư viện học liệu" })).toHaveAttribute("aria-expanded", "false");
    expect(nav.queryByRole("link", { name: "Bài tập" })).not.toBeInTheDocument();
    expect(nav.queryByRole("link", { name: "Quản lý thử thách" })).not.toBeInTheDocument();
  });

  it("opens the group of the current page and toggles on click", async () => {
    const [sidebar] = renderAt("/library/song-1");
    const nav = within(sidebar);

    expect(nav.getByRole("button", { name: "Thư viện học liệu" })).toHaveAttribute("aria-expanded", "true");
    expect(nav.getByRole("link", { name: "Thư viện công khai" })).toHaveAttribute("aria-current", "page");
    expect(nav.getByRole("link", { name: "Thư viện của tôi" })).not.toHaveAttribute("aria-current");

    await userEvent.click(nav.getByRole("button", { name: "Thử thách" }));
    expect(nav.getByRole("link", { name: "Bảng xếp hạng" })).toBeInTheDocument();
  });

  it("keeps Danh sách lớp active on class sub-pages", () => {
    const [sidebar] = renderAt("/teacher/classes/c1/students/s1");
    const nav = within(sidebar);
    expect(nav.getByRole("button", { name: "Lớp học" })).toHaveAttribute("aria-expanded", "true");
    expect(nav.getByRole("link", { name: "Danh sách lớp" })).toHaveAttribute("aria-current", "page");
    expect(nav.getByRole("link", { name: "Bài tập" })).not.toHaveAttribute("aria-current");
  });

  it("has its own Bài tập item for all classes' assignments, review pages are separate items", () => {
    const [sidebar] = renderAt("/teacher/assignments/a1");
    const nav = within(sidebar);
    expect(nav.getByRole("button", { name: "Lớp học" })).toHaveAttribute("aria-expanded", "true");
    expect(nav.getByRole("link", { name: "Bài tập" })).toHaveAttribute("aria-current", "page");
    expect(nav.getByRole("link", { name: "Danh sách lớp" })).not.toHaveAttribute("aria-current");
    expect(nav.getByRole("link", { name: "Duyệt bài nộp" })).not.toHaveAttribute("aria-current");
    expect(nav.getByRole("link", { name: "Đánh giá sinh viên" })).not.toHaveAttribute("aria-current");
  });

  it("mobile: no flattened tab strip, the grouped menu opens in a drawer and closes on navigation", async () => {
    renderAt("/teacher/home");
    expect(screen.getAllByRole("navigation", { name: "Điều hướng giảng viên" })).toHaveLength(1);

    await userEvent.click(screen.getByRole("button", { name: "Mở menu" }));
    const drawer = within(await screen.findByRole("dialog", { name: "Menu" }));
    expect(drawer.getByRole("link", { name: "Trang chủ" })).toHaveAttribute("aria-current", "page");
    expect(drawer.getByRole("button", { name: "Lớp học" })).toHaveAttribute("aria-expanded", "false");
    expect(drawer.getByRole("button", { name: "Đăng xuất" })).toBeInTheDocument();

    await userEvent.click(drawer.getByRole("button", { name: "Lớp học" }));
    await userEvent.click(drawer.getByRole("link", { name: "Duyệt bài nộp" }));
    await vi.waitFor(() => expect(screen.queryByRole("dialog", { name: "Menu" })).not.toBeInTheDocument());
  });
});
