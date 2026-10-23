import {
  SLOW_UPLOAD_BYTES_PER_S,
  SLOW_UPLOAD_GRACE_MS,
  WEAK_DOWNLINK_MBPS,
  WEAK_EFFECTIVE_TYPES,
} from "@/features/practice/constants/practiceConstants";

interface NetworkInformationLike {
  effectiveType?: string;
  downlink?: number;
}

// Network Information API chưa có trên mọi trình duyệt (Safari, Firefox) nên chỉ là một tín hiệu
export function isWeakConnection(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  if (!connection) return false;
  if (WEAK_EFFECTIVE_TYPES.includes(connection.effectiveType ?? "")) return true;
  return connection.downlink !== undefined && connection.downlink > 0 && connection.downlink < WEAK_DOWNLINK_MBPS;
}

// Tốc độ tải lên đo thực tế: chậm hơn ngưỡng sau vài giây đầu thì coi là mạng yếu (MSG-17)
export function isSlowUpload(totalBytes: number, percent: number, elapsedMs: number): boolean {
  if (elapsedMs < SLOW_UPLOAD_GRACE_MS || percent >= 100) return false;
  const sentBytes = (totalBytes * percent) / 100;
  return sentBytes / (elapsedMs / 1000) < SLOW_UPLOAD_BYTES_PER_S;
}
