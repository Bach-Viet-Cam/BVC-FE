import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EnsembleTrack, ListeningMode } from "@/features/ensemble/types/ensembleTypes";
import { useCountIn } from "@/features/music-library/hooks/useCountIn";
import { usePartsPreview } from "@/features/ensemble/hooks/usePartsPreview";
import { useTrackMixer } from "@/features/ensemble/hooks/useTrackMixer";
import { useTrackPeaks } from "@/features/ensemble/hooks/useTrackPeaks";
import { computePeaks } from "@/features/ensemble/utils/audioPeaks";
import { MIC_CONSTRAINTS } from "@/features/ensemble/utils/listeningMode";
import type { RecordState } from "@/features/practice/types/practiceTypes";
import { encodeRecording } from "@/features/practice/utils/wavPcm";
import { musicLibraryApi } from "@/features/music-library/api/musicLibraryApi";
import { FILE_RULES } from "@/features/music-library/constants/musicLibraryConstants";
import { getAssetUrl } from "@/shared/utils/getAssetUrl";

// 48 kHz mono 16-bit khoảng 5,8 MiB/phút; 180 giây vẫn nằm dưới hạn 20 MB của thư viện
const MAX_SECONDS = 180;
const RECORDING_NAME = "ban-thu-mau.wav";
const PREVIEW_BARS = 240;
const MIN_TIMELINE_SEC = 180;
const EMPTY_ANALYSERS: ReadonlyMap<string, AnalyserNode> = new Map();

export interface ReferenceTake {
  file: File;
  url: string;
  durationSec: number;
  peaks: number[];
}

