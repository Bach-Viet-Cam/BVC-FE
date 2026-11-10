interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface PwaInstallState {
  canPrompt: boolean;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let state: PwaInstallState = { canPrompt: false };
const listeners = new Set<() => void>();

function setState(next: Partial<PwaInstallState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function isInstallPromptEvent(event: Event): event is BeforeInstallPromptEvent {
  return "prompt" in event && typeof event.prompt === "function";
}

// Chrome/Edge bắn beforeinstallprompt rất sớm nên phải bắt từ lúc khởi động, trước khi trang nào được render
export function listenForPwaInstall() {
  window.addEventListener("beforeinstallprompt", (event) => {
    if (!isInstallPromptEvent(event)) return;
    event.preventDefault();
    deferredPrompt = event;
    setState({ canPrompt: true });
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    setState({ canPrompt: false });
  });
}

export function subscribePwaInstall(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPwaInstallState() {
  return state;
}

export async function promptPwaInstall() {
  const prompt = deferredPrompt;
  if (!prompt) return;
  deferredPrompt = null;
  setState({ canPrompt: false });
  await prompt.prompt();
  await prompt.userChoice;
}
