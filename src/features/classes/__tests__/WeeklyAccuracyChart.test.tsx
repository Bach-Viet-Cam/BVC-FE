import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WeeklyAccuracyChart } from "@/features/classes/components/WeeklyAccuracyChart";
import { type WeeklyAverage } from "@/features/classes/types/progressTypes";

const week = (index: number, average: number | null): WeeklyAverage => ({
  week: index,
  startDate: `2026-09-0${index}`,
  endDate: `2026-09-1${index}`,
  average,
});

const WEEKS = [week(1, 50), week(2, 62.5), week(3, null), week(4, 70), week(5, 80), week(6, null)];

describe("WeeklyAccuracyChart", () => {
  it("is an accessible image with W1–W6 labels and a threshold line", () => {
    render(<WeeklyAccuracyChart weekly={WEEKS} minAccuracy={70} />);
    const chart = screen.getByRole("img");
    expect(chart).toHaveAttribute("aria-label", expect.stringContaining("Độ chính xác trung bình theo tuần"));
    for (const label of ["W1", "W2", "W3", "W4", "W5", "W6"])
      expect(within(chart).getByText(label)).toBeInTheDocument();
    expect(within(chart).getByText("Ngưỡng 70%")).toBeInTheDocument();
  });

  it("draws one point per week with data and breaks the line at empty weeks", () => {
    const { container } = render(<WeeklyAccuracyChart weekly={WEEKS} minAccuracy={70} />);
    expect(screen.getAllByTestId("chart-point")).toHaveLength(4);
    expect(container.querySelectorAll('[data-testid="chart-segment"]')).toHaveLength(2);
  });

  it("shows a tooltip for the hovered week", () => {
    render(<WeeklyAccuracyChart weekly={WEEKS} minAccuracy={70} />);
    fireEvent.mouseEnter(screen.getAllByTestId("chart-hit")[1]);
    expect(screen.getByRole("tooltip")).toHaveTextContent("W2 · 62.5%");
  });

  it("offers a table view including empty weeks", () => {
    render(<WeeklyAccuracyChart weekly={WEEKS} minAccuracy={70} />);
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(7);
    expect(rows[3]).toHaveTextContent("W3");
    expect(rows[3]).toHaveTextContent("—");
  });
});
