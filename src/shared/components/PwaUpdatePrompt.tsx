import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw } from "lucide-react";
import { ActionButton } from "@/shared/components/bvc/ActionButton";

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

// Có bản mới của ứng dụng: để người dùng tự bấm cập nhật, tránh tải lại giữa lúc đang luyện tập
export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      setInterval(() => void registration.update(), UPDATE_CHECK_INTERVAL_MS);
    },
  });

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-[max(env(safe-area-inset-bottom),16px)] z-[110] mx-auto flex max-w-[420px] flex-col gap-3 rounded-[18px] border border-bvc-border bg-white p-4 font-bvc-sans text-bvc-ink shadow-lg sm:flex-row sm:items-center"
    >
      <span className="flex flex-1 items-start gap-2.5 text-sm">
        <RefreshCw className="mt-0.5 size-4 shrink-0 text-bvc-accent" aria-hidden />
        Đã có phiên bản mới của Bách Việt Cầm.
      </span>
      <span className="flex gap-2">
        <ActionButton variant="secondary" size="sm" onClick={() => setNeedRefresh(false)}>
          Để sau
        </ActionButton>
        <ActionButton size="sm" onClick={() => void updateServiceWorker(true)}>
          Cập nhật
        </ActionButton>
      </span>
    </div>
  );
}
