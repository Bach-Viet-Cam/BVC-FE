import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ProfilePage } from "@/features/home/pages/ProfilePage";

const logout = vi.fn(() => Promise.resolve());
vi.mock("@/shared/context/AuthContext", () => ({ useAuth: () => ({ logout }) }));

describe("ProfilePage", () => {
  it("signs the student out when Đăng xuất is pressed", async () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole("button", { name: "Đăng xuất" }));

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
