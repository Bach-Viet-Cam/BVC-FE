import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { useAuth } from "@/shared/context/AuthContext";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";
import { audioAnalysisApi } from "../api/audioAnalysisApi";
import type { AudioEvaluation, AudioEvaluationInput } from "../types/audioAnalysisTypes";

export function useAudioEvaluation() {
  const { user } = useAuth();
  const storageKey = `audio-evaluation:${user?.userId ?? "guest"}`;
  const [evaluationId, setEvaluationId] = useState(() => sessionStorage.getItem(storageKey) || "");
  const [evaluation, setEvaluation] = useState<AudioEvaluation | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [polling, setPolling] = useState(() => Boolean(sessionStorage.getItem(storageKey)));
  const [paused, setPaused] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const stoppedId = useRef<string | null>(null);
  const submitController = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      submitController.current?.abort();
    },
    []
  );

  const watch = useCallback(
    (id: string, initial: AudioEvaluation | null = null) => {
      sessionStorage.setItem(storageKey, id);
      setEvaluationId(id);
      setEvaluation(initial);
      stoppedId.current = initial?.status === "publish_failed" ? id : null;
      setPolling(initial?.status !== "publish_failed");
      setPaused(false);
      setAttempt((value) => value + 1);
    },
    [storageKey]
  );

  const create = async (input: AudioEvaluationInput) => {
    if (submitController.current) return;
    const controller = new AbortController();
    submitController.current = controller;
    setSubmitting(true);
    setError("");
    try {
      const response = await audioAnalysisApi.create(input, controller.signal);
      if (!controller.signal.aborted) watch(response.data.data.evaluationId, response.data.data);
    } catch (reason) {
      if (controller.signal.aborted) return;
      const details = isAxiosError<{ data?: { evaluationId?: string; status?: string } }>(reason)
        ? reason.response?.data.data
        : undefined;
      if (details?.evaluationId && ["publish_unknown", "publish_failed"].includes(details.status || "")) {
        watch(details.evaluationId, {
          evaluationId: details.evaluationId,
          status: details.status as "publish_unknown" | "publish_failed",
          result: null,
          error: null,
        });
      }
      setError(getApiErrorMessage(reason, "Không nhận được xác nhận tạo yêu cầu. Vui lòng kiểm tra kết nối."));
    } finally {
      if (!controller.signal.aborted) setSubmitting(false);
      submitController.current = null;
    }
  };

  useEffect(() => {
    if (!evaluationId || stoppedId.current === evaluationId) return;
    const controller = new AbortController();
    const started = Date.now();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let delay = 3000;
    let failures = 0;
    const schedule = () => {
      if (Date.now() - started >= 5 * 60_000) {
        setPolling(false);
        setPaused(true);
        return;
      }
      timer = setTimeout(() => {
        void poll();
      }, delay);
    };
    const poll = async () => {
      try {
        const response = await audioAnalysisApi.get(evaluationId, controller.signal);
        if (controller.signal.aborted) return;
        const record = response.data.data;
        setEvaluation(record);
        setError("");
        delay = 3000;
        failures = 0;
        if (["completed", "failed", "rejected", "publish_failed"].includes(record.status)) {
          setPolling(false);
          return;
        }
      } catch (reason) {
        if (controller.signal.aborted) return;
        setError(getApiErrorMessage(reason, "Tạm thời chưa lấy được kết quả. Hệ thống sẽ kiểm tra lại."));
        if (isAxiosError(reason) && [400, 401, 403, 404].includes(reason.response?.status || 0)) {
          setPolling(false);
          setPaused(true);
          return;
        }
        delay = Math.min(3000 * 2 ** Math.min(failures++, 3), 15_000);
      }
      schedule();
    };
    void poll();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [evaluationId, attempt]);

  return {
    evaluationId,
    evaluation,
    error,
    submitting,
    polling,
    paused,
    create,
    resume: () => {
      stoppedId.current = null;
      setPolling(true);
      setPaused(false);
      setError("");
      setAttempt((value) => value + 1);
    },
  };
}
