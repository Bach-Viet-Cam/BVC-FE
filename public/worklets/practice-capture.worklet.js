// AudioWorklet của màn ghi âm: (1) gom PCM cho bản ghi theo đúng chỉ số mẫu,
// (2) gửi cửa sổ phân tích cho tuner/tempo sau mỗi hop.
// JS thuần trong public/ để Vite phục vụ nguyên trạng, không qua bundler.
const CHUNK_SIZE = 16384;

class PracticeCaptureProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const { windowSize, hopSize } = options.processorOptions;
    this.windowSize = windowSize;
    this.hopSize = hopSize;
    this.ring = new Float32Array(windowSize);
    this.ringPos = 0;
    this.ringFilled = 0;
    this.sinceHop = 0;
    this.hopSumSq = 0;
    this.analysisOn = false;
    this.capturing = false;
    this.startFrame = 0;
    this.stopFrame = 0;
    this.chunk = new Float32Array(CHUNK_SIZE);
    this.chunkPos = 0;
    this.port.onmessage = (event) => this.onCommand(event.data);
  }

  onCommand(command) {
    if (command.type === "analysis") {
      this.analysisOn = command.on;
      this.ringFilled = 0;
      this.sinceHop = 0;
      this.hopSumSq = 0;
    } else if (command.type === "startCapture") {
      this.capturing = true;
      this.startFrame = command.startFrame;
      this.stopFrame = command.stopFrame;
      this.chunkPos = 0;
    } else if (command.type === "stopCapture") {
      if (this.capturing) this.finishCapture("manual");
    } else if (command.type === "cancelCapture") {
      this.capturing = false;
      this.chunkPos = 0;
    }
  }

  flushChunk() {
    if (this.chunkPos === 0) return;
    const samples = this.chunk.slice(0, this.chunkPos);
    this.port.postMessage({ type: "pcm", samples }, [samples.buffer]);
    this.chunkPos = 0;
  }

  finishCapture(reason) {
    this.flushChunk();
    this.capturing = false;
    this.port.postMessage({ type: "captureEnded", reason });
  }

  postWindow(endFrame) {
    const samples = new Float32Array(this.windowSize);
    samples.set(this.ring.subarray(this.ringPos), 0);
    samples.set(this.ring.subarray(0, this.ringPos), this.windowSize - this.ringPos);
    const hopRms = Math.sqrt(this.hopSumSq / this.hopSize);
    this.port.postMessage({ type: "frame", samples, endTime: endFrame / sampleRate, hopRms }, [samples.buffer]);
  }

  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (!channel) return true;
    const blockStart = currentFrame;
    const blockEnd = blockStart + channel.length;

    if (this.capturing) {
      const from = Math.max(0, this.startFrame - blockStart);
      const to = Math.min(channel.length, this.stopFrame - blockStart);
      for (let i = from; i < to; i++) {
        this.chunk[this.chunkPos++] = channel[i];
        if (this.chunkPos === CHUNK_SIZE) this.flushChunk();
      }
      if (blockEnd >= this.stopFrame) this.finishCapture("pieceEnd");
    }

    if (this.analysisOn) {
      for (let i = 0; i < channel.length; i++) {
        const sample = channel[i];
        this.ring[this.ringPos] = sample;
        this.ringPos = (this.ringPos + 1) % this.windowSize;
        if (this.ringFilled < this.windowSize) this.ringFilled++;
        this.hopSumSq += sample * sample;
        this.sinceHop++;
        if (this.sinceHop === this.hopSize) {
          if (this.ringFilled === this.windowSize) this.postWindow(blockStart + i + 1);
          this.sinceHop = 0;
          this.hopSumSq = 0;
        }
      }
    }
    return true;
  }
}

registerProcessor("practice-capture", PracticeCaptureProcessor);
