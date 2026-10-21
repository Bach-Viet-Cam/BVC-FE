import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GradingSettingsPage } from "@/features/platform/pages/GradingSettingsPage";
import { settingsApi } from "@/features/platform/api/settingsApi";
import { toast } from "@/shared/components/ui/toast";

vi.mock("@/features/platform/api/settingsApi", () => ({
  settingsApi: { getGradingSettings: vi.fn(), updateGradingSettings: vi.fn() },
}));
vi.mock("@/shared/components/ui/toast", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const renderPage = () =>
  render(
    <MemoryRouter>
      <GradingSettingsPage />
    </MemoryRouter>
  );

describe("GradingSettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(settingsApi.getGradingSettings).mockResolvedValue({
      data: {
        data: { minAccuracy: 70, atRiskMargin: 40, updatedAt: "2026-10-16T02:00:00.000Z" },
        message: "",
        success: true,
      },
    } as never);
  });

  it("shows the stored values and explains the three statuses", async () => {
    renderPage();
    expect(await screen.findByDisplayValue("70")).toBeInTheDocument();
    expect(screen.getByLabelText(/Biên có nguy cơ/)).toHaveValue("40");
    expect(screen.getByText("≥ 70%: Đúng tiến độ · 30–69%: Có nguy cơ · < 30%: Chậm tiến độ")).toBeInTheDocument();
  });

  it("updates the explanation while typing", async () => {
    renderPage();
    const minimum = await screen.findByLabelText(/Độ chính xác tối thiểu/);
    await userEvent.clear(minimum);
    await userEvent.type(minimum, "60");
    const margin = screen.getByLabelText(/Biên có nguy cơ/);
    await userEvent.clear(margin);
    await userEvent.type(margin, "20");
    expect(screen.getByText("≥ 60%: Đúng tiến độ · 40–59%: Có nguy cơ · < 40%: Chậm tiến độ")).toBeInTheDocument();
  });

  it("rejects a margin above the minimum without calling the API", async () => {
    renderPage();
    const margin = await screen.findByLabelText(/Biên có nguy cơ/);
    await userEvent.clear(margin);
    await userEvent.type(margin, "80");
    await userEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(await screen.findByText("Biên có nguy cơ không được lớn hơn độ chính xác tối thiểu.")).toBeInTheDocument();
    expect(settingsApi.updateGradingSettings).not.toHaveBeenCalled();
  });

  it("rejects values outside 0–100", async () => {
    renderPage();
    const minimum = await screen.findByLabelText(/Độ chính xác tối thiểu/);
    await userEvent.clear(minimum);
    await userEvent.type(minimum, "101");
    await userEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(await screen.findByText("Độ chính xác tối thiểu phải nằm trong khoảng từ 0 đến 100.")).toBeInTheDocument();
  });

  it("saves and shows the success toast", async () => {
    vi.mocked(settingsApi.updateGradingSettings).mockResolvedValue({
      data: {
        data: { minAccuracy: 60, atRiskMargin: 30, updatedAt: "2026-10-16T03:00:00.000Z" },
        message: "Lưu cấu hình chấm điểm thành công.",
        success: true,
      },
    } as never);
    renderPage();
    const minimum = await screen.findByLabelText(/Độ chính xác tối thiểu/);
    await userEvent.clear(minimum);
    await userEvent.type(minimum, "60");
    const margin = screen.getByLabelText(/Biên có nguy cơ/);
    await userEvent.clear(margin);
    await userEvent.type(margin, "30");
    await userEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(settingsApi.updateGradingSettings).toHaveBeenCalledWith({ minAccuracy: 60, atRiskMargin: 30 });
    expect(toast.success).toHaveBeenCalledWith("Lưu cấu hình chấm điểm thành công.");
  });
});
