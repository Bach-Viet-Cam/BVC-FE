import { type EnsembleTrack } from "@/features/ensemble/types/ensembleTypes";
import { computePeaks } from "@/features/ensemble/utils/audioPeaks";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { getAssetUrl } from "@/shared/utils/getAssetUrl";

/** Mật độ cột waveform: khớp thang 14 px/giây của timeline (cột ~2.8px). */
export const PEAKS_PER_SECOND = 5;
const EMPTY_PEAKS: ReadonlyMap<string, number[]> = new Map();

async function loadPeaks(track: EnsembleTrack): Promise<readonly [string, number[]]> {
  try {
    const response = await fetch(getAssetUrl(track.fileUrl));
    const decoded = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(await response.arrayBuffer());
    return [
      track.id,
      computePeaks(decoded.getChannelData(0), Math.max(1, Math.round(decoded.duration * PEAKS_PER_SECOND))),
    ];
  } catch {
    return [track.id, []]; // D3: tải lỗi → làn hiện vạch phẳng
  }
}

export function useTrackPeaks(tracks: EnsembleTrack[]): ReadonlyMap<string, number[]> {
  const { data } = useAsyncData<ReadonlyMap<string, number[]>>(
    async () => new Map(await Promise.all(tracks.map(loadPeaks))),
    tracks.map((track) => track.id).join("|"),
    "Không thể tải dạng sóng."
  );
  return data ?? EMPTY_PEAKS;
}
