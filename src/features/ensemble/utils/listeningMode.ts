import { type ListeningMode } from "@/features/ensemble/types/ensembleTypes";

const STORAGE_KEY = "bvc.ensemble.listeningChoice";
const HEADPHONE_PATTERN = /head(phone|set)|airpods|buds|earphone|tai nghe/i;

/** Tai nghe: không lọc gì để giữ nguyên tiếng đàn. Loa ngoài: chỉ khử vọng để bớt tiếng bè lọt vào micro. */
export const MIC_CONSTRAINTS: Record<ListeningMode, MediaTrackConstraints> = {
  headphones: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  speaker: { echoCancellation: true, noiseSuppression: false, autoGainControl: false },
};

export interface DeviceSnapshot {
  headphoneLabel: string | null;
  /** Chuỗi nhận diện bộ thiết bị hiện tại để nhớ lựa chọn tay. */
  signature: string;
}

export async function readDevices(): Promise<DeviceSnapshot> {
  try {
    const devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind !== "videoinput");
    const headphone = devices.find((device) => HEADPHONE_PATTERN.test(device.label));
    const signature = devices
      .map((device) => `${device.kind}:${device.label}`)
      .sort()
      .join("|");
    return { headphoneLabel: headphone?.label ?? null, signature };
  } catch {
    return { headphoneLabel: null, signature: "" };
  }
}

interface StoredChoice {
  signature: string;
  mode: ListeningMode;
}

export function readStoredChoice(): StoredChoice | null {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
    if (typeof parsed !== "object" || parsed === null) return null;
    const { signature, mode } = parsed as Partial<StoredChoice>;
    return typeof signature === "string" && (mode === "headphones" || mode === "speaker") ? { signature, mode } : null;
  } catch {
    return null;
  }
}

export function saveStoredChoice(choice: StoredChoice): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(choice));
  } catch {
    /* bị chặn lưu trữ: lần sau hỏi lại */
  }
}
