import { MAX_WAV_SAMPLE_RATE } from "@/features/practice/constants/practiceConstants";

export function concatChunks(chunks: Float32Array[]): Float32Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Float32Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

// Nội suy tuyến tính; chỉ dùng khi thiết bị chạy > 48 kHz
export function resampleLinear(input: Float32Array, fromRate: number, toRate: number): Float32Array {
  const ratio = fromRate / toRate;
  const out = new Float32Array(Math.floor(input.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const pos = i * ratio;
    const left = Math.floor(pos);
    const right = Math.min(left + 1, input.length - 1);
    out[i] = input[left] + (input[right] - input[left]) * (pos - left);
  }
  return out;
}

export function encodeWavPcm16(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeText = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };
  writeText(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeText(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

// Micro tắt AGC nên PCM thô thường rất nhỏ. Nâng đỉnh lên NORMALIZE_TARGET_PEAK, một hệ số cho cả bản
// (giữ nguyên động học). Chặn bằng NORMALIZE_MAX_GAIN và bỏ qua bản gần như im lặng để không khuếch đại nhiễu.
const NORMALIZE_TARGET_PEAK = 0.9;
const NORMALIZE_MAX_GAIN = 16;
const NORMALIZE_MIN_PEAK = 0.005;

export function normalizePeak(samples: Float32Array): Float32Array {
  let peak = 0;
  for (let i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]));
  if (peak < NORMALIZE_MIN_PEAK || peak >= NORMALIZE_TARGET_PEAK) return samples;
  const gain = Math.min(NORMALIZE_MAX_GAIN, NORMALIZE_TARGET_PEAK / peak);
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) out[i] = samples[i] * gain;
  return out;
}

export function encodeRecording(samples: Float32Array, sampleRate: number): Blob {
  const normalized = normalizePeak(samples);
  if (sampleRate <= MAX_WAV_SAMPLE_RATE) return encodeWavPcm16(normalized, sampleRate);
  return encodeWavPcm16(resampleLinear(normalized, sampleRate, MAX_WAV_SAMPLE_RATE), MAX_WAV_SAMPLE_RATE);
}

// Đỉnh biên độ theo từng đoạn, chuẩn hoá 0..1 cho Waveform
export function computePeaks(samples: Float32Array, bars: number): number[] {
  const size = Math.max(1, Math.floor(samples.length / bars));
  const peaks: number[] = [];
  for (let b = 0; b < bars; b++) {
    let peak = 0;
    const end = Math.min(samples.length, (b + 1) * size);
    for (let i = b * size; i < end; i++) peak = Math.max(peak, Math.abs(samples[i]));
    peaks.push(peak);
  }
  const max = Math.max(1e-4, ...peaks);
  return peaks.map((peak) => peak / max);
}
