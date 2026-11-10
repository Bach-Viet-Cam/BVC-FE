import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { detectInstallPlatform } from "@/features/landing/constants/installGuide";
import { InstallGuidePage } from "@/features/landing/pages/InstallGuidePage";

describe("InstallGuidePage", () => {
  it("shows the steps for the chosen device", async () => {
    render(
      <MemoryRouter>
        <InstallGuidePage />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole("tab", { name: "iPhone, iPad" }));
    expect(within(screen.getByRole("list", { name: /iPhone/ })).getAllByRole("listitem")).toHaveLength(6);

    await userEvent.click(screen.getByRole("tab", { name: "Android" }));
    expect(within(screen.getByRole("list", { name: /Android/ })).getAllByRole("listitem")).toHaveLength(4);

    await userEvent.click(screen.getByRole("tab", { name: "Microsoft Edge" }));
    const steps = within(screen.getByRole("list", { name: /Microsoft Edge/ })).getAllByRole("listitem");
    expect(steps).toHaveLength(4);
    expect(steps[1]).toHaveTextContent("Install");
    expect(screen.getByRole("link", { name: "Bách Việt Cầm" })).toHaveAttribute("href", "/");
  });

  it("goes back to the page the visitor came from", async () => {
    render(
      <MemoryRouter initialEntries={["/", "/install"]} initialIndex={1}>
        <Routes>
          <Route path="/" element={<p>Trang giới thiệu</p>} />
          <Route path="/install" element={<InstallGuidePage />} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole("button", { name: "Quay lại" }));
    expect(screen.getByText("Trang giới thiệu")).toBeInTheDocument();
  });
});

describe("detectInstallPlatform", () => {
  it("opens the guide matching the visitor's device", () => {
    expect(detectInstallPlatform("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)", 5)).toBe("ios");
    expect(detectInstallPlatform("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15", 5)).toBe("ios");
    expect(detectInstallPlatform("Mozilla/5.0 (Windows NT 10.0) Chrome/130.0 Safari/537.36 Edg/130.0", 0)).toBe("edge");
    expect(detectInstallPlatform("Mozilla/5.0 (Windows NT 10.0) Chrome/130.0 Safari/537.36", 0)).toBe("chrome");
    expect(
      detectInstallPlatform("Mozilla/5.0 (Linux; Android 14; SM-S918B) Chrome/130.0 Mobile Safari/537.36", 5)
    ).toBe("android");
  });
});
