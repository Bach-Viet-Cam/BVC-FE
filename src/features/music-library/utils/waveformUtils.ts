// Giải mã ở tần số thấp để giảm bộ nhớ (~10 lần so với 44,1 kHz); đủ để vẽ hình sóng, không dùng để phát
const DECODE_SAMPLE_RATE = 8000;

// Đỉnh biên độ (0–1) của từng đoạn bằng nhau trong bản thu, chuẩn hoá theo đỉnh lớn nhất
export async function computePeaks(audioData: ArrayBuffer, bucketCount: number): Promise<number[]> {
  const context = new OfflineAudioContext(1, 1, DECODE_SAMPLE_RATE);
  const decoded = await context.decodeAudioData(audioData);
  const channels = Array.from({ length: decoded.numberOfChannels }, (_, index) => decoded.getChannelData(index));
  const bucketSize = Math.max(1, Math.floor(decoded.length / bucketCount));

  const peaks = Array.from({ length: bucketCount }, (_, bucket) => {
    const start = bucket * bucketSize;
    const end = Math.min(decoded.length, start + bucketSize);
    let peak = 0;
    for (const samples of channels) {
      for (let index = start; index < end; index += 1) {
        const amplitude = Math.abs(samples[index]);
        if (amplitude > peak) peak = amplitude;
      }
    }
    return peak;
  });

  const loudest = Math.max(...peaks);
  return loudest > 0 ? peaks.map((peak) => peak / loudest) : peaks;
}
