import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { musicLibraryApi } from "@/features/music-library/api/musicLibraryApi";
import { useSheetRecording } from "@/features/music-library/hooks/useSheetRecording";
import type { SheetVersion } from "@/features/music-library/types/musicLibraryTypes";

vi.mock("@/features/music-library/api/musicLibraryApi", () => ({ musicLibraryApi: { getSheetViewer: vi.fn() } }));

const sheet = (id: string, recording?: SheetVersion["referenceRecording"]) =>
  ({ id, songId: "p1", referenceRecording: recording }) as SheetVersion;

describe("useSheetRecording", () => {
  beforeEach(() => vi.mocked(musicLibraryApi.getSheetViewer).mockReset());

  it("loads the playable url of a secondary sheet that only has the recording flag", async () => {
    vi.mocked(musicLibraryApi.getSheetViewer).mockResolvedValue({
      sheet: { referenceRecording: { name: "r", url: "http://localhost:8000/uploads/audio/a.mp3", durationSec: 30 } },
    } as never);

    const { result } = renderHook(() => useSheetRecording(sheet("phu-1", { name: "phu-1-audio", durationSec: 30 })));

    await waitFor(() => expect(result.current?.url).toBe("http://localhost:8000/uploads/audio/a.mp3"));
    expect(musicLibraryApi.getSheetViewer).toHaveBeenCalledWith("p1", "phu-1");
  });

  it("does not call the API when the sheet already has a url or no recording", () => {
    renderHook(() => useSheetRecording(sheet("chinh", { name: "c", url: "http://x/a.mp3" })));
    renderHook(() => useSheetRecording(sheet("trong")));
    expect(musicLibraryApi.getSheetViewer).not.toHaveBeenCalled();
  });
});
