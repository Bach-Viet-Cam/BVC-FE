import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { AccuracyLinesChart } from "@/features/practice/components/AccuracyLinesChart";
import type { StudentStatsAssignment } from "@/features/practice/types/studentStatsTypes";

beforeAll(() => {
  // jsdom chưa có showModal cho <dialog>
  HTMLDialogElement.prototype.showModal ??= function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close ??= function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
  };
});

const assignments: StudentStatsAssignment[] = [
  {
    id: "a1",
    title: "Độc tấu",
    kind: "SOLO",
    bestAccuracy: 85,
    attemptCount: 2,
    attempts: [
      { submissionId: "s1", attemptNo: 1, submittedAt: "2026-11-01T02:00:00Z", status: "COMPLETED", accuracy: 70, hasComment: false },
      { submissionId: "s2", attemptNo: 2, submittedAt: "2026-11-02T02:00:00Z", status: "COMPLETED", accuracy: 85, hasComment: true },
    ],
  },
  {
    id: "a2",
    title: "Hòa tấu",
    kind: "ENSEMBLE",
    bestAccuracy: 60,
    attemptCount: 1,
    attempts: [
      { submissionId: "s3", attemptNo: 1, submittedAt: "2026-11-03T02:00:00Z", status: "COMPLETED", accuracy: 60, hasComment: false },
    ],
  },
  { id: "a3", title: "Bài thêm", kind: "BONUS", bestAccuracy: null, attemptCount: 0, attempts: [] },
];

function Harness({ onPointClick }: { onPointClick?: (id: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <AccuracyLinesChart
      assignments={assignments}
      selectedAssignmentId={selected}
      onSelectAssignment={setSelected}
      onPointClick={onPointClick}
    />
  );
}

const drawnSeries = (container: HTMLElement) =>
  [...container.querySelectorAll("[data-series]")].map((node) => node.getAttribute("data-series"));

describe("AccuracyLinesChart", () => {
  it("lists every assignment in the filter, disabling ones without scores, and a legend per drawn line", () => {
    render(<Harness />);
    const filter = screen.getByRole("combobox", { name: "Lọc theo bài tập" });
    expect(within(filter).getByRole("option", { name: "Bài thêm (chưa có điểm)" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Ẩn đường Độc tấu" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ẩn đường Hòa tấu" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Bài thêm/ })).not.toBeInTheDocument();
  });

  it("draws only the chosen assignment after filtering", async () => {
    const { container } = render(<Harness />);
    expect(drawnSeries(container)).toEqual(["a1", "a2"]);
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Lọc theo bài tập" }), "a1");
    expect(drawnSeries(container)).toEqual(["a1"]);
  });

  it("hides a line from its legend button", async () => {
    const { container } = render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Ẩn đường Hòa tấu" }));
    expect(drawnSeries(container)).toEqual(["a1"]);
    expect(screen.getByRole("button", { name: "Hiện đường Hòa tấu" })).toHaveAttribute("aria-pressed", "false");
  });

  it("opens a submission when a point is clicked", () => {
    const onPointClick = vi.fn();
    const { container } = render(<Harness onPointClick={onPointClick} />);
    fireEvent.click(container.querySelector('[data-point="s2"]')!);
    expect(onPointClick).toHaveBeenCalledWith("s2");
  });

  it("does not make points clickable without a handler", () => {
    const { container } = render(<Harness />);
    expect(container.querySelector('[data-point="s2"]')).toHaveAttribute("role", "presentation");
  });

  it("opens the fullscreen view", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Xem toàn màn hình" }));
    expect(document.querySelector("dialog[open]")).not.toBeNull();
  });
});
