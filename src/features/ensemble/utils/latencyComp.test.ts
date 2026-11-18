import { describe, expect, it } from "vitest";
import { clampLatencyMs, estimateLatencyMs, MAX_LATENCY_MS } from "./latencyComp";

describe("latencyComp", () => {
  it("adds output and input latency and subtracts the late recorder start", () => {
    expect(estimateLatencyMs(0.05, 0.02, 10)).toBe(60);
  });

  it("clamps to [0, MAX_LATENCY_MS]", () => {
    expect(estimateLatencyMs(0, 0, 100)).toBe(0);
    expect(estimateLatencyMs(2, 0, 0)).toBe(MAX_LATENCY_MS);
    expect(clampLatencyMs(Number.NaN)).toBe(0);
  });

  it("treats missing latencies as zero", () => {
    expect(estimateLatencyMs(0, 0, 0)).toBe(0);
  });
});
