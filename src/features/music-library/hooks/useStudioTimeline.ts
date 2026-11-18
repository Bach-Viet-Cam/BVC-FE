import { useCallback, useEffect, useMemo, useState } from "react";
import { type ReferenceStudio } from "@/features/music-library/hooks/useReferenceRecordingStudio";
import { useRecordingLevels } from "@/features/music-library/hooks/useRecordingLevels";
import { getTrackTheme, type TrackTheme } from "@/features/ensemble/utils/trackTheme";
import { buildRulerTicks, pickTimelineSpan, shortInstrumentName } from "@/features/music-library/utils/studioTimeline";

export interface StudioLaneModel {
  id: string;
  name: string;
  theme: TrackTheme;
  peaks: readonly number[];
  offsetSec: number;
  durationSec: number;
  /** 0-100 */
  volume: number;
  isMuted: boolean;
  isSolo: boolean;
  /** Bè đang không phát ra tiếng: tắt tiếng hoặc bị bè khác solo lấn. */
  isSilenced: boolean;
}

export type TakeLaneState = "empty" | "recording" | "ready";

export interface StudioTakeLaneModel {
  state: TakeLaneState;
  peaks: readonly number[];
  durationSec: number;
  /** 0-100 */
  volume: number;
  isMuted: boolean;
}

type PlayheadSource = "parts" | "take";

// Điều phối timeline của phòng thu: thước, vị trí đầu phát, tua, và việc "bè" với "bản thu" không phát chồng nhau.
export function useStudioTimeline(studio: ReferenceStudio) {
  const { tracks, mixer, peaksByTrack, parts, rec, take, playing, playPos, maxSeconds, analyser } = studio;
  const { seek: seekTake, togglePlay: toggleTakePlayback } = studio;
  const {
    playing: partsPlaying,
    position: partsPosition,
    stop: stopParts,
    seek: seekParts,
    toggle: togglePartsRaw,
  } = parts;
  const isRecording = rec === "recording";
  const isCounting = rec === "countin";
  const live = useRecordingLevels(analyser, isRecording);
  const [source, setSource] = useState<PlayheadSource>("parts");

  const trackEndSec = useMemo(
    () => tracks.reduce((end, track) => Math.max(end, track.offsetMs / 1000 + track.durationSec), 0),
    [tracks]
  );
  const takeSec = isRecording ? live.seconds : (take?.durationSec ?? 0);
  const spanSec = pickTimelineSpan(Math.max(trackEndSec, takeSec + (isRecording ? 6 : 0)), maxSeconds);
  const ticks = useMemo(() => buildRulerTicks(spanSec), [spanSec]);

  const lanes = useMemo<StudioLaneModel[]>(
    () =>
      tracks.flatMap((track, index) => {
        const setting = mixer.settings.find((item) => item.trackId === track.id);
        if (!setting) return [];
        return [
          {
            id: track.id,
            name: shortInstrumentName(track.instrumentName),
            theme: getTrackTheme(track.instrumentName, index),
            peaks: peaksByTrack.get(track.id) ?? [],
            offsetSec: track.offsetMs / 1000,
            durationSec: track.durationSec,
            volume: setting.volume,
            isMuted: setting.isMuted,
            isSolo: setting.isSolo,
            isSilenced: setting.isMuted || (mixer.anySolo && !setting.isSolo),
          },
        ];
      }),
    [tracks, mixer.settings, mixer.anySolo, peaksByTrack]
  );

  const takeLane: StudioTakeLaneModel = {
    state: isRecording ? "recording" : take ? "ready" : "empty",
    peaks: isRecording ? live.levels : (take?.peaks ?? []),
    durationSec: takeSec,
    volume: Math.round(studio.volume * 100),
    isMuted: studio.muted,
  };

  const takeHeadActive = Boolean(take) && source === "take";
  const playheadSec = isRecording ? live.seconds : takeHeadActive ? playPos : partsPosition;

  // Hết bè mẫu thì dừng và về đầu, không để đầu phát chạy tiếp trong im lặng
  useEffect(() => {
    if (isRecording || !partsPlaying || trackEndSec === 0 || partsPosition < trackEndSec) return;
    stopParts();
    seekParts(0);
  }, [isRecording, partsPlaying, partsPosition, trackEndSec, stopParts, seekParts]);

  const toggleParts = useCallback(() => {
    if (playing) toggleTakePlayback();
    if (source === "take") seekParts(playPos);
    setSource("parts");
    togglePartsRaw();
  }, [playing, source, playPos, seekParts, toggleTakePlayback, togglePartsRaw]);

  const toggleTake = useCallback(() => {
    if (!take) return;
    if (partsPlaying) stopParts();
    if (source === "parts") seekTake(partsPosition < take.durationSec ? partsPosition : 0);
    setSource("take");
    toggleTakePlayback();
  }, [take, partsPlaying, stopParts, source, partsPosition, seekTake, toggleTakePlayback]);

  const seekTo = useCallback(
    (sec: number) => {
      seekParts(sec);
      if (take) seekTake(Math.min(sec, take.durationSec));
    },
    [seekParts, seekTake, take]
  );

  return {
    lanes,
    takeLane,
    ticks,
    spanSec,
    trackEndSec,
    playheadSec,
    liveSeconds: live.seconds,
    isRecording,
    canSeek: !isRecording && !isCounting && (trackEndSec > 0 || Boolean(take)),
    isCounting,
    isPartsPlaying: partsPlaying && !isRecording,
    isTakePlaying: playing,
    toggleParts,
    toggleTake,
    seekTo,
  };
}
