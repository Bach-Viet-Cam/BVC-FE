import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ManagedSongRow } from "@/features/music-library/components/ManagedSongRow";
import type { LecturerPiece } from "@/features/music-library/types/lecturerTypes";

function song(overrides: Partial<LecturerPiece> = {}): LecturerPiece {
  return {
    id: "p1",
    title: "Lý ngựa ô",
    composer: "Dân gian",
    description: null,
    coverUrl: null,
    cover: null,
    genre: { id: "g1", name: "Dân ca Nam Bộ" },
    instruments: [{ id: "i1", name: "Đàn tranh" }],
    visibility: "PUBLIC",
    moderation: "NORMAL",
    effectiveVisibility: "PUBLIC",
    moderationReason: null,
    canChangeVisibility: true,
    canEdit: true,
    canManageSheets: true,
    sheetMusicCount: 3,
    mySheetMusicCount: 3,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-10T00:00:00.000Z",
    ...overrides,
  };
}

function renderRow(piece: LecturerPiece) {
  render(
    <MemoryRouter>
      <ul>
        <ManagedSongRow song={piece} isUpdating={false} onRequestVisibility={vi.fn()} />
      </ul>
    </MemoryRouter>
  );
}

describe("ManagedSongRow", () => {
  it("lets the owner edit the song", () => {
    renderRow(song());
    expect(screen.getByRole("link", { name: "Sửa" })).toHaveAttribute("href", "/songs/p1/edit");
    expect(screen.getByRole("link", { name: "Lý ngựa ô" })).toHaveAttribute("href", "/songs/p1/edit");
    expect(screen.queryByText("Đóng góp")).not.toBeInTheDocument();
  });

  it("shows a contributed song without edit actions", () => {
    renderRow(song({ canEdit: false, canChangeVisibility: false, mySheetMusicCount: 1 }));
    expect(screen.getByText("Đóng góp")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Sửa" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lý ngựa ô" })).toHaveAttribute("href", "/songs/p1/sheets");
    expect(screen.getByRole("link", { name: "Bản nhạc" })).toHaveAttribute("href", "/songs/p1/sheets");
    expect(screen.getByText("1/3")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toHaveAttribute("aria-disabled", "true");
  });

  it("locks a contributed song hidden by its owner and explains why on hover", async () => {
    renderRow(
      song({
        canEdit: false,
        canChangeVisibility: false,
        canManageSheets: false,
        visibility: "HIDDEN",
        effectiveVisibility: "HIDDEN",
      })
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Bản nhạc")).toHaveAttribute("aria-disabled");
    await userEvent.hover(screen.getByRole("listitem"));
    expect(await screen.findByText("Chủ bài đang ẩn bài này nên bạn không thao tác được.")).toBeInTheDocument();
  });

  it("names the admin when an admin hid the contributed song", async () => {
    renderRow(
      song({
        canEdit: false,
        canChangeVisibility: false,
        canManageSheets: false,
        moderation: "ADMIN_HIDDEN",
        effectiveVisibility: "ADMIN_HIDDEN",
      })
    );
    await userEvent.hover(screen.getByRole("listitem"));
    expect(await screen.findByText("Admin đang ẩn bài này nên bạn không thao tác được.")).toBeInTheDocument();
  });
});
