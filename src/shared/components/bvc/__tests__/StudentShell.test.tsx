import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StudentShell } from "@/shared/components/bvc/StudentShell";

const auth = vi.hoisted(() => ({
  user: { username: "Tuấn Anh", role: 1 } as { username: string; role: number } | null,
}));
vi.mock("@/shared/context/AuthContext", () => ({ useAuth: () => ({ user: auth.user, logout: vi.fn() }) }));
vi.mock("@/shared/components/bvc/NotificationBell", () => ({ NotificationBell: () => null }));

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <StudentShell>nội dung</StudentShell>
    </MemoryRouter>
  );
  return screen.queryByRole("navigation", { name: "Thanh điều hướng" });
}

describe("StudentShell bottom tab bar", () => {
  beforeEach(() => {
    auth.user = { username: "Tuấn Anh", role: 1 };
  });

  it("shows five main tabs for a student, Hồ sơ included so Đăng xuất is always reachable", () => {
    const bar = renderAt("/home");
    expect(bar).toBeInTheDocument();
    const tabs = within(bar!).getAllByRole("link");
    expect(tabs).toHaveLength(5);
    ["Hôm nay", "Thư viện", "Bài tập", "Lịch sử", "Hồ sơ"].forEach((name, index) =>
      expect(tabs[index]).toHaveAccessibleName(name)
    );
    expect(within(bar!).getByRole("link", { name: /Hôm nay/ })).toHaveAttribute("aria-current", "page");
    expect(within(bar!).getByRole("link", { name: /Hồ sơ/ })).toHaveAttribute("href", "/profile");
  });

  it("keeps the matching tab active on related pages", () => {
    const bar = renderAt("/help");
    expect(within(bar!).getByRole("link", { name: /Hồ sơ/ })).toHaveAttribute("aria-current", "page");
    expect(within(bar!).getByRole("link", { name: /Hôm nay/ })).not.toHaveAttribute("aria-current");
  });

  it("hides the bar on focused flows that have their own bottom action bar", () => {
    expect(renderAt("/practice/submissions/s1")).not.toBeInTheDocument();
  });

  it("does not show the student bar to guests", () => {
    auth.user = null;
    expect(renderAt("/library")).not.toBeInTheDocument();
  });

  it("only offers the library and help pages to guests", () => {
    auth.user = null;
    renderAt("/library");
    const nav = within(screen.getByRole("navigation", { name: "Điều hướng chính" }));
    expect(nav.getAllByRole("link").map((link) => link.textContent)).toEqual(["Thư viện", "Trợ giúp"]);
  });

  it("offers guests a login icon on mobile that returns them to the current page", () => {
    auth.user = null;
    renderAt("/help");
    const links = screen.getAllByRole("link", { name: "Đăng nhập" });
    expect(links).toHaveLength(2);
    links.forEach((link) => expect(link).toHaveAttribute("href", "/login"));
    expect(links[0]).toHaveClass("md:hidden");
  });
});
