import { useCallback, useEffect, useRef, useState } from "react";
import { AUDIO_HOP_SIZE, MIC_CONSTRAINTS } from "@/features/practice/constants/practiceConstants";
import type {
  AnalysisFrame,
  CaptureMessage,
  MicState,
  WorkletCommand,
  WorkletMessage,
} from "@/features/practice/types/practiceAudioTypes";

const WORKLET_URL = `${import.meta.env.BASE_URL}worklets/practice-capture.worklet.js`;
const WORKLET_NAME = "practice-capture";

// Cửa sổ phân tích chứa ≥ 3 chu kỳ của nốt thấp nhất (fminHz), là luỹ thừa của 2 trong [2048, 8192]
function analysisWindowSize(sampleRate: number, fminHz: number): number {
  const needed = (3 * sampleRate) / fminHz;
  let size = 2048;
  while (size < needed && size < 8192) size *= 2;
  return size;
}

function stopStream(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}

interface UsePracticeAudioOptions {
  micWanted: boolean; // true khi đang ở chế độ "Ghi âm"
  fminHz: number;
}

export function usePracticeAudio({ micWanted, fminHz }: UsePracticeAudioOptions) {
  const [ctx] = useState(() => new AudioContext({ latencyHint: "interactive" }));
  const [micState, setMicState] = useState<MicState>("idle");
  const [ready, setReady] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const nodeRef = useRef<AudioWorkletNode | null>(null);
  const frameListeners = useRef(new Set<(frame: AnalysisFrame) => void>());
  const captureHandler = useRef<((message: CaptureMessage) => void) | null>(null);

  // Chính sách autoplay: AudioContext có thể bị "suspended" cho tới lần chạm đầu
  useEffect(() => {
    const unlock = () => {
      if (ctx.state === "suspended") void ctx.resume();
    };
    unlock();
    window.addEventListener("pointerdown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      void ctx.close();
    };
  }, [ctx]);

  // Người dùng bật/tắt quyền micro trong trình duyệt thì thử lại (UC: "returns to step 2")
  useEffect(() => {
    let status: PermissionStatus | null = null;
    const onChange = () => setRetryToken((value) => value + 1);
    // "microphone" chưa có trong union PermissionName của lib.dom nên phải ép kiểu
    navigator.permissions
      ?.query({ name: "microphone" as PermissionName })
      .then((result) => {
        status = result;
        result.addEventListener("change", onChange);
      })
      .catch(() => undefined);
    return () => status?.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!micWanted) return;
    let cancelled = false;
    let stream: MediaStream | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let node: AudioWorkletNode | null = null;
    let sink: GainNode | null = null;
    let meter: AnalyserNode | null = null;

    const connect = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: MIC_CONSTRAINTS });
        await ctx.audioWorklet.addModule(WORKLET_URL);
        if (cancelled) return;
        source = ctx.createMediaStreamSource(stream);
        node = new AudioWorkletNode(ctx, WORKLET_NAME, {
          numberOfInputs: 1,
          numberOfOutputs: 1,
          channelCount: 1,
          channelCountMode: "explicit",
          processorOptions: { windowSize: analysisWindowSize(ctx.sampleRate, fminHz), hopSize: AUDIO_HOP_SIZE },
        });
        sink = ctx.createGain();
        sink.gain.value = 0; // không bao giờ phát tiếng micro ra loa
        source.connect(node).connect(sink).connect(ctx.destination);
        meter = ctx.createAnalyser(); // chỉ để vẽ sóng âm, không nối ra loa
        meter.fftSize = 1024;
        source.connect(meter);
        node.port.onmessage = (event: MessageEvent<WorkletMessage>) => {
          const message = event.data;
          if (message.type === "frame") frameListeners.current.forEach((listener) => listener(message));
          else captureHandler.current?.(message);
        };
        stream.getAudioTracks()[0]?.addEventListener("ended", () => {
          captureHandler.current?.({ type: "trackEnded" });
          setReady(false);
          setAnalyser(null);
          setMicState("denied");
        });
        nodeRef.current = node;
        node.port.postMessage({ type: "analysis", on: frameListeners.current.size > 0 } satisfies WorkletCommand);
        setAnalyser(meter);
        setMicState("granted");
        setReady(true);
      } catch (error) {
        if (cancelled) return;
        console.error("[practice] Không mở được micro", error);
        setMicState("denied");
      }
    };
    void connect();

    return () => {
      cancelled = true;
      nodeRef.current = null;
      node?.port.close();
      source?.disconnect();
      node?.disconnect();
      sink?.disconnect();
      meter?.disconnect();
      if (stream) stopStream(stream);
      setReady(false);
      setAnalyser(null);
    };
  }, [ctx, micWanted, fminHz, retryToken]);

  const post = useCallback((command: WorkletCommand) => {
    nodeRef.current?.port.postMessage(command);
  }, []);

  // Worklet chỉ gửi khung phân tích khi có ít nhất 1 listener
  const subscribeFrames = useCallback(
    (listener: (frame: AnalysisFrame) => void) => {
      const listeners = frameListeners.current;
      listeners.add(listener);
      if (listeners.size === 1) post({ type: "analysis", on: true });
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) post({ type: "analysis", on: false });
      };
    },
    [post]
  );

  const setCaptureHandler = useCallback((handler: ((message: CaptureMessage) => void) | null) => {
    captureHandler.current = handler;
  }, []);

  const retryMic = useCallback(() => setRetryToken((value) => value + 1), []);

  return {
    ctx,
    micState: micWanted ? micState : ("idle" as MicState),
    ready: micWanted && ready,
    analyser: micWanted ? analyser : null,
    subscribeFrames,
    setCaptureHandler,
    post,
    retryMic,
  };
}

export type PracticeAudio = ReturnType<typeof usePracticeAudio>;
