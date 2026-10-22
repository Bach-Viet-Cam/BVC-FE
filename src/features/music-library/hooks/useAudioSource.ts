import { useEffect, useState } from "react";
import { computePeaks } from "@/features/music-library/utils/waveformUtils";

export const WAVEFORM_BUCKETS = 160;

// URL ký sẵn đổi theo thời gian nên cache theo khoá ổn định của bản thu; chỉ sống trong phiên trang
const peaksCache = new Map<string, number[]>();

interface AudioSourceState {
  url: string;
  // Phát từ bản đã tải (objectUrl); tải lỗi thì phát thẳng từ url gốc
  playableUrl: string;
  peaks: number[] | null;
}

// Tải bản thu đúng 1 lần, dùng chung cho trình phát và hình sóng (không lưu gì lên server)
export function useAudioSource(url: string | undefined, cacheKey: string) {
  const [state, setState] = useState<AudioSourceState | null>(null);

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    let objectUrl: string | null = null;

    (async () => {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const audioData = await response.arrayBuffer();
        // Blob sao chép dữ liệu, còn decodeAudioData sẽ chiếm luôn buffer nên phải tạo Blob trước
        objectUrl = URL.createObjectURL(new Blob([audioData], { type: response.headers.get("Content-Type") ?? "" }));
        const peaks = peaksCache.get(cacheKey) ?? (await computePeaks(audioData, WAVEFORM_BUCKETS).catch(() => null));
        if (peaks) peaksCache.set(cacheKey, peaks);
        if (!controller.signal.aborted) setState({ url, playableUrl: objectUrl, peaks });
      } catch {
        if (!controller.signal.aborted) setState({ url, playableUrl: url, peaks: null });
      }
    })();

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url, cacheKey]);

  const current = state?.url === url ? state : null;
  return {
    playableUrl: current?.playableUrl,
    // Đã có hình sóng từ lần mở trước thì vẽ ngay, không đợi tải lại file
    peaks: current?.peaks ?? (url ? (peaksCache.get(cacheKey) ?? null) : null),
    isLoading: Boolean(url) && current === null,
  };
}
