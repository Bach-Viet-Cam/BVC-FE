import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CoverArt } from "@/features/music-library/components/CoverArt";

describe("CoverArt", () => {
  it("falls back to the default music icon when the cover image fails to load", () => {
    const { container } = render(
      <CoverArt title="Con Bướm Xuân" tone="accent" url="http://localhost:8000/missing.jpg" />
    );
    const image = container.querySelector("img");
    expect(image).toBeInTheDocument();

    fireEvent.error(image!);

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Ảnh bìa Con Bướm Xuân" }).querySelector("svg")).toBeInTheDocument();
  });
});
