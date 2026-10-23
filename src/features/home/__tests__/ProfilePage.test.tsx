import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ProfilePage } from "@/features/home/pages/ProfilePage";

const logout = vi.fn(() => Promise.resolve());
const user = { userId: "u1", username: "Trần Tuấn Anh", email: "tuananh@example.com", role: 1 };
vi.mock("@/shared/context/AuthContext", () => ({ useAuth: () => ({ user, logout }) }));

describe("ProfilePage", () => {
  it("shows the signed-in account from the session", () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Hồ sơ", level: 1 })).toBeInTheDocument();
    expect(screen.getAllByText("Trần Tuấn Anh").length).toBeGreaterThan(0);
    expect(screen.getByText("tuananh@example.com")).toBeInTheDocument();
    expect(screen.getByText("Học viên")).toBeInTheDocument();
  });

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
