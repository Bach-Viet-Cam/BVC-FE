import { useCallback, useMemo, useState } from "react";
import { type EnsembleTrack, type TrackSetting } from "@/features/ensemble/types/ensembleTypes";
import { DEFAULT_TRACK_VOLUME } from "@/features/ensemble/utils/mixerMath";

type StoredSetting = Pick<TrackSetting, "volume" | "isMuted" | "isSolo">;

const DEFAULT_SETTING: StoredSetting = { volume: DEFAULT_TRACK_VOLUME, isMuted: false, isSolo: false };

export function useTrackMixer(tracks: EnsembleTrack[]) {
  const [stored, setStored] = useState<Record<string, StoredSetting>>({});

  const settings = useMemo<TrackSetting[]>(
    () => tracks.map((track) => ({ trackId: track.id, ...(stored[track.id] ?? DEFAULT_SETTING) })),
    [tracks, stored]
  );
  const anySolo = settings.some((setting) => setting.isSolo);

  const update = useCallback((trackId: string, change: Partial<StoredSetting>) => {
    setStored((previous) => ({ ...previous, [trackId]: { ...(previous[trackId] ?? DEFAULT_SETTING), ...change } }));
  }, []);

  const setVolume = useCallback((trackId: string, volume: number) => update(trackId, { volume }), [update]);
  const toggleMute = useCallback(
    (trackId: string) => update(trackId, { isMuted: !(stored[trackId]?.isMuted ?? false) }),
    [stored, update]
  );
  const toggleSolo = useCallback(
    (trackId: string) => update(trackId, { isSolo: !(stored[trackId]?.isSolo ?? false) }),
    [stored, update]
  );
  const reset = useCallback(() => setStored({}), []);

  return { settings, anySolo, setVolume, toggleMute, toggleSolo, reset };
}
