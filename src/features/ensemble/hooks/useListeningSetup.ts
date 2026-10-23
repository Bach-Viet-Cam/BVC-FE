import { useCallback, useEffect, useRef, useState } from "react";
import { type ListeningMode, type MicPermission } from "@/features/ensemble/types/ensembleTypes";
import { readDevices, readStoredChoice, saveStoredChoice } from "@/features/ensemble/utils/listeningMode";

interface ListeningState {
  permission: MicPermission;
  headphoneLabel: string | null;
  signature: string;
  /** Lựa chọn tay cho bộ thiết bị hiện tại (null = chưa chọn). */
  manualMode: ListeningMode | null;
}

const INITIAL_STATE: ListeningState = { permission: "pending", headphoneLabel: null, signature: "", manualMode: null };

export function useListeningSetup(isEnabled: boolean) {
  const [state, setState] = useState<ListeningState>(INITIAL_STATE);
  const isMountedRef = useRef(true);

  const evaluateDevices = useCallback(async () => {
    const snapshot = await readDevices();
    if (!isMountedRef.current) return;
    const stored = readStoredChoice();
    setState((previous) => ({
      ...previous,
      headphoneLabel: snapshot.headphoneLabel,
      signature: snapshot.signature,
      manualMode: stored && stored.signature === snapshot.signature ? stored.mode : null,
    }));
  }, []);

  /** Xin quyền micro rồi dừng ngay luồng (chỉ cần quyền + tên thiết bị). */
  const requestAccess = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      if (!isMountedRef.current) return;
      setState((previous) => ({ ...previous, permission: "granted" }));
      await evaluateDevices();
    } catch {
      if (isMountedRef.current) setState((previous) => ({ ...previous, permission: "denied" }));
    }
  }, [evaluateDevices]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Vào màn (khi đã tải xong bè) → xin quyền ngay.
  useEffect(() => {
    if (!isEnabled) return;
    let isCancelled = false;

    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
        if (isCancelled) return;
        setState((previous) => ({ ...previous, permission: "granted" }));
        return evaluateDevices();
      })
      .catch(() => {
        if (!isCancelled) {
          setState((previous) => ({ ...previous, permission: "denied" }));
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isEnabled, evaluateDevices]);

  // Cắm/rút thiết bị → dò lại.
  useEffect(() => {
    if (state.permission !== "granted") return;
    const handleChange = () => void evaluateDevices();
    navigator.mediaDevices.addEventListener("devicechange", handleChange);
    return () => navigator.mediaDevices.removeEventListener("devicechange", handleChange);
  }, [state.permission, evaluateDevices]);

  const choose = useCallback((mode: ListeningMode) => {
    setState((previous) => {
      saveStoredChoice({ signature: previous.signature, mode });
      return { ...previous, manualMode: mode };
    });
  }, []);

  const mode: ListeningMode | null = state.headphoneLabel ? "headphones" : state.manualMode;

  return {
    permission: state.permission,
    mode,
    headphoneLabel: state.headphoneLabel,
    /** Có quyền nhưng không thấy tai nghe và chưa chọn tay → cần hỏi. */
    needsChoice: state.permission === "granted" && mode === null,
    choose,
    requestAccess,
  };
}
