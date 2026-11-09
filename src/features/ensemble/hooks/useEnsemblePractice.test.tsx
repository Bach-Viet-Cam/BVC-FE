import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useEnsemblePractice } from "./useEnsemblePractice";

const fixture = vi.hoisted(() => ({
  data: {
    pieceId: "piece",
    pieceTitle: "Bài thử",
    targetBpm: 90,
    myInstrumentId: "tranh",
    myInstrumentName: "Đàn tranh",
    mySheetMusicId: "sheet",
    isAssignmentCounted: false,
    tracks: [
      {
        id: "own",
        instrumentId: "tranh",
        instrumentName: "Đàn tranh",
        fileUrl: "/own.wav",
        durationSec: 10,
        offsetMs: 0,
        defaultVolume: 100,
      },
      {
        id: "other",
        instrumentId: "nhi",
        instrumentName: "Đàn nhị",
        fileUrl: "/other.wav",
        durationSec: 10,
        offsetMs: 1000,
        defaultVolume: 100,
      },
    ],
  },
  upload: vi.fn(),
  submit: vi.fn(),
}));
vi.mock("@/shared/hooks/useAsyncData", () => ({
  useAsyncData: () => ({ data: fixture.data, isLoading: false, error: null }),
}));
vi.mock("@/features/ensemble/api/ensembleApi", () => ({
  ensembleApi: { uploadRecording: fixture.upload, createSubmission: fixture.submit },
}));
vi.mock("@/features/ensemble/utils/wavEncoder", () => ({
  encodeWav: async () => new Blob(["wav"], { type: "audio/wav" }),
}));

const gains: { gain: { value: number } }[] = [];
const audioPlayers: FakeAudio[] = [];
class FakeAudio {
  currentTime = 0;
  playbackRate = 1;
  play = vi.fn(async () => {});
  pause = vi.fn();
  constructor() {
    audioPlayers.push(this);
  }
}
class FakeContext {
  destination = {};
  resume = async () => {};
  close = async () => {};
  createMediaElementSource = () => ({ connect: vi.fn() });
  createMediaStreamSource = () => ({ connect: vi.fn(), disconnect: vi.fn() });
  createGain = () => {
    const gain = { gain: { value: 1 }, connect: vi.fn() };
    gains.push(gain);
    return gain;
  };
  createAnalyser = () => ({ connect: vi.fn(), fftSize: 0 });
  decodeAudioData = async () => ({ duration: 8, getChannelData: () => new Float32Array([0, 0.5, 0]) });
}
class FakeRecorder {
  state = "inactive";
  mimeType = "audio/wav";
  onstop: (() => void) | null = null;
  start() {
    this.state = "recording";
  }
  stop() {
    this.state = "inactive";
    this.onstop?.();
  }
}
beforeEach(() => {
  gains.length = 0;
  audioPlayers.length = 0;
  vi.useFakeTimers();
  vi.stubGlobal("Audio", FakeAudio);
  vi.stubGlobal("AudioContext", FakeContext);
  vi.stubGlobal("OfflineAudioContext", FakeContext);
  vi.stubGlobal("MediaRecorder", FakeRecorder);
  vi.stubGlobal("navigator", {
    mediaDevices: {
      getUserMedia: async () => ({
        getTracks: () => [{ stop: vi.fn() }],
        getAudioTracks: () => [{ getSettings: () => ({}) }],
      }),
    },
  });
  Object.assign(URL, { createObjectURL: vi.fn(() => "blob:qa"), revokeObjectURL: vi.fn() });
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("keeps the own part audible for preview, mutes it only while recording and cancels delayed parts on stop", async () => {
  const { result, unmount } = renderHook(() => useEnsemblePractice("piece", undefined));
  expect(result.current.durationSec).toBe(11);
  act(() => result.current.playTracksFrom(0, 1));
  expect(gains[0].gain.value).toBe(1);
  act(() => result.current.pauseTracks());
  act(() => result.current.setIsCountInOn(false));
  await act(() => result.current.start("headphones"));
  expect(result.current.status).toBe("recording");
  expect(gains[0].gain.value).toBe(0);
  expect(gains[1].gain.value).toBe(1);
  await act(() => result.current.stop());
  expect(result.current.status).toBe("preview");
  expect(gains[0].gain.value).toBe(1);
  act(() => vi.advanceTimersByTime(1500));
  expect(audioPlayers[1].play).not.toHaveBeenCalled();
  unmount();
});

it("turns a selected audio file into a preview before any upload", async () => {
  const { result, unmount } = renderHook(() => useEnsemblePractice("piece", undefined));
  await act(() => result.current.selectFile(new File(["audio"], "ban-thu.mp3", { type: "audio/mpeg" })));
  expect(result.current.status).toBe("preview");
  expect(result.current.take?.blob.type).toBe("audio/wav");
  expect(result.current.take?.durationSec).toBe(8);
  expect(fixture.upload).not.toHaveBeenCalled();
  unmount();
});
