export const MAX_LATENCY_MS = 500;
const STORAGE_PREFIX = "ensemble.latencyMs.";

export function clampLatencyMs(ms: number): number {
  return Number.isFinite(ms) ? Math.max(0, Math.min(MAX_LATENCY_MS, Math.round(ms))) : 0;
}

/**
 * Ước lượng độ trễ (ms) giữa lúc gọi phát bè mẫu và lúc nốt người học đánh xuất hiện trong bản thu:
 * độ trễ loa + độ trễ mic - phần đầu bè mẫu mà MediaRecorder bắt đầu thu muộn (`recorderLateMs`).
 */
export function estimateLatencyMs(outputLatencySec: number, inputLatencySec: number, recorderLateMs: number): number {
  return clampLatencyMs((outputLatencySec + inputLatencySec) * 1000 - recorderLateMs);
}

export function latencyStorageKey(deviceId: string | undefined, mode: string): string {
  return `${STORAGE_PREFIX}${deviceId ?? "default"}.${mode}`;
}

export function readStoredLatencyMs(key: string): number | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? clampLatencyMs(value) : null;
  } catch {
    return null;
  }
}

export function writeStoredLatencyMs(key: string, ms: number): void {
  try {
    window.localStorage.setItem(key, String(clampLatencyMs(ms)));
  } catch {
    // bỏ qua: chỉ là tiện ích cho lần sau
  }
}
