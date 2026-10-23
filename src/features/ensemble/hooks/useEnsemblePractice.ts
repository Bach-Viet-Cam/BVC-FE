import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ensembleApi } from "@/features/ensemble/api/ensembleApi";
import { useTrackMixer } from "@/features/ensemble/hooks/useTrackMixer";
import {
  type EnsembleTake,
  type EnsembleTracksResult,
  type ListeningMode,
  type PracticeStatus,
  type TrackSetting,
} from "@/features/ensemble/types/ensembleTypes";
import { computePeaks } from "@/features/ensemble/utils/audioPeaks";
import { MIC_CONSTRAINTS } from "@/features/ensemble/utils/listeningMode";
import { getEffectiveVolume } from "@/features/ensemble/utils/mixerMath";
import { encodeWav } from "@/features/ensemble/utils/wavEncoder";
import { toast } from "@/shared/components/ui/toast";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { playClick } from "@/shared/utils/clickSound";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";
import { getAssetUrl } from "@/shared/utils/getAssetUrl";

const TAKE_PEAK_BUCKETS = 96;

export const MIC_DENIED_MESSAGE = "Không thể truy cập micro. Hãy cho phép quyền micro rồi thử lại.";
const LOAD_ERROR = "Không thể tải các bè hòa tấu. Vui lòng thử lại.";
const COUNT_IN_BEATS = 4;
const EMPTY_ANALYSERS: ReadonlyMap<string, AnalyserNode> = new Map();

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
  const durationSec = tracks.length > 0 ? Math.max(...tracks.map((track) => track.durationSec)) : 0;

  const [status, setStatus] = useState<PracticeStatus>("ready");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [isCountInOn, setIsCountInOn] = useState(true);
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [countBeat, setCountBeat] = useState(0);
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(null);
  const [micAnalyser, setMicAnalyser] = useState<AnalyserNode | null>(null);
  const [trackAnalysers, setTrackAnalysers] = useState<ReadonlyMap<string, AnalyserNode>>(EMPTY_ANALYSERS);

  const [take, setTake] = useState<EnsembleTake | null>(null);
  const takeRef = useRef<EnsembleTake | null>(null);
  const accompanimentTimersRef = useRef<number[]>([]);

  const statusRef = useRef<PracticeStatus>("ready");
  const isMetronomeOnRef = useRef(false);
  const settingsRef = useRef<TrackSetting[]>([]);
  const anySoloRef = useRef(false);
  const audiosRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const gainsRef = useRef<Map<string, GainNode>>(new Map());
  const contextRef = useRef<AudioContext | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timersRef = useRef<number[]>([]);
  const abortedRef = useRef(false);

  const changeStatus = useCallback((next: PracticeStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const replaceTake = useCallback((next: EnsembleTake | null) => {
    if (takeRef.current) URL.revokeObjectURL(takeRef.current.url);
    takeRef.current = next;
    setTake(next);
  }, []);

  // Rời màn: thu hồi URL tạm
  useEffect(
    () => () => {
      if (takeRef.current) URL.revokeObjectURL(takeRef.current.url);
    },
    []
  );

  const applyVolumes = useCallback(() => {
    settingsRef.current.forEach((setting) => {
      const gain = gainsRef.current.get(setting.trackId);
      if (gain) gain.gain.value = getEffectiveVolume(setting, anySoloRef.current);
    });
  }, []);

  useEffect(() => {
    isMetronomeOnRef.current = isMetronomeOn;
  }, [isMetronomeOn]);

  useEffect(() => {
    settingsRef.current = mixer.settings;
    anySoloRef.current = mixer.anySolo;
    applyVolumes();
  }, [mixer.settings, mixer.anySolo, applyVolumes]);

  // Một <audio> cho mỗi bè. Đồ thị Web Audio gắn vào chúng được tạo lười trong ensureContext().
  useEffect(() => {
    const audios = audiosRef.current;
    const gains = gainsRef.current;
    tracks.forEach((track) => {
      const audio = new Audio();
      audio.crossOrigin = "anonymous"; // bắt buộc: file nằm ở origin của BE, thiếu dòng này Web Audio chỉ ra im lặng
      audio.preload = "auto";
      audio.src = getAssetUrl(track.fileUrl);
      audios.set(track.id, audio);
    });
    return () => {
      audios.forEach((audio) => audio.pause());
      audios.clear();
      gains.clear();
      void contextRef.current?.close();
      contextRef.current = null;
    };
  }, [tracks]);

  const ensureContext = useCallback((): AudioContext => {
    if (contextRef.current) return contextRef.current;
    const context = new AudioContext();
    const analysers = new Map<string, AnalyserNode>();
    audiosRef.current.forEach((audio, trackId) => {
      const source = context.createMediaElementSource(audio);
      const gain = context.createGain();
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(gain);
      gain.connect(analyser);
      analyser.connect(context.destination);
      gainsRef.current.set(trackId, gain);
      analysers.set(trackId, analyser);
    });
    contextRef.current = context;
    setTrackAnalysers(analysers);
    applyVolumes();
    return context;
  }, [applyVolumes]);

  const pauseTracks = useCallback(() => {
    accompanimentTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    accompanimentTimersRef.current = [];
    audiosRef.current.forEach((audio) => audio.pause());
  }, []);

  /** Phát mọi bè từ giây `positionSec` của bản thu, với tốc độ `rate`; tôn trọng offset từng bè. Gọi trong cú bấm. */
  const playTracksFrom = useCallback(
    (positionSec: number, rate: number) => {
      pauseTracks();
      const context = ensureContext();
      void context.resume();
      tracks.forEach((track) => {
        const audio = audiosRef.current.get(track.id);
        if (!audio) return;
        audio.playbackRate = rate;
        const localSec = positionSec - track.offsetMs / 1000;
        if (localSec >= track.durationSec) return;
        if (localSec >= 0) {
          audio.currentTime = localSec;
          void audio.play();
          return;
        }
        audio.currentTime = 0;
        const timerId = window.setTimeout(() => void audio.play(), (-localSec * 1000) / rate);
        accompanimentTimersRef.current.push(timerId);
      });
    },
    [ensureContext, pauseTracks, tracks]
  );

  const releaseRecording = useCallback(() => {
    timersRef.current.forEach((timerId) => window.clearInterval(timerId));
    timersRef.current = [];
    pauseTracks();
    audiosRef.current.forEach((audio) => {
      audio.currentTime = 0;
    });
    micSourceRef.current?.disconnect();
    micSourceRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setMicAnalyser(null);
    setRecordingStartedAt(null);
  }, [pauseTracks]);

  const cancel = useCallback(() => {
    abortedRef.current = true;
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      recorder.stop();
    }
    recorderRef.current = null;
    chunksRef.current = [];
    releaseRecording();
    replaceTake(null);
    setElapsedSec(0);
    setCountBeat(0);
    changeStatus("ready");
  }, [changeStatus, releaseRecording, replaceTake]);

  useEffect(() => () => cancel(), [cancel]);

  const save = useCallback(async () => {
    const current = takeRef.current;
    if (!current || statusRef.current !== "preview") return;
    pauseTracks();
    changeStatus("saving");
    try {
      const form = new FormData();
      form.set("pieceId", pieceId);
      if (assignmentId) form.set("assignmentId", assignmentId);
      form.set("trackSettings", JSON.stringify(settingsRef.current));
      form.set("recording", current.blob, "take.wav");
      const { data } = await ensembleApi.createSession(form);
      toast.success(data.message);
      changeStatus("saved");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Không thể lưu bản thu. Vui lòng thử lại."));
      changeStatus("preview"); // giữ bản thu để lưu lại
    }
  }, [assignmentId, changeStatus, pauseTracks, pieceId]);

  const stop = useCallback(async () => {
    const recorder = recorderRef.current;
    if (statusRef.current !== "recording" || !recorder) return;
    changeStatus("processing");
    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
    });
    const recording = new Blob(chunksRef.current, { type: recorder.mimeType });
    recorderRef.current = null;
    chunksRef.current = [];
    releaseRecording();
    try {
      const wav = await encodeWav(recording);
      const decoded = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(await wav.arrayBuffer());
      replaceTake({
        blob: wav,
        url: URL.createObjectURL(wav),
        peaks: computePeaks(decoded.getChannelData(0), TAKE_PEAK_BUCKETS),
        durationSec: decoded.duration,
      });
      changeStatus("preview");
    } catch {
      toast.error("Không thể xử lý bản thu. Vui lòng thu lại.");
      setElapsedSec(0);
      changeStatus("ready");
    }
  }, [changeStatus, releaseRecording, replaceTake]);

  const discardTake = useCallback(() => {
    pauseTracks();
    replaceTake(null);
    setElapsedSec(0);
    setCountBeat(0);
    changeStatus("ready");
  }, [changeStatus, pauseTracks, replaceTake]);

  const reset = discardTake;

  const beginRecording = useCallback(
    (stream: MediaStream, beatMs: number) => {
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
        audio.playbackRate = 1;
        audio.currentTime = 0;
        if (track.offsetMs > 0) window.setTimeout(() => void audio.play(), track.offsetMs);
        else void audio.play();
      });
      const startedAt = Date.now();
      setRecordingStartedAt(startedAt);
      setElapsedSec(0);
      changeStatus("recording");
      const clock = window.setInterval(() => {
        const seconds = Math.floor((Date.now() - startedAt) / 1000);
        setElapsedSec(seconds);
        if (seconds >= durationSec) void stop();
      }, 250);
      const metronome = window.setInterval(() => {
        const context = contextRef.current;
        if (isMetronomeOnRef.current && context) playClick(context, false);
      }, beatMs);
      timersRef.current = [clock, metronome];
    },
    [changeStatus, durationSec, stop, tracks]
  );

  const start = useCallback(
    async (mode: ListeningMode) => {
      if (statusRef.current !== "ready" || !tracksResult) return;
      setMicError(null);
      abortedRef.current = false;
      const context = ensureContext(); // gọi ngay trong cú bấm để trình duyệt cho phép phát âm thanh
      await context.resume();
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: MIC_CONSTRAINTS[mode] });
      } catch {
        setMicError(MIC_DENIED_MESSAGE);
        return;
      }
      streamRef.current = stream;
      if (import.meta.env.DEV) {
        (window as unknown as { __ensembleMicSettings?: MediaTrackSettings }).__ensembleMicSettings = stream
          .getAudioTracks()[0]
          ?.getSettings();
      }
      const micSource = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      micSource.connect(analyser); // chỉ để vẽ; không nối ra loa nên không vọng tiếng
      micSourceRef.current = micSource;
      setMicAnalyser(analyser);
      const beatMs = 60000 / tracksResult.targetBpm;
      if (isCountInOn) {
        changeStatus("countIn");
        for (let beat = 0; beat < COUNT_IN_BEATS; beat += 1) {
          setCountBeat(beat);
          playClick(context, beat === 0);
          await sleep(beatMs);
          if (abortedRef.current) return;
        }
      }
      beginRecording(stream, beatMs);
    },
    [beginRecording, changeStatus, ensureContext, isCountInOn, tracksResult]
  );

  return {
    tracksResult,
    tracks,
    isLoading: tracksQuery.isLoading,
    error: tracksQuery.error,
    mixer,
    status,
    elapsedSec,
    durationSec,
    countBeat,
    recordingStartedAt,
    micAnalyser,
    trackAnalysers,
    isCountInOn,
    setIsCountInOn,
    isMetronomeOn,
    setIsMetronomeOn,
    micError,
    take,
    save,
    discardTake,
    playTracksFrom,
    pauseTracks,
    start,
    stop,
    cancel,
    reset,
  };
}
