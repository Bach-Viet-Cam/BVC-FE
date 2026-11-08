import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { usePartsPreview } from "./usePartsPreview";

afterEach(() => vi.useRealTimers());

it("seeks while playing, resumes at the paused position and stops at the end", () => {
  vi.useFakeTimers();
  const play = vi.fn();
  const pause = vi.fn();
  const { result } = renderHook(() => usePartsPreview(30, play, pause));
  act(() => result.current.seek(8));
  act(() => result.current.toggle());
  expect(play).toHaveBeenLastCalledWith(8, 1);
  act(() => vi.advanceTimersByTime(2000));
  expect(result.current.position).toBeCloseTo(10);
  act(() => result.current.seek(20));
  expect(play).toHaveBeenLastCalledWith(20, 1);
  act(() => result.current.toggle());
  expect(pause).toHaveBeenCalled();
  act(() => result.current.toggle());
  expect(play).toHaveBeenLastCalledWith(20, 1);
  act(() => vi.advanceTimersByTime(10000));
  expect(result.current.playing).toBe(false);
  expect(result.current.position).toBe(30);
  act(() => result.current.toggle());
  expect(play).toHaveBeenLastCalledWith(0, 1);
});
