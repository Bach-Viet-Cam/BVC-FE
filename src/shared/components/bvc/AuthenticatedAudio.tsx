import { useEffect, useRef, useState } from "react";
import { axiosClient } from "@/shared/api/axiosClient";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

// Fetch with bearer auth; release the object URL when leaving/changing recordings.
export function AuthenticatedAudio({ endpoint, label = "Nghe bản thu" }: { endpoint: string; label?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const request = useRef<AbortController | null>(null);
  const objectUrl = useRef<string | null>(null);
  useEffect(
    () => () => {
      request.current?.abort();
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    },
    []
  );
  async function load() {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    request.current = controller;
    try {
      const result = await axiosClient.get<Blob>(endpoint, {
        responseType: "blob",
        timeout: 60000,
        signal: controller.signal,
      });
      if (!controller.signal.aborted) {
        objectUrl.current = URL.createObjectURL(result.data);
        setUrl(objectUrl.current);
      }
    } catch (error: unknown) {
      if (!controller.signal.aborted) setError(getErrorMessage(error, "Không thể mở bản thu. Vui lòng thử lại."));
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }
  return (
    <div className="flex min-w-0 flex-col gap-2">
      {url ? (
        <audio
          aria-label={label}
          controls
          preload="none"
          src={url}
          onPlay={(event) => {
            document.querySelectorAll("audio").forEach((audio) => {
              if (audio !== event.currentTarget) audio.pause();
            });
          }}
          className="w-full"
        >
          Trình duyệt không hỗ trợ phát audio.
        </audio>
      ) : (
        <button
          type="button"
          disabled={loading}
          onClick={() => void load()}
          className="min-h-11 self-start rounded-[14px] border border-bvc-border-strong bg-white px-4 text-sm font-semibold text-bvc-ink disabled:opacity-50"
        >
          {loading ? "Đang tải bản thu..." : label}
        </button>
      )}
      {error && (
        <p role="alert" className="text-sm text-bvc-accent-text">
          {error}
        </p>
      )}
    </div>
  );
}
