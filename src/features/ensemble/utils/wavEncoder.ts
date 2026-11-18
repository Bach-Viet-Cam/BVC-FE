function encodeSamples(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeText = (offset: number, text: string) => {
    for (let index = 0; index < text.length; index += 1) view.setUint8(offset + index, text.charCodeAt(index));
  };
  writeText(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeText(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, samples.length * 2, true);
  samples.forEach((sample, index) => {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + index * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  });
  return new Blob([buffer], { type: "audio/wav" });
}

async function decodeFirstChannel(recording: Blob): Promise<{ samples: Float32Array; sampleRate: number }> {
  const audioContext = new AudioContext();
  try {
    const decoded = await audioContext.decodeAudioData(await recording.arrayBuffer());
    return { samples: decoded.getChannelData(0), sampleRate: decoded.sampleRate };
  } finally {
    await audioContext.close();
  }
}

export async function encodeWav(recording: Blob): Promise<Blob> {
  const { samples, sampleRate } = await decodeFirstChannel(recording);
  return encodeSamples(samples, sampleRate);
}

/** Bỏ `trimSec` giây đầu của WAV (bù độ trễ thu để bản thu thẳng hàng với bè mẫu). */
export async function trimWav(wav: Blob, trimSec: number): Promise<Blob> {
  if (trimSec <= 0) return wav;
  const { samples, sampleRate } = await decodeFirstChannel(wav);
  const skip = Math.min(samples.length - 1, Math.round(trimSec * sampleRate));
  return encodeSamples(samples.subarray(Math.max(0, skip)), sampleRate);
}
