import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { TunerView } from "./TunerView";
import type { PracticeAudio } from "@/features/practice/hooks/usePracticeAudio";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { EnsemblePreparation } from "@/features/ensemble/components/EnsemblePreparation";
import type { ComponentProps } from "react";

vi.mock("@/shared/hooks/use-mobile", () => ({ useIsMobile: () => false }));
vi.mock("@/features/practice/hooks/useInstrumentTunes", () => ({
  useInstrumentTunes: () => ({ strings: [], instrumentName: "Đàn tranh", error: null, isLoading: false }),
}));
vi.mock("@/features/practice/hooks/useLiveTuner", () => ({
  useLiveTuner: () => ({ live: false, cents: 0, detectedNote: null, detectedHz: null }),
}));

vi.mock("@/features/practice/hooks/useTuner", () => ({
  useTuner: () => ({
    selected: 0,
    tuned: [],
    live: false,
    cents: 0,
    hz: null,
    note: null,
    tunedCount: 0,
    currentString: null,
    pickString: vi.fn(),
  }),
}));
vi.mock("@/features/practice/hooks/useReferenceTone", () => ({
  useReferenceTone: () => ({ playingKey: null, stop: vi.fn(), play: vi.fn() }),
}));

it("opens the tuner outside solo practice context (ensemble drawer)", () => {
  const audio = { micState: "granted", ctx: {} } as unknown as PracticeAudio;
  expect(() =>
    render(
      <TunerView audio={audio} tunes={{ strings: [], instrumentName: "Đàn tranh", error: null, isLoading: false }} />
    )
  ).not.toThrow();
  expect(screen.getByText("Các dây cần kiểm tra")).toBeInTheDocument();
});

it("clicking the ensemble tuner opens the real shared tuner drawer", async () => {
  type Props = ComponentProps<typeof EnsemblePreparation>;
  render(
    <MemoryRouter>
      <EnsemblePreparation
        sheetId="sheet"
        targetBpm={90}
        disabled={false}
        onOpen={vi.fn()}
        audio={{ micState: "granted", ctx: {}, ready: false } as Props["audio"]}
        pitchStream={{ subscribe: vi.fn() } as unknown as Props["pitchStream"]}
        tempo={{ liveBpm: null, bpmHint: "", hintTone: "idle", litBeat: -1 } as Props["tempo"]}
        clickOn={false}
        onToggleClick={vi.fn()}
      />
    </MemoryRouter>
  );
  await userEvent.click(screen.getByRole("button", { name: "Mở tuner lên dây" }));
  expect(screen.getByRole("dialog", { name: "Lên dây" })).toHaveTextContent("Các dây cần kiểm tra");
});
