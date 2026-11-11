import { registerSW } from "virtual:pwa-register";

const UPDATE_CHECK_INTERVAL_MS = 10 * 60 * 1000;
const RELOAD_RETRY_INTERVAL_MS = 3000;

// Các trang đang giữ dữ liệu chưa lưu (bản thu): reload lúc này sẽ làm mất bản thu
const BUSY_PATHS = [/^\/ensemble\/new/, /^\/practice\/sheets\/[^/]+\/record/];

function isBusy() {
  return BUSY_PATHS.some((pattern) => pattern.test(window.location.pathname));
}

// Service worker mới đã được kích hoạt: tải lại trang để chạy code mới. Nếu đang bận thì chờ đến khi người dùng rời trang đó.
function reloadWhenIdle() {
  if (!isBusy()) {
    window.location.reload();
    return;
  }
  const timer = window.setInterval(() => {
    if (isBusy()) return;
    window.clearInterval(timer);
    window.location.reload();
  }, RELOAD_RETRY_INTERVAL_MS);
}

// Chủ động hỏi server có bản mới không: nếu chỉ chờ trình duyệt tự kiểm tra thì người mở app nhiều giờ liền sẽ không bao giờ nhận được bản mới
function watchForUpdates(registration: ServiceWorkerRegistration) {
  const check = () => {
    if (navigator.onLine) void registration.update().catch(() => undefined);
  };
  window.setInterval(check, UPDATE_CHECK_INTERVAL_MS);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") check();
  });
}

export function registerAppUpdate() {
  registerSW({
    immediate: true,
    onNeedReload: reloadWhenIdle,
    onRegisteredSW: (_url, registration) => {
      if (registration) watchForUpdates(registration);
    },
  });
}
