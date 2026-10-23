import { type ListeningMode } from "@/features/ensemble/types/ensembleTypes";

export const STORAGE_KEY = "bvc.ensemble.listeningChoice";
const HEADPHONE_PATTERN = /head(phone|set)|airpods|buds|earphone|tai nghe/i;

/** Tai nghe: không lọc gì để giữ nguyên tiếng đàn. Loa ngoài: chỉ khử vọng để bớt tiếng bè lọt vào micro. */
export const MIC_CONSTRAINTS: Record<ListeningMode, MediaTrackConstraints> = {
  headphones: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  speaker: { echoCancellation: true, noiseSuppression: false, autoGainControl: false },
};

export interface DeviceSnapshot {
  hasMic: boolean;
  headphoneLabel: string | null;
  /** Chuỗi nhận diện bộ thiết bị hiện tại. */
  signature: string;
}

export async function readDevices(): Promise<DeviceSnapshot> {
  try {
    const devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind !== "videoinput");
    const audioInputs = devices.filter((device) => device.kind === "audioinput");
    const headphone = devices.find((device) => HEADPHONE_PATTERN.test(device.label));
    const signature = devices
      .map((device) => `${device.kind}:${device.label}`)
      .sort()
      .join("|");
    return {
      hasMic: audioInputs.length > 0,
      headphoneLabel: headphone?.label ?? null,
      signature,
    };
  } catch {
    return { hasMic: false, headphoneLabel: null, signature: "" };
  }
}

export function clearStoredChoice(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
