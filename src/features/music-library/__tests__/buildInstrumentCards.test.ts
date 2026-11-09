import { describe, expect, it } from "vitest";
import type { SheetVersion } from "@/features/music-library/types/musicLibraryTypes";
import { buildInstrumentCards } from "@/features/music-library/utils/sheetUtils";

const sheet = (id: string, instrumentId: string, isMain: boolean, createdAt: string) =>
  ({
    id,
    isMain,
    createdAt,
    instrument: { id: instrumentId, name: instrumentId },
    level: { id: "l", name: "l" },
  }) as SheetVersion;

const sheets = [
  sheet("tranh-main", "tranh", true, "2026-01-01"),
  sheet("tranh-easy", "tranh", false, "2026-01-02"),
  sheet("bau-old", "bau", false, "2026-01-01"),
  sheet("bau-new", "bau", false, "2026-03-01"),
  sheet("bau-mid", "bau", false, "2026-02-01"),
  sheet("sao-main", "sao", true, "2026-01-01"),
];

describe("buildInstrumentCards", () => {
  it("makes one card per instrument with its main sheet, or the newest sheet when there is no main", () => {
    const cards = buildInstrumentCards(sheets, {});
    expect(cards.map((card) => [card.instrument.id, card.featured.id, card.secondary.map((item) => item.id)])).toEqual([
      ["tranh", "tranh-main", ["tranh-easy"]],
      ["bau", "bau-new", ["bau-old", "bau-mid"]],
      ["sao", "sao-main", []],
    ]);
  });

  it("puts the class instrument first", () => {
    const cards = buildInstrumentCards(sheets, { classInstrumentId: "sao" });
    expect(cards[0].instrument.id).toBe("sao");
  });

  it("puts the assignment's instrument first and features the assigned sheet", () => {
    const cards = buildInstrumentCards(sheets, { classInstrumentId: "sao", assignedSheetId: "tranh-easy" });
    expect(cards[0].instrument.id).toBe("tranh");
    expect(cards[0].featured.id).toBe("tranh-easy");
    expect(cards[0].isFeaturedAssigned).toBe(true);
    expect(cards[0].secondary.map((item) => item.id)).toEqual(["tranh-main"]);
  });
});
