import { useEffect, useRef, useState } from "react";
import { Upload, LoaderCircle, CheckCircle2 } from "lucide-react";
import { audioAnalysisApi } from "../api/audioAnalysisApi";
import type { AudioUploadResult } from "../types/audioAnalysisTypes";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

interface Props {
  title: string;
  description: string;
  disabled: boolean;
  onChange: (value: AudioUploadResult | null) => void;
}

export function AudioUploadSlot({ title, description, disabled, onChange }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState<AudioUploadResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const active = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      active.current?.abort();
    },
    []
  );

  const upload = async (selected: File) => {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setFile(selected);
    setUploaded(null);
    onChange(null);
    setError("");
    setProgress(0);
    if (selected.size === 0 || selected.size > 25 * 1024 * 1024 || !/\.(wav|mp3)$/i.test(selected.name)) {
      setUploading(false);
      setError("Vui lòng chọn file WAV hoặc MP3 có dữ liệu, tối đa 25 MiB.");
      return;
    }
    setUploading(true);
    try {
      const response = await audioAnalysisApi.upload(selected, controller.signal, (percent) => {
        if (active.current === controller && !controller.signal.aborted) setProgress(percent);
      });
      if (active.current !== controller || controller.signal.aborted) return;
      setUploaded(response.data.data);
      onChange(response.data.data);
    } catch (reason) {
      if (active.current === controller && !controller.signal.aborted)
        setError(getApiErrorMessage(reason, "Không thể tải file lên. Vui lòng thử lại."));
    } finally {
      if (active.current === controller && !controller.signal.aborted) setUploading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-bvc-border bg-white p-6">
      <h2 className="text-lg font-semibold text-bvc-ink">{title}</h2>
      <p className="mt-1 text-sm text-bvc-muted">{description}</p>
      <label
        className={`mt-5 flex min-h-36 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-bvc-border p-5 text-center ${disabled ? "opacity-50" : "cursor-pointer hover:bg-bvc-surface"}`}
      >
        <Upload className="text-bvc-accent" size={26} aria-hidden="true" />
        <span className="text-sm font-medium">{file ? "Chọn file khác" : "Chọn file audio"}</span>
        <span className="text-xs text-bvc-muted">WAV, MP3 · tối đa 25 MiB</span>
        <input
          type="file"
          accept=".wav,.mp3,audio/wav,audio/mpeg"
          aria-label={title}
          disabled={disabled}
          className="sr-only"
          onChange={(event) => {
            const selected = event.target.files?.[0];
            event.target.value = "";
            if (selected) void upload(selected);
          }}
        />
      </label>
      {file && (
        <p className="mt-4 break-all text-sm">
          {file.name} <span className="text-bvc-muted">({(file.size / 1024 / 1024).toFixed(2)} MiB)</span>
        </p>
      )}
      <div aria-live="polite" className="mt-3 text-sm">
        {uploading && (
          <>
            <p className="flex items-center gap-2">
              <LoaderCircle size={16} className="animate-spin" />
              {progress < 100 ? `Đang tải lên ${progress}%` : "Đang lưu file…"}
            </p>
            <progress className="mt-2 w-full accent-orange-600" max={100} value={progress} />
          </>
        )}
        {uploaded && (
          <p className="flex items-center gap-2 text-green-700">
            <CheckCircle2 size={16} />
            Đã lưu file
          </p>
        )}
        {error && (
          <>
            <p role="alert" className="text-red-700">
              {error}
            </p>
            <button
              type="button"
              disabled={disabled || uploading}
              className="mt-2 underline"
              onClick={() => {
                if (file) void upload(file);
              }}
            >
              Thử tải lại
            </button>
          </>
        )}
      </div>
      {uploaded && (
        <audio
          controls
          preload="metadata"
          src={uploaded.url}
          className="mt-4 w-full"
          aria-label={`Nghe thử ${title.toLowerCase()}`}
        />
      )}
    </section>
  );
}
