import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { LandingPage } from "@/features/landing/pages/LandingPage";
import { ROLES } from "@/shared/constants/roles";
import type { UserInfo } from "@/shared/context/AuthContext";

const auth = vi.hoisted(() => ({ user: null as UserInfo | null, isLoading: false }));
vi.mock("@/shared/context/AuthContext", () => ({ useAuth: () => auth }));

// jsdom không có IntersectionObserver / matchMedia mà hiệu ứng cuộn của framer-motion cần
beforeAll(() => {
  class IntersectionObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
  );
});

function renderPage() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );
}

describe("LandingPage", () => {
  beforeEach(() => {
    auth.user = null;
    auth.isLoading = false;
  });

  it("shows the hero with links to login and the public library", () => {
    renderPage();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Luyện đàn dân tộc với phản hồi");
    screen
      .getAllByRole("link", { name: "Bắt đầu luyện tập" })
      .forEach((link) => expect(link).toHaveAttribute("href", "/login"));
    expect(screen.getByRole("link", { name: "Xem thư viện bài hát" })).toHaveAttribute("href", "/library");
    const nav = screen.getByRole("navigation", { name: "Điều hướng trang giới thiệu" });
    expect(within(nav).getByRole("link", { name: "Tính năng" })).toHaveAttribute("href", "#features");
    expect(within(nav).getByRole("link", { name: "Thư viện" })).toHaveAttribute("href", "/library");
    expect(within(nav).getByRole("link", { name: "Câu hỏi thường gặp" })).toHaveAttribute("href", "/help");
    expect(within(nav).getByRole("link", { name: "Đăng nhập" })).toHaveAttribute("href", "/login");
  });

  it("shows the signed-in user's name instead of the login button, linking to their home", () => {
    auth.user = { userId: "u1", username: "Nguyễn Văn A", email: "a@bvc.vn", role: ROLES.STUDENT };
    renderPage();

    const nav = screen.getByRole("navigation", { name: "Điều hướng trang giới thiệu" });
    expect(within(nav).getByRole("link", { name: "Nguyễn Văn A" })).toHaveAttribute("href", "/home");
    expect(screen.queryByRole("link", { name: "Đăng nhập" })).not.toBeInTheDocument();
    screen
      .getAllByRole("link", { name: "Bắt đầu luyện tập" })
      .forEach((link) => expect(link).toHaveAttribute("href", "/home"));
  });

  it("sends a signed-in lecturer to the lecturer home", () => {
    auth.user = { userId: "u2", username: "Cô Lan", email: "lan@bvc.vn", role: ROLES.TEACHER };
    renderPage();

    const nav = screen.getByRole("navigation", { name: "Điều hướng trang giới thiệu" });
    expect(within(nav).getByRole("link", { name: "Cô Lan" })).toHaveAttribute("href", "/teacher/home");
  });

  it("lists the contact email, phone and feedback form in the footer", () => {
    renderPage();

    const footer = within(screen.getByRole("contentinfo"));
    expect(footer.getByRole("link", { name: "bachvietcam.work@gmail.com" })).toHaveAttribute(
      "href",
      "mailto:bachvietcam.work@gmail.com"
    );
    expect(footer.getByRole("link", { name: "0868 112 005" })).toHaveAttribute("href", "tel:0868112005");
    expect(footer.getByText("Đại Học FPT Hà Nội")).toBeInTheDocument();
    expect(footer.queryByRole("link", { name: "Thư viện bài hát" })).not.toBeInTheDocument();
    const feedback = footer.getByRole("link", { name: "Gửi góp ý" });
    expect(feedback).toHaveAttribute("href", "https://forms.gle/HboKU3YcHNUYRwVq9");
    expect(feedback).toHaveAttribute("target", "_blank");
    expect(screen.queryByRole("region", { name: /thư viện/i })).not.toBeInTheDocument();
  });
});
