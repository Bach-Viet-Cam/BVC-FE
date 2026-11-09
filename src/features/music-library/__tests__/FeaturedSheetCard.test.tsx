import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { FeaturedSheetCard } from "@/features/music-library/components/FeaturedSheetCard";
import type { SheetVersion } from "@/features/music-library/types/musicLibraryTypes";

vi.mock("@/features/music-library/components/ReferenceTile", () => ({
  ReferenceTile: ({ title }: { title: string }) => <p>{title}</p>,
}));

const sheet = (id: string, isMain = false) =>
  ({ id, name: `Bản ${id}`, isMain, level: { id: "l", name: "Cơ bản" } }) as SheetVersion;

function renderCard(secondaryCount: number) {
  const secondary = Array.from({ length: secondaryCount }, (_, index) => sheet(`phu-${index + 1}`));
  render(
    <MemoryRouter>
      <FeaturedSheetCard
        instrument={{ id: "tranh", name: "Đàn tranh" }}
        sheet={sheet("chinh", true)}
        secondary={secondary}
        hrefOf={(item) => `/library/p1/sheets/${item.id}`}
        practiceOf={() => null}
      />
    </MemoryRouter>
  );
}

describe("FeaturedSheetCard", () => {
  it("expands up to five secondary sheets inside the card and collapses them again", async () => {
    renderCard(2);
    expect(screen.queryByText("Bản phu-1")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Xem thêm 2 bản phụ/ }));
    expect(screen.getByText("Bản phu-1")).toBeInTheDocument();
    expect(screen.getByText("Bản phu-2")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Thu gọn/ }));
    expect(screen.queryByText("Bản phu-1")).not.toBeInTheDocument();
  });

  it("opens a modal list when there are more than five secondary sheets", async () => {
    renderCard(6);

    await userEvent.click(screen.getByRole("button", { name: /Xem thêm 6 bản phụ/ }));
    const dialog = within(await screen.findByRole("dialog", { name: "Bản phụ · Đàn tranh" }));
    expect(dialog.getByText("Bản phu-1")).toBeInTheDocument();
    expect(dialog.getByText("Bản phu-6")).toBeInTheDocument();
  });

  it("hides the toggle when the instrument has no secondary sheets", () => {
    renderCard(0);
    expect(screen.queryByRole("button", { name: /bản phụ/ })).not.toBeInTheDocument();
  });
});
