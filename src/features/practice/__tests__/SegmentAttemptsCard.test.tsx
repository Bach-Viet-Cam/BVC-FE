import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { SegmentAttemptsCard } from "@/features/practice/components/SegmentAttemptsCard";
import type { SegmentSummary } from "@/features/practice/types/practiceSegmentTypes";

const items: SegmentSummary[] = [
  {
    id: "a1",
    startSec: 10,
    endSec: 40,
    status: "COMPLETED",
    overall: 76,
    baselineOverall: 58,
    createdAt: "2026-11-03T10:00:00Z",
  },
  {
    id: "a2",
    startSec: 50,
    endSec: 70,
    status: "PROCESSING",
    overall: null,
    baselineOverall: null,
    createdAt: "2026-11-03T10:05:00Z",
  },
];

vi.mock("@/features/practice/hooks/useSegmentAttempts", () => ({
  useSegmentAttempts: () => ({ items, hasMore: false, loading: false, loadMore: vi.fn() }),
}));

function Where() {
  const location = useLocation();
  return <div data-testid="where">{location.pathname + location.search}</div>;
}

function setup() {
  render(
    <MemoryRouter initialEntries={["/start"]}>
      <Routes>
        <Route path="/start" element={<SegmentAttemptsCard submissionId="sub-1" />} />
        <Route path="*" element={<Where />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("SegmentAttemptsCard", () => {
  it("lượt đã xong mở màn Kết quả của lượt đó", async () => {
    setup();
    await userEvent.click(screen.getByText(/76%/));
    expect(screen.getByTestId("where")).toHaveTextContent("/practice/submissions/sub-1?attempt=a1");
  });

  it("lượt đang xử lý mở màn Chờ", async () => {
    setup();
    await userEvent.click(screen.getByText(/Đang xử lý/));
    expect(screen.getByTestId("where")).toHaveTextContent("/practice/submissions/sub-1/processing?attempt=a2");
  });
});