// Dùng chung cho trang thu của giảng viên: bè đệm, micro, bản thu và các điều khiển phát lại.
export function useReferenceRecordingStudio(songId: string) {
  const [songTitle, setSongTitle] = useState("");
  const [tracks, setTracks] = useState<EnsembleTrack[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);
  const [trackAnalysers, setTrackAnalysers] = useState<ReadonlyMap<string, AnalyserNode>>(EMPTY_ANALYSERS);
  const [listeningMode, setListeningMode] = useState<ListeningMode>("speaker");
  const [rec, setRec] = useState<RecordState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const [micDenied, setMicDenied] = useState(false);
  const [take, setTake] = useState<ReferenceTake | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [playing, setPlaying] = useState(false);
  const [playPos, setPlayPos] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRateState] = useState(1);
  const [isCountInOn, setIsCountInOn] = useState(true);
  const countIn = useCountIn();
  const runCountIn = countIn.run;
  const cancelCountInTimers = countIn.cancel;

  const audiosRef = useRef(new Map<string, HTMLAudioElement>());
  const gainsRef = useRef(new Map<string, GainNode>());
  const accompanimentTimersRef = useRef<number[]>([]);
  const contextRef = useRef<AudioContext | null>(null);
  const micContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const elapsedRef = useRef(0);
  const takeUrlRef = useRef<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const mixer = useTrackMixer(tracks);
  const peaksByTrack = useTrackPeaks(tracks);
  const settingsRef = useRef(mixer.settings);
  const anySoloRef = useRef(mixer.anySolo);

  const durationSec = useMemo(
    () => Math.max(MIN_TIMELINE_SEC, ...tracks.map((track) => track.offsetMs / 1000 + track.durationSec)),
    [tracks]
  );

  // Endpoint hòa tấu là studentOnly ở BE, nên lấy bản thu công khai qua API thư viện
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const detail = await musicLibraryApi.getLibrarySong(songId);
        if (!alive) return;
        setSongTitle(detail.title);
        const candidates = detail.sheets.filter((sheet) => sheet.referenceRecording);
        const loaded = await Promise.all(
          candidates.map(async (sheet) => {
            try {
              const viewer = await musicLibraryApi.getSheetViewer(songId, sheet.id);
              const media = viewer.sheet.referenceRecording ?? viewer.fallbackRecording;
              if (!media?.url) return null;
              return {
                id: sheet.id,
                instrumentId: sheet.instrument.id,
                instrumentName: sheet.instrument.name,
                fileUrl: media.url,
                durationSec: media.durationSec ?? 0,
                offsetMs: 0,
                defaultVolume: 100,
              };
            } catch {
              return null;
            }
          })
        );
        if (alive) setTracks(loaded.filter((track): track is EnsembleTrack => track !== null));
      } catch {
        if (alive) setError("Không tải được danh sách bản thu có sẵn. Bạn vẫn có thể thu âm.");
      } finally {
        if (alive) setIsLoadingTracks(false);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [songId]);

  const applyVolumes = useCallback(() => {
    const anySolo = anySoloRef.current;
    settingsRef.current.forEach((setting) => {
      const gain = gainsRef.current.get(setting.trackId);
      if (!gain) return;
      const audible = !setting.isMuted && (!anySolo || setting.isSolo);
      gain.gain.value = audible ? setting.volume / 100 : 0;
    });
  }, []);

  useEffect(() => {
    settingsRef.current = mixer.settings;
    anySoloRef.current = mixer.anySolo;
    applyVolumes();
  }, [mixer.settings, mixer.anySolo, applyVolumes]);

  // Một <audio> cho mỗi bè, đúng cách trang hòa tấu dùng để Web Audio không ra im lặng
  useEffect(() => {
    const audios = audiosRef.current;
    const gains = gainsRef.current;
    tracks.forEach((track) => {
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audio.preload = "auto";
      audio.src = getAssetUrl(track.fileUrl);
      audios.set(track.id, audio);
    });
    return () => {
      accompanimentTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      accompanimentTimersRef.current = [];
      audios.forEach((audio) => audio.pause());
      audios.clear();
      gains.clear();
      void contextRef.current?.close();
      contextRef.current = null;
    };
  }, [tracks]);

  const ensureContext = useCallback(() => {
    if (contextRef.current) return contextRef.current;
    const context = new AudioContext();
    const analysers = new Map<string, AnalyserNode>();
    audiosRef.current.forEach((audio, trackId) => {
      const source = context.createMediaElementSource(audio);
      const gain = context.createGain();
      const trackAnalyser = context.createAnalyser();
      trackAnalyser.fftSize = 1024;
      source.connect(gain);
      gain.connect(trackAnalyser);
      trackAnalyser.connect(context.destination);
      gainsRef.current.set(trackId, gain);
      analysers.set(trackId, trackAnalyser);
    });
    contextRef.current = context;
    setTrackAnalysers(analysers);
    applyVolumes();
    return context;
  }, [applyVolumes]);

  const pauseAll = useCallback(() => {
    accompanimentTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    accompanimentTimersRef.current = [];
    audiosRef.current.forEach((audio) => audio.pause());
  }, []);

  const playAll = useCallback(
    (positionSec: number, playbackRate: number) => {
      pauseAll();
      const context = ensureContext();
      void context.resume();
      tracks.forEach((track) => {
        const audio = audiosRef.current.get(track.id);
        if (!audio) return;
        audio.playbackRate = playbackRate;
        const localSec = positionSec - track.offsetMs / 1000;
        if (localSec >= track.durationSec) return;
        if (localSec >= 0) {
          audio.currentTime = localSec;
          void audio.play();
          return;
        }
        audio.currentTime = 0;
        const timerId = window.setTimeout(() => void audio.play(), (-localSec * 1000) / playbackRate);
        accompanimentTimersRef.current.push(timerId);
      });
    },
    [ensureContext, pauseAll, tracks]
  );

  const parts = usePartsPreview(durationSec, playAll, pauseAll);
  const stopParts = parts.stop;
  const seekParts = parts.seek;

  const releasePreview = useCallback(() => {
    const audio = previewAudioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
    }
    previewAudioRef.current = null;
    setPlaying(false);
    setPlayPos(0);
  }, []);

  const releaseTake = useCallback(() => {
    releasePreview();
    if (takeUrlRef.current) URL.revokeObjectURL(takeUrlRef.current);
    takeUrlRef.current = null;
  }, [releasePreview]);

  const stopMic = useCallback(() => {
    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;
    void micContextRef.current?.close();
    micContextRef.current = null;
    setAnalyser(null);
  }, []);

  const finish = useCallback(
    async (recorder: MediaRecorder) => {
      stopMic();
      pauseAll();
      const recorded = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
      if (recorded.size === 0) {
        setError("Bản thu trống. Vui lòng thu lại.");
        setRec("idle");
        return;
      }
      try {
        const decoder = new OfflineAudioContext(1, 1, 44100);
        const decoded = await decoder.decodeAudioData(await recorded.arrayBuffer());
        const wav = encodeRecording(decoded.getChannelData(0), decoded.sampleRate);
        if (wav.size > FILE_RULES.recording.maxBytes) {
          setError("Bản thu vượt quá dung lượng cho phép. Hãy thu đoạn ngắn hơn.");
          setRec("idle");
          return;
        }
        const url = URL.createObjectURL(wav);
        releaseTake();
        takeUrlRef.current = url;
        const audio = new Audio(url);
        audio.addEventListener("timeupdate", () => setPlayPos(audio.currentTime));
        audio.addEventListener("ended", () => setPlaying(false));
        previewAudioRef.current = audio;
        setTake({
          file: new File([wav], RECORDING_NAME, { type: "audio/wav" }),
          url,
          durationSec: decoded.duration,
          peaks: computePeaks(decoded.getChannelData(0), PREVIEW_BARS),
        });
        setRec("preview");
      } catch {
        setError("Không xử lý được bản thu. Vui lòng thử lại.");
        setRec("idle");
      }
    },
    [pauseAll, releaseTake, stopMic]
  );

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Dừng hẳn đồng hồ các bè và đưa về 0:00, nếu không timeline vẫn chạy tiếp sau khi thu xong
    stopParts();
    seekParts(0);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, [seekParts, stopParts]);

  const beginRecording = useCallback(async () => {
    setError("");
    setMicDenied(false);
    releaseTake();
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: MIC_CONSTRAINTS[listeningMode] });
      micStreamRef.current = stream;
      const micAudioContext = new AudioContext();
      micContextRef.current = micAudioContext;
      const source = micAudioContext.createMediaStreamSource(stream);
      const micAnalyser = micAudioContext.createAnalyser();
      micAnalyser.fftSize = 1024;
      source.connect(micAnalyser); // Không nối vào destination để khỏi vọng micro ra loa
      setAnalyser(micAnalyser);

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "";
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => void finish(recorder);
      recorder.start();

      setRec("recording");
      setElapsed(0);
      elapsedRef.current = 0;
      startedAtRef.current = Date.now();
      // Luôn thu từ 0:00 để bản thu khớp với các bè, kể cả khi trước đó đã tua giữa chừng
      parts.seek(0);
      if (!parts.playing) parts.toggle();
      timerRef.current = window.setInterval(() => {
        const seconds = Math.floor((Date.now() - startedAtRef.current) / 1000);
        elapsedRef.current = seconds;
        setElapsed(seconds);
        if (seconds >= MAX_SECONDS) stop();
      }, 250);
    } catch {
      setMicDenied(true);
      setError("Không truy cập được micro. Hãy cho phép quyền micro trong trình duyệt.");
      setRec("idle");
    }
  }, [finish, listeningMode, parts, releaseTake, stop]);

  // Có đếm nhịp: xin quyền micro trước để hộp hỏi quyền không chen vào giữa lúc đếm, rồi mới đếm
  const start = useCallback(async () => {
    if (!isCountInOn) {
      await beginRecording();
      return;
    }
    setError("");
    setMicDenied(false);
    try {
      const probe = await navigator.mediaDevices.getUserMedia({ audio: MIC_CONSTRAINTS[listeningMode] });
      probe.getTracks().forEach((track) => track.stop());
    } catch {
      setMicDenied(true);
      setError("Không truy cập được micro. Hãy cho phép quyền micro trong trình duyệt.");
      return;
    }
    setRec("countin");
    runCountIn(() => void beginRecording());
  }, [beginRecording, isCountInOn, listeningMode, runCountIn]);

  const cancelCountIn = useCallback(() => {
    cancelCountInTimers();
    setRec("idle");
  }, [cancelCountInTimers]);

  const discard = useCallback(() => {
    releaseTake();
    setTake(null);
    setRec("idle");
    setElapsed(0);
    setError("");
  }, [releaseTake]);

  const togglePlay = useCallback(() => {
    const audio = previewAudioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play()
        .then(() => setPlaying(true))
        .catch(() => setError("Không phát được bản thu vừa ghi."));
      return;
    }
    audio.pause();
    setPlaying(false);
  }, []);

  const seek = useCallback((seconds: number) => {
    const audio = previewAudioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    setPlayPos(seconds);
  }, []);

  const setVolume = useCallback((next: number) => {
    setVolumeState(next);
    if (previewAudioRef.current) previewAudioRef.current.volume = next;
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((previous) => {
      const next = !previous;
      if (previewAudioRef.current) previewAudioRef.current.muted = next;
      return next;
    });
  }, []);

  const setRate = useCallback((next: number) => {
    setRateState(next);
    if (previewAudioRef.current) previewAudioRef.current.playbackRate = next;
  }, []);

  const download = useCallback(() => {
    if (!take) return;
    const link = document.createElement("a");
    link.href = take.url;
    link.download = RECORDING_NAME;
    link.click();
  }, [take]);

  // Dọn mọi tài nguyên khi rời trang, không để tiếng đàn hay micro chạy nền
  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      micStreamRef.current?.getTracks().forEach((track) => track.stop());
      void micContextRef.current?.close();
      accompanimentTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      audiosRef.current.forEach((audio) => audio.pause());
      void contextRef.current?.close();
      previewAudioRef.current?.pause();
      if (takeUrlRef.current) URL.revokeObjectURL(takeUrlRef.current);
    },
    []
  );

  return {
    songTitle,
    tracks,
    isLoadingTracks,
    mixer,
    peaksByTrack,
    trackAnalysers,
    durationSec,
    parts,
    listeningMode,
    setListeningMode,
    rec,
    elapsed,
    error,
    micDenied,
    take,
    analyser,
    playing,
    playPos,
    volume,
    muted,
    rate,
    maxSeconds: MAX_SECONDS,
    countBeat: countIn.beat ?? 0,
    isCountInOn,
    setIsCountInOn,
    start,
    cancelCountIn,
    stop,
    discard,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    setRate,
    download,
  };
}

export type ReferenceStudio = ReturnType<typeof useReferenceRecordingStudio>;
