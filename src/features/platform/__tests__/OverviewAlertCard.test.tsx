import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OverviewAlertCard } from "@/features/platform/components/OverviewAlertCard";
import { type AdminAlert } from "@/features/platform/types/adminTypes";

describe("OverviewAlertCard", () => {
  it("renders ok tone and message when alerts list is empty", () => {
    const { container } = render(<OverviewAlertCard alerts={[]} />);
    const card = container.querySelector('[data-tone="ok"]');
    expect(card).toBeInTheDocument();
    expect(screen.getByText("Không có cảnh báo")).toBeInTheDocument();
    expect(screen.getByText("Hệ thống ổn định, không có cảnh báo.")).toBeInTheDocument();
  });

  it("renders warn tone and alert items when alerts list is not empty", () => {
    const alerts: AdminAlert[] = [
      {
        level: "WARN",
        code: "STORAGE_HIGH",
        message: "Dung lượng sắp đầy (85%)",
      },
    ];
    const { container } = render(<OverviewAlertCard alerts={alerts} />);
    const card = container.querySelector('[data-tone="warn"]');
    expect(card).toBeInTheDocument();
    expect(screen.getByText("Cần xử lý")).toBeInTheDocument();
    expect(screen.getByText("Cảnh báo")).toBeInTheDocument();
    expect(screen.getByText("Dung lượng sắp đầy (85%)")).toBeInTheDocument();
  });
});
