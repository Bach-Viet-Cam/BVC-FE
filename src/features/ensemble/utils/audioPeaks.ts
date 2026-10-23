/** Chia tín hiệu thành `buckets` nhóm, lấy |biên độ| lớn nhất mỗi nhóm rồi chuẩn hóa về 0..1. */
export function computePeaks(samples: ArrayLike<number>, buckets: number): number[] {
  if (buckets <= 0 || samples.length === 0) return [];
  const size = Math.max(1, Math.floor(samples.length / buckets));
  const peaks: number[] = [];
  let loudest = 0;
  for (let bucket = 0; bucket < buckets; bucket += 1) {
    const start = bucket * size;
    const end = Math.min(samples.length, start + size);
    let peak = 0;
    for (let index = start; index < end; index += 1) {
      const magnitude = Math.abs(samples[index]);
      if (magnitude > peak) peak = magnitude;
    }
    peaks.push(peak);
    if (peak > loudest) loudest = peak;
  }
  if (loudest === 0) return peaks.map(() => 0);
  return peaks.map((peak) => Math.round((peak / loudest) * 1000) / 1000);
}
