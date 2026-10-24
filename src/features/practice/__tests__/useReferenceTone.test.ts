import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { REFERENCE_TONE } from "@/features/practice/constants/practiceConstants";
import { useReferenceTone } from "@/features/practice/hooks/useReferenceTone";

function fakeContext() {
  const oscillators: {
    type: string;
    frequency: { value: number };
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    onended: (() => void) | null;
  }[] = [];
  const param = () => ({
    value: 0,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
    setTargetAtTime: vi.fn(),
  });
  const ctx = {
    currentTime: 10,
    state: "running",
    destination: {},
    resume: vi.fn(),
    createGain: () => ({ gain: param(), connect: vi.fn() }),
    createOscillator: () => {
      const oscillator = {
        type: "sine",
        frequency: { value: 0 },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        onended: null,
      };
      oscillators.push(oscillator);
      return oscillator;
    },
  };
  return { ctx: ctx as unknown as AudioContext, oscillators };
}

describe("useReferenceTone", () => {
  it("phát cao độ chuẩn của dây trong 5 giây rồi dừng", () => {
    const { ctx, oscillators } = fakeContext();
    const { result } = renderHook(() => useReferenceTone(ctx));

    act(() => result.current.play(440, "Dây ngoài"));

    expect(result.current.playingKey).toBe("Dây ngoài");
    expect(result.current.remainingSec).toBe(REFERENCE_TONE.seconds);
    expect(oscillators.map((oscillator) => oscillator.frequency.value)).toEqual([440, 880]);
    const [start] = oscillators[0].start.mock.calls[0] as [number];
    const [end] = oscillators[0].stop.mock.calls[0] as [number];
    expect(end - start).toBeCloseTo(REFERENCE_TONE.seconds);

    act(() => oscillators[0].onended?.());
    expect(result.current.playingKey).toBeNull();
  });

  it("bấm dừng thì tắt ngay; phát dây khác thì dây cũ bị tắt", () => {
    const { ctx, oscillators } = fakeContext();
    const { result } = renderHook(() => useReferenceTone(ctx));

    act(() => result.current.play(293.66, "Dây trong"));
    act(() => result.current.play(440, "Dây ngoài"));
    expect(oscillators[0].stop).toHaveBeenCalledTimes(2); // hẹn dừng sau 5s, rồi dừng sớm khi đổi dây
    expect(result.current.playingKey).toBe("Dây ngoài");

    act(() => result.current.stop());
    expect(result.current.playingKey).toBeNull();
    expect(result.current.remainingSec).toBe(0);
  });
});
