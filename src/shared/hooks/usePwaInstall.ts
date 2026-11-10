import { useSyncExternalStore } from "react";
import { getPwaInstallState, promptPwaInstall, subscribePwaInstall } from "@/shared/utils/pwaInstall";

export function usePwaInstall() {
  const state = useSyncExternalStore(subscribePwaInstall, getPwaInstallState);
  return { ...state, promptInstall: promptPwaInstall };
}
