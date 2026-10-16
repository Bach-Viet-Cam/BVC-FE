import { type TrackSetting } from "@/features/ensemble/types/ensembleTypes";

export const DEFAULT_TRACK_VOLUME = 100;

export function getEffectiveVolume(
  setting: Pick<TrackSetting, "volume" | "isMuted" | "isSolo">,
  anySolo: boolean
): number {
  if (setting.isMuted) return 0;
  if (anySolo && !setting.isSolo) return 0;
  return Math.min(100, Math.max(0, setting.volume)) / 100;
}
