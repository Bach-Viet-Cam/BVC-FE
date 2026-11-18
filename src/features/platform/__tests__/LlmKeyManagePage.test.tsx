import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { llmKeyApi } from "@/features/platform/api/llmKeyApi";
import { LlmKeyManagePage } from "@/features/platform/pages/LlmKeyManagePage";
import { type LlmKeyItem } from "@/features/platform/types/llmKeyTypes";
import { validateLlmKey } from "@/features/platform/utils/validateLlmKey";

vi.mock("@/features/platform/api/llmKeyApi", () => ({
  llmKeyApi: { list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));
vi.mock("@/shared/components/ui/toast", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const SECRET = "sk-test-SECRET-1234567890";

const item = (overrides: Partial<LlmKeyItem>): LlmKeyItem => ({
  id: "k1",
  name: "Key chính",
  provider: "gemini",
  status: "active",
  cooldownUntil: null,
  lastUsedAt: null,
  lastErrorCode: null,
  successCount: 5,
  failCount: 2,
  createdAt: "2026-11-01T00:00:00.000Z",
  ...overrides,
});

function renderPage() {
  render(
    <MemoryRouter>
      <LlmKeyManagePage />
    </MemoryRouter>
  );
}

describe("validateLlmKey", () => {
  it("requires name and key when creating", () => {
    expect(validateLlmKey({ name: "", key: "" }, "create")).toEqual({
      name: expect.any(String),
      key: expect.any(String),
    });
    expect(validateLlmKey({ name: "A", key: SECRET }, "create")).toEqual({});
  });

  it("lets the key stay blank when editing but still checks the name", () => {
    expect(validateLlmKey({ name: "A", key: "" }, "edit")).toEqual({});
    expect(validateLlmKey({ name: " ", key: "" }, "edit")).toEqual({ name: expect.any(String) });
  });
});

describe("LlmKeyManagePage", () => {
  beforeEach(() => {
    vi.mocked(llmKeyApi.list)
      .mockReset()
      .mockResolvedValue([
        item({}),
        item({ id: "k2", name: "Key phụ", status: "disabled" }),
        item({ id: "k3", name: "Key hỏng", status: "invalid", lastErrorCode: "401" }),
        item({ id: "k4", name: "Key nghỉ", cooldownUntil: "2999-01-01T00:00:00.000Z" }),
      ]);
    vi.mocked(llmKeyApi.create)
      .mockReset()
      .mockResolvedValue(item({ id: "k9" }));
    vi.mocked(llmKeyApi.update).mockReset().mockResolvedValue(item({}));
    vi.mocked(llmKeyApi.remove).mockReset().mockResolvedValue(undefined);
  });

  it("lists names and Vietnamese statuses without any key field", async () => {
    renderPage();
    const row = (await screen.findByText("Key chính")).closest("tr")!;
    expect(within(row).getByText("Đang dùng")).toBeInTheDocument();
    expect(screen.getByText("Đã tắt")).toBeInTheDocument();
    expect(screen.getByText("Key không hợp lệ")).toBeInTheDocument();
    expect(screen.getByText("Đang nghỉ")).toBeInTheDocument();
    expect(document.querySelector("input")).toBeNull();
  });

  it("creates a key with name and key then reloads", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Key chính");
    await user.click(screen.getByRole("button", { name: /Thêm API key/ }));
    const keyInput = screen.getByLabelText(/Khóa API/);
    expect(keyInput).toHaveAttribute("type", "password");
    expect(keyInput).toHaveAttribute("autocomplete", "off");
    await user.type(screen.getByLabelText(/Tên/), "Key mới");
    await user.selectOptions(screen.getByLabelText(/Nhà cung cấp/), "openrouter");
    await user.type(keyInput, SECRET);
    await user.click(screen.getByRole("button", { name: "Lưu API key" }));
    await waitFor(() =>
      expect(llmKeyApi.create).toHaveBeenCalledWith({ name: "Key mới", key: SECRET, provider: "openrouter" })
    );
    await waitFor(() => expect(llmKeyApi.list).toHaveBeenCalledTimes(2));
    expect(screen.queryByText(SECRET)).not.toBeInTheDocument();
  });

  it("shows the provider in the list and locks it when editing", async () => {
    const user = userEvent.setup();
    vi.mocked(llmKeyApi.list).mockResolvedValue([item({ provider: "openrouter" })]);
    renderPage();
    const row = (await screen.findByText("Key chính")).closest("tr")!;
    expect(within(row).getByText("OpenRouter")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Sửa Key chính" }));
    const provider = screen.getByLabelText(/Nhà cung cấp/);
    expect(provider).toBeDisabled();
    expect(provider).toHaveValue("openrouter");
  });

  it("opens edit with an empty password field and omits key from PATCH when blank", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Key chính");
    await user.click(screen.getByRole("button", { name: "Sửa Key chính" }));
    const keyInput = screen.getByLabelText(/Khóa API/);
    expect(keyInput).toHaveAttribute("type", "password");
    expect(keyInput).toHaveValue("");
    const nameInput = screen.getByLabelText(/Tên/);
    await user.clear(nameInput);
    await user.type(nameInput, "Key đổi tên");
    await user.click(screen.getByRole("button", { name: "Lưu API key" }));
    await waitFor(() => expect(llmKeyApi.update).toHaveBeenCalledTimes(1));
    const [id, body] = vi.mocked(llmKeyApi.update).mock.calls[0];
    expect(id).toBe("k1");
    expect(body).toEqual({ name: "Key đổi tên" });
    expect(body).not.toHaveProperty("key");
    expect(body).not.toHaveProperty("status");
  });

  it("sends status only when the switch was toggled", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Key chính");
    await user.click(screen.getByRole("button", { name: "Sửa Key chính" }));
    await user.click(screen.getByRole("switch"));
    await user.click(screen.getByRole("button", { name: "Lưu API key" }));
    await waitFor(() => expect(llmKeyApi.update).toHaveBeenCalledTimes(1));
    expect(vi.mocked(llmKeyApi.update).mock.calls[0][1]).toEqual({ name: "Key chính", status: "disabled" });
  });

  it("sends the new key when replacing it, and the dialog reopens empty", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Key chính");
    await user.click(screen.getByRole("button", { name: "Sửa Key chính" }));
    await user.type(screen.getByLabelText(/Khóa API/), SECRET);
    await user.click(screen.getByRole("button", { name: "Lưu API key" }));
    await waitFor(() => expect(llmKeyApi.update).toHaveBeenCalled());
    expect(vi.mocked(llmKeyApi.update).mock.calls[0][1]).toMatchObject({ key: SECRET });
    await waitFor(() => expect(screen.queryByLabelText(/Khóa API/)).not.toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Sửa Key chính" }));
    expect(screen.getByLabelText(/Khóa API/)).toHaveValue("");
  });

  it("asks for confirmation before deleting", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Key chính");
    await user.click(screen.getByRole("button", { name: "Xóa Key chính" }));
    expect(llmKeyApi.remove).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Xác nhận xóa" }));
    await waitFor(() => expect(llmKeyApi.remove).toHaveBeenCalledWith("k1"));
  });

  it("shows the duplicate message from a 409 and keeps the key field cleared", async () => {
    const user = userEvent.setup();
    const conflict = Object.assign(new Error("conflict"), {
      isAxiosError: true,
      response: { status: 409, data: { message: "Tên API key đã tồn tại." } },
    });
    vi.mocked(llmKeyApi.create).mockRejectedValueOnce(conflict);
    renderPage();
    await screen.findByText("Key chính");
    await user.click(screen.getByRole("button", { name: /Thêm API key/ }));
    await user.type(screen.getByLabelText(/Tên/), "Key chính");
    await user.type(screen.getByLabelText(/Khóa API/), SECRET);
    await user.click(screen.getByRole("button", { name: "Lưu API key" }));
    expect(await screen.findByText("Tên API key đã tồn tại.")).toBeInTheDocument();
    expect(screen.getByLabelText(/Khóa API/)).toHaveValue("");
  });
});
