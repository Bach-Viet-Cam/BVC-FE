import type { RecordingFile } from "@/features/practice/types/practiceTypes";

// Thời lượng đọc từ metadata; file trình duyệt không giải mã được trả 0 và bị chặn ở bước kiểm tra (MSG-15)
function readDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    const finish = (seconds: number) => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(seconds) ? seconds : 0);
    };
    audio.preload = "metadata";
    audio.onloadedmetadata = () => finish(audio.duration);
    audio.onerror = () => finish(0);
    audio.src = url;
  });
}

export async function readAudioFile(file: File): Promise<RecordingFile> {
  return {
    name: file.name,
    fmt: file.name.split(".").pop()?.toLowerCase() ?? "",
    mb: file.size / (1024 * 1024),
    dur: await readDuration(file),
    source: "upload",
  };
}
