import { useCallback, useEffect, useRef, useState } from "react";
import { type ListeningMode, type MicPermission } from "@/features/ensemble/types/ensembleTypes";
import { clearStoredChoice, readDevices } from "@/features/ensemble/utils/listeningMode";

interface ListeningState {
  permission: MicPermission;
  hasMic: boolean;
  headphoneLabel: string | null;
  signature: string;
  /** Lựa chọn tay trong phiên hiện tại (null = chưa chọn). */
  manualMode: ListeningMode | null;
}

const INITIAL_STATE: ListeningState = {
  permission: "pending",
  hasMic: true,
  headphoneLabel: null,
  signature: "",
  manualMode: null,
};

export function useListeningSetup(isEnabled: boolean) {
  const [state, setState] = useState<ListeningState>(INITIAL_STATE);
  const isMountedRef = useRef(true);

  // Xóa storage cũ để mỗi lần vào trang đều dò mới và cảnh báo ngay nếu không có tai nghe
  useEffect(() => {
    clearStoredChoice();
  }, []);

  const evaluateDevices = useCallback(async () => {
    const snapshot = await readDevices();
    if (!isMountedRef.current) return;
    setState((previous) => ({
      ...previous,
      hasMic: snapshot.hasMic,
      headphoneLabel: snapshot.headphoneLabel,
      signature: snapshot.signature,
      // Nếu có tai nghe thì tự gán headphones; nếu không có thì giữ lựa chọn trong phiên hiện tại
      manualMode: snapshot.headphoneLabel ? "headphones" : previous.manualMode,
    }));
  }, []);

  /** Xin quyền micro rồi dừng ngay luồng (chỉ cần quyền + tên thiết bị). */
  const requestAccess = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      if (!isMountedRef.current) return;
      setState((previous) => ({ ...previous, permission: "granted", hasMic: true }));
      await evaluateDevices();
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      const errorName = err instanceof Error ? err.name : "";
      const isNotFound = errorName === "NotFoundError" || errorName === "DevicesNotFoundError";
      setState((previous) => ({
        ...previous,
        permission: "denied",
        hasMic: !isNotFound,
      }));
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
        setState((previous) => ({ ...previous, permission: "granted", hasMic: true }));
        return evaluateDevices();
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          const errorName = err instanceof Error ? err.name : "";
          const isNotFound = errorName === "NotFoundError" || errorName === "DevicesNotFoundError";
          setState((previous) => ({
            ...previous,
            permission: "denied",
            hasMic: !isNotFound,
          }));
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
    setState((previous) => ({ ...previous, manualMode: mode }));
  }, []);

  const mode: ListeningMode | null = state.headphoneLabel ? "headphones" : state.manualMode;

  return {
    permission: state.permission,
    hasMic: state.hasMic,
    mode,
    headphoneLabel: state.headphoneLabel,
    /** Có quyền, có mic nhưng không thấy tai nghe và chưa chọn cách nghe trong phiên này → LUÔN BÁO NGAY */
    needsChoice: state.permission === "granted" && state.hasMic && mode === null,
    choose,
    requestAccess,
  };
}
