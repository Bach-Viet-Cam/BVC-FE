import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { LandingPage } from "@/features/landing/pages/LandingPage";

vi.mock("@/features/music-library/hooks/useTrendingSongs", () => ({
  useTrendingSongs: () => ({ songs: [], error: null, isFirstLoad: false }),
}));
vi.mock("@/features/music-library/hooks/useLibrarySongs", () => ({
  useLibrarySongs: () => ({
    result: {
      data: [
        {
          id: "p1",
          title: "Lý chiều chiều",
          composer: "Dân gian",
          description: "",
          genre: { id: "g", name: "Dân ca Trung Bộ" },
          instruments: [],
          instrumentCount: 2,
          coverTone: "accent",
          visibility: "PUBLIC",
          createdAt: "",
          updatedAt: "",
          isSaved: false,
        },
        {
          id: "p2",
          title: "Chưa có bản nhạc",
          composer: "",
          description: "",
          genre: { id: "g", name: "Dân ca Nam Bộ" },
          instruments: [],
          instrumentCount: 0,
          coverTone: "bar",
          visibility: "PUBLIC",
          createdAt: "",
          updatedAt: "",
          isSaved: false,
        },
      ],
    },
  }),
}));

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
  it("shows the hero with links to login and the public library", () => {
    renderPage();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Luyện đàn dân tộc với phản hồi");
    // Hero và phần 4 bước đều có nút này
    screen
      .getAllByRole("link", { name: "Bắt đầu luyện tập" })
      .forEach((link) => expect(link).toHaveAttribute("href", "/login"));
    expect(screen.getByRole("link", { name: "Xem thư viện bài hát" })).toHaveAttribute("href", "/library");
    const nav = screen.getByRole("navigation", { name: "Điều hướng trang giới thiệu" });
    expect(within(nav).getByRole("link", { name: "Tính năng" })).toHaveAttribute("href", "#features");
  });

  it("switches the practice step when another tab is chosen", async () => {
    renderPage();

    await userEvent.click(screen.getByRole("tab", { name: /Thu âm & nộp/ }));

    expect(screen.getByRole("tab", { name: /Thu âm & nộp/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: "Thu âm và nộp bài" })).toBeInTheDocument();
  });

  it("shows real library songs that have sheet music and no audience section", () => {
    renderPage();

    const library = screen.getByRole("region", { name: /thư viện/i });
    expect(within(library).getByRole("link", { name: /Lý chiều chiều/ })).toHaveAttribute("href", "/library/p1");
    expect(within(library).queryByText("Chưa có bản nhạc")).not.toBeInTheDocument();
    expect(screen.queryByText("Dành cho ai")).not.toBeInTheDocument();
  });
});
