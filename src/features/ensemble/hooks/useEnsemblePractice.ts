import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ensembleApi } from "@/features/ensemble/api/ensembleApi";
import { useTrackMixer } from "@/features/ensemble/hooks/useTrackMixer";
import {
  type EnsembleTracksResult,
  type PracticeStatus,
  type TrackSetting,
} from "@/features/ensemble/types/ensembleTypes";
import { playClick } from "@/features/ensemble/utils/clickSound";
import { getEffectiveVolume } from "@/features/ensemble/utils/mixerMath";
import { encodeWav } from "@/features/ensemble/utils/wavEncoder";
import { toast } from "@/shared/components/ui/toast";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";
import { getAssetUrl } from "@/shared/utils/getAssetUrl";

export const MIC_DENIED_MESSAGE = "Không thể truy cập micro. Hãy cho phép quyền micro rồi thử lại.";
const LOAD_ERROR = "Không thể tải các bè hòa tấu. Vui lòng thử lại.";
const COUNT_IN_BEATS = 4;

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

export function useEnsemblePractice(pieceId: string, assignmentId: string | undefined) {
  const tracksQuery = useAsyncData<EnsembleTracksResult>(
    () => ensembleApi.getTracks(pieceId, assignmentId).then(({ data }) => data.data),
    `${pieceId}|${assignmentId ?? ""}`,
    LOAD_ERROR
  );
  const tracksResult = tracksQuery.data;
  const tracks = useMemo(() => tracksResult?.tracks ?? [], [tracksResult]);
  const mixer = useTrackMixer(tracks);

  const [status, setStatus] = useState<PracticeStatus>("ready");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [isCountInOn, setIsCountInOn] = useState(true);
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const statusRef = useRef<PracticeStatus>("ready");
  const isMetronomeOnRef = useRef(false);
  const settingsRef = useRef<TrackSetting[]>([]);
  const audiosRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timersRef = useRef<number[]>([]);
  const abortedRef = useRef(false);

  const changeStatus = useCallback((next: PracticeStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  useEffect(() => {
    isMetronomeOnRef.current = isMetronomeOn;
  }, [isMetronomeOn]);

  useEffect(() => {
    settingsRef.current = mixer.settings;
    mixer.settings.forEach((setting) => {
      const audio = audiosRef.current.get(setting.trackId);
      if (audio) audio.volume = getEffectiveVolume(setting, mixer.anySolo);
    });
  }, [mixer.settings, mixer.anySolo]);

  useEffect(() => {
    const audios = audiosRef.current;
    tracks.forEach((track) => {
      const audio = new Audio(getAssetUrl(track.fileUrl));
      audio.preload = "auto";
      audios.set(track.id, audio);
    });
    return () => {
      audios.forEach((audio) => audio.pause());
      audios.clear();
    };
  }, [tracks]);

  const releaseResources = useCallback(() => {
    timersRef.current.forEach((timerId) => window.clearInterval(timerId));
    timersRef.current = [];
    audiosRef.current.forEach((audio) => audio.pause());
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioContextRef.current?.close();
    audioContextRef.current = null;
  }, []);

  const cancel = useCallback(() => {
    abortedRef.current = true;
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      recorder.stop();
    }
    recorderRef.current = null;
    chunksRef.current = [];
    releaseResources();
    setElapsedSec(0);
    changeStatus("ready");
  }, [changeStatus, releaseResources]);

  useEffect(() => () => cancel(), [cancel]);

  const save = useCallback(
    async (recording: Blob) => {
      changeStatus("saving");
      try {
        const wav = await encodeWav(recording);
        const form = new FormData();
        form.set("pieceId", pieceId);
        if (assignmentId) form.set("assignmentId", assignmentId);
        form.set("trackSettings", JSON.stringify(settingsRef.current));
        form.set("recording", wav, "take.wav");
        const { data } = await ensembleApi.createSession(form);
        toast.success(data.message);
        changeStatus("saved");
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Không thể lưu bản thu. Vui lòng thử lại."));
        changeStatus("ready");
      }
    },
    [assignmentId, changeStatus, pieceId]
  );

  const stop = useCallback(async () => {
    const recorder = recorderRef.current;
    if (statusRef.current !== "recording" || !recorder) return;
    changeStatus("saving");
    timersRef.current.forEach((timerId) => window.clearInterval(timerId));
    timersRef.current = [];
    audiosRef.current.forEach((audio) => audio.pause());
    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
    });
    const recording = new Blob(chunksRef.current, { type: recorder.mimeType });
    recorderRef.current = null;
    chunksRef.current = [];
    releaseResources();
    await save(recording);
  }, [changeStatus, releaseResources, save]);

  const beginRecording = useCallback(
    (stream: MediaStream, beatMs: number, durationSec: number) => {
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorderRef.current = recorder;
      recorder.start();
      tracks.forEach((track) => {
        const audio = audiosRef.current.get(track.id);
        if (!audio) return;
        audio.currentTime = 0;
        if (track.offsetMs > 0) window.setTimeout(() => void audio.play(), track.offsetMs);
        else void audio.play();
      });
      const startedAt = Date.now();
      setElapsedSec(0);
      changeStatus("recording");
      const clock = window.setInterval(() => {
        const seconds = Math.floor((Date.now() - startedAt) / 1000);
        setElapsedSec(seconds);
        if (seconds >= durationSec) void stop();
      }, 250);
      const metronome = window.setInterval(() => {
        const context = audioContextRef.current;
        if (isMetronomeOnRef.current && context) playClick(context, false);
      }, beatMs);
      timersRef.current = [clock, metronome];
    },
    [changeStatus, stop, tracks]
  );

  const start = useCallback(async () => {
    if (statusRef.current !== "ready" || !tracksResult) return;
    setMicError(null);
    abortedRef.current = false;
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setMicError(MIC_DENIED_MESSAGE);
      return;
    }
    streamRef.current = stream;
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    const beatMs = 60000 / tracksResult.targetBpm;
    if (isCountInOn) {
      changeStatus("countIn");
      for (let beat = 0; beat < COUNT_IN_BEATS; beat += 1) {
        playClick(audioContext, beat === 0);
        await sleep(beatMs);
        if (abortedRef.current) return;
      }
    }
    const durationSec = Math.max(...tracks.map((track) => track.durationSec));
    beginRecording(stream, beatMs, durationSec);
  }, [beginRecording, changeStatus, isCountInOn, tracks, tracksResult]);

  const reset = useCallback(() => {
    setElapsedSec(0);
    changeStatus("ready");
  }, [changeStatus]);

  return {
    tracksResult,
    tracks,
    isLoading: tracksQuery.isLoading,
    error: tracksQuery.error,
    mixer,
    status,
    elapsedSec,
    durationSec: tracks.length > 0 ? Math.max(...tracks.map((track) => track.durationSec)) : 0,
    isCountInOn,
    setIsCountInOn,
    isMetronomeOn,
    setIsMetronomeOn,
    micError,
    start,
    stop,
    cancel,
    reset,
  };
}
