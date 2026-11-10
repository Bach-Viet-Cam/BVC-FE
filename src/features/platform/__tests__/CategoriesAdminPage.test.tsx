import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { catalogCategoryApi } from "@/features/platform/api/catalogCategoryApi";
import { CategoriesAdminPage } from "@/features/platform/pages/CategoriesAdminPage";
import { type CatalogCategoryItem } from "@/features/platform/types/catalogCategoryTypes";

vi.mock("@/features/platform/api/catalogCategoryApi", () => ({
  catalogCategoryApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    activate: vi.fn(),
    deactivate: vi.fn(),
    remove: vi.fn(),
  },
}));
vi.mock("@/shared/components/ui/toast", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const category = (overrides: Partial<CatalogCategoryItem>): CatalogCategoryItem => ({
  id: "c1",
  type: "GENRE",
  name: "Dân ca",
  description: null,
  displayOrder: 1,
  status: "ACTIVE",
  usageCount: 0,
  updatedAt: "2026-11-11T00:00:00.000Z",
  ...overrides,
});

const listResponse = (items: CatalogCategoryItem[]) =>
  ({ data: { data: { items, pagination: { page: 1, limit: 50, total: items.length } } } }) as never;

function renderPage() {
  render(
    <MemoryRouter>
      <CategoriesAdminPage />
    </MemoryRouter>
  );
}

describe("CategoriesAdminPage", () => {
  beforeEach(() => {
    vi.mocked(catalogCategoryApi.list).mockReset();
    vi.mocked(catalogCategoryApi.list).mockImplementation((params) =>
      Promise.resolve(
        params.type === "GENRE"
          ? listResponse([
              category({ id: "g1", name: "Dân ca", usageCount: 3 }),
              category({ id: "g2", name: "Nhạc lễ", usageCount: 0, status: "INACTIVE" }),
            ])
          : listResponse([category({ id: "l1", type: "LEVEL", name: "Cơ bản", usageCount: 2 })])
      )
    );
  });

  it("lists genres first and only allows deleting categories nothing uses", async () => {
    renderPage();

    const inUseRow = (await screen.findByText("Dân ca")).closest("tr")!;
    expect(within(inUseRow).getByText("3 bài hát")).toBeInTheDocument();
    expect(within(inUseRow).getByRole("button", { name: "Xóa Dân ca" })).toBeDisabled();

    const unusedRow = screen.getByText("Nhạc lễ").closest("tr")!;
    expect(within(unusedRow).getByText("Ngừng hoạt động")).toBeInTheDocument();
    expect(within(unusedRow).getByRole("button", { name: "Xóa Nhạc lễ" })).toBeEnabled();
    expect(catalogCategoryApi.list).toHaveBeenCalledWith(expect.objectContaining({ type: "GENRE", page: 1 }));
  });

  it("switches to levels and creates a new level", async () => {
    vi.mocked(catalogCategoryApi.create).mockResolvedValue({ data: { message: "Thêm danh mục thành công." } } as never);
    renderPage();
    await screen.findByText("Dân ca");

    await userEvent.click(screen.getByRole("tab", { name: "Trình độ" }));
    expect(await screen.findByText("2 bản nhạc")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Thêm trình độ" }));
    await userEvent.type(screen.getByLabelText(/Tên danh mục/), "Nâng cao");
    await userEvent.click(screen.getByRole("button", { name: "Lưu danh mục" }));

    await waitFor(() =>
      expect(catalogCategoryApi.create).toHaveBeenCalledWith({
        type: "LEVEL",
        name: "Nâng cao",
        description: null,
        displayOrder: 0,
      })
    );
  });

  it("deactivates an active category", async () => {
    vi.mocked(catalogCategoryApi.deactivate).mockResolvedValue({
      data: { message: "Đã ngừng hoạt động danh mục." },
    } as never);
    renderPage();

    await userEvent.click(await screen.findByRole("button", { name: "Ngừng hoạt động Dân ca" }));
    expect(catalogCategoryApi.deactivate).toHaveBeenCalledWith("g1");
  });
});
