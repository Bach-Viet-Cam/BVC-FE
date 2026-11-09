import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useReferencePlayer } from "@/features/music-library/hooks/useReferencePlayer";
import { toast } from "@/shared/components/ui/toast";

vi.mock("@/shared/components/ui/toast", () => ({ toast: { error: vi.fn() } }));
vi.mock("@/features/music-library/hooks/useAudioSource", () => ({
  useAudioSource: (url?: string) => ({ playableUrl: url, peaks: null, isLoading: false }),
}));

const recording = { name: "r.mp3", url: "http://localhost:8000/uploads/audio/2026-11/missing.mp3", durationSec: 35 };

describe("useReferencePlayer", () => {
  beforeEach(() => vi.mocked(toast.error).mockClear());
  afterEach(() => vi.restoreAllMocks());

  it("shows an error toast when the recording cannot be played", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockRejectedValue(
      new DOMException("Failed to load because no supported source was found.", "NotSupportedError")
    );
    const { result } = renderHook(() => useReferencePlayer(recording));

    act(() => result.current.toggle());

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Không phát được bản thu",
        "File bản thu không đọc được hoặc không còn tồn tại."
      )
    );
    expect(result.current.isPlaying).toBe(false);
  });

  it("stays quiet when playback is interrupted by a pause", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockRejectedValue(new DOMException("interrupted", "AbortError"));
    const { result } = renderHook(() => useReferencePlayer(recording));

    act(() => result.current.toggle());

    await waitFor(() => expect(result.current.isPlaying).toBe(false));
    expect(toast.error).not.toHaveBeenCalled();
  });
});
