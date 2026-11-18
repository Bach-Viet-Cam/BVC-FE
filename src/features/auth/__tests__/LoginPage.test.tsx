import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ROLES } from "@/shared/constants/roles";
import { LoginPage } from "@/features/auth/pages/LoginPage";

vi.mock("@react-oauth/google", () => ({ GoogleLogin: () => null }));
vi.mock("@/shared/context/AuthContext", () => ({
  useAuth: () => ({ user: { userId: "u1", role: ROLES.STUDENT }, isLoading: false }),
}));
vi.mock("@/features/auth/hooks/useLogin", () => ({
  useLogin: () => ({
    login: vi.fn(),
    isLoading: false,
    error: null,
    setError: vi.fn(),
    isCreateAccountOpen: false,
    confirmCreateAccount: vi.fn(),
    cancelCreateAccount: vi.fn(),
  }),
}));

function renderLogin(from: string) {
  render(
    <MemoryRouter initialEntries={[{ pathname: "/login", state: { from } }]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/library/:songId" element={<p>Trang cũ</p>} />
        <Route path="/home" element={<p>Trang chủ</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("LoginPage khi đã đăng nhập", () => {
  it("quay lại trang khách đang xem thay vì trang chủ", () => {
    renderLogin("/library/s1?tab=2");
    expect(screen.getByText("Trang cũ")).toBeInTheDocument();
  });

  it("bỏ đường dẫn lạ và về trang chủ", () => {
    renderLogin("//evil.com");
    expect(screen.getByText("Trang chủ")).toBeInTheDocument();
  });
});
