export function readMediaDuration(file: File): Promise<number | undefined> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const media = document.createElement(file.type.startsWith("video") ? "video" : "audio");
    const done = (value: number | undefined) => {
      URL.revokeObjectURL(url);
      resolve(value);
    };
    media.preload = "metadata";
    media.onloadedmetadata = () => done(Number.isFinite(media.duration) ? Math.round(media.duration) : undefined);
    media.onerror = () => done(undefined);
    media.src = url;
  });
}

export async function readPageCount(file: File): Promise<number> {
  if (file.type !== "application/pdf") return 1;
  try {
    const text = await file.text();
    const matches = text.match(/\/Type\s*\/Page[^s]/g);
    return matches && matches.length > 0 ? matches.length : 1;
  } catch {
    return 1;
  }
}

export function formatDuration(totalSec?: number) {
  if (totalSec === undefined) return "—";
  const minutes = Math.floor(totalSec / 60);
  const seconds = Math.floor(totalSec % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatFileSize(bytes?: number) {
  if (bytes === undefined) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

export function validateFile(
  file: File,
  rule: { mimeTypes: readonly string[]; accept: string; maxBytes: number }
): string | null {
  const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  const allowedExtensions = rule.accept.split(",");
  if (!rule.mimeTypes.includes(file.type) && !allowedExtensions.includes(extension)) {
    return `Định dạng không hỗ trợ. Chấp nhận: ${allowedExtensions.join(", ")}`;
  }
  if (file.size > rule.maxBytes) {
    return `File vượt quá ${formatFileSize(rule.maxBytes)}`;
  }
  return null;
}
