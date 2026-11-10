import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { InstallAppButton } from "@/features/landing/components/InstallAppButton";
import { listenForPwaInstall } from "@/shared/utils/pwaInstall";

beforeAll(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: false }))
  );
  listenForPwaInstall();
});

function renderButton() {
  render(
    <MemoryRouter>
      <InstallAppButton />
    </MemoryRouter>
  );
}

describe("InstallAppButton", () => {
  it("links to the install guide when the browser cannot install by itself", () => {
    renderButton();
    expect(screen.getByRole("link", { name: "Thêm vào màn hình chính" })).toHaveAttribute("href", "/install");
  });

  it("opens the browser install dialog, then hides once the app is installed", async () => {
    renderButton();
    const prompt = vi.fn().mockResolvedValue(undefined);
    const event = Object.assign(new Event("beforeinstallprompt"), {
      prompt,
      userChoice: Promise.resolve({ outcome: "accepted" }),
    });
    act(() => {
      window.dispatchEvent(event);
    });

    await userEvent.click(screen.getByRole("button", { name: "Thêm vào màn hình chính" }));
    expect(prompt).toHaveBeenCalledOnce();

    act(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });
    expect(screen.queryByText("Thêm vào màn hình chính")).not.toBeInTheDocument();
  });
});
