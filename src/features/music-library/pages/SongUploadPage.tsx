import { useState } from "react";
import { FileCode, FileText, Upload } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { MobileHeader } from "@/shared/components/bvc";

type UploadType = "pdf" | "musicxml";

export function SongUploadPage() {
  const [uploadType, setUploadType] = useState<UploadType>("musicxml");

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">
        <MobileHeader title="Tải lên bản nhạc" variant="close" />

        {/* Scrollable body */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Upload type selector */}
          <div className="mx-[14px] mt-4 flex gap-3">
            {/* PDF card */}
            <button
              type="button"
              onClick={() => setUploadType("pdf")}
              className={cn(
                "flex flex-1 cursor-pointer flex-col items-center gap-[8px] rounded-[20px] border p-[16px]",
                uploadType === "pdf"
                  ? "border-bvc-accent bg-bvc-accent-tint"
                  : "border-bvc-border bg-white"
              )}
            >
              <FileText
                size={32}
                strokeWidth={1.6}
                className={
                  uploadType === "pdf" ? "text-bvc-accent-text" : "text-bvc-muted"
                }
              />
              <span
                className={cn(
                  "text-[14px] font-bold",
                  uploadType === "pdf" ? "text-bvc-accent-text" : "text-bvc-ink"
                )}
              >
                Bản nhạc PDF
              </span>
              <span
                className={cn(
                  "text-center text-[13px]",
                  uploadType === "pdf" ? "text-bvc-accent-text" : "text-bvc-muted"
                )}
              >
                Tải lên file PDF
              </span>
            </button>

            {/* MusicXML card */}
            <button
              type="button"
              onClick={() => setUploadType("musicxml")}
              className={cn(
                "flex flex-1 cursor-pointer flex-col items-center gap-[8px] rounded-[20px] border p-[16px]",
                uploadType === "musicxml"
                  ? "border-bvc-accent bg-bvc-accent-tint"
                  : "border-bvc-border bg-white"
              )}
            >
              <FileCode
                size={32}
                strokeWidth={1.6}
                className={
                  uploadType === "musicxml" ? "text-bvc-accent-text" : "text-bvc-muted"
                }
              />
              <span
                className={cn(
                  "text-[14px] font-bold",
                  uploadType === "musicxml" ? "text-bvc-accent-text" : "text-bvc-ink"
                )}
              >
                Bản nhạc MusicXML
              </span>
              <span
                className={cn(
                  "text-center text-[13px]",
                  uploadType === "musicxml" ? "text-bvc-accent-text" : "text-bvc-muted"
                )}
              >
                Tải lên file .xml / .mxl
              </span>
            </button>
          </div>

          {/* Upload drop zone */}
          <div className="mx-[14px] mt-3 flex flex-col items-center gap-[8px] rounded-[20px] border-2 border-dashed border-bvc-border-strong p-[20px]">
            <Upload size={40} strokeWidth={1.6} className="text-bvc-muted" />
            <span className="text-[15px] font-bold text-bvc-ink">
              Chọn file để tải lên
            </span>
            <span className="text-center text-[13px] text-bvc-faint">
              {uploadType === "pdf"
                ? ".pdf · Tối đa 10 MB"
                : ".xml · .mxl · .musicxml · Tối đa 10 MB"}
            </span>
            <button
              type="button"
              className="mt-1 h-[40px] cursor-pointer rounded-[14px] border border-bvc-border-strong px-4 text-[14px] font-semibold text-bvc-ink"
            >
              Chọn file
            </button>
          </div>

          {/* Song metadata card */}
          <div className="mx-[14px] mt-3 flex flex-col gap-[10px] rounded-[20px] border border-bvc-border p-[14px]">
            <span className="text-[14px] font-bold text-bvc-ink">
              Thông tin bản nhạc
            </span>

            {/* Bài nhạc select */}
            <div className="relative">
              <select
                className="h-[44px] w-full appearance-none rounded-[13px] border border-bvc-border bg-white px-3 text-[14px] text-bvc-ink focus:outline-none"
                defaultValue=""
              >
                <option value="" disabled>
                  Chọn bài nhạc...
                </option>
                <option value="ly-ngua-o">Lý ngựa ô</option>
                <option value="trong-com">Trống cơm</option>
                <option value="bac-kim-thang">Bắc kim thang</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-bvc-faint">
                ▾
              </span>
            </div>

            {/* Nhạc cụ select */}
            <div className="relative">
              <select
                className="h-[44px] w-full appearance-none rounded-[13px] border border-bvc-border bg-white px-3 text-[14px] text-bvc-ink focus:outline-none"
                defaultValue=""
              >
                <option value="" disabled>
                  Chọn nhạc cụ...
                </option>
                <option value="dan-tranh">Đàn tranh</option>
                <option value="dan-bau">Đàn bầu</option>
                <option value="dan-nhi">Đàn nhị</option>
                <option value="dan-ty-ba">Đàn tỳ bà</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-bvc-faint">
                ▾
              </span>
            </div>

            {/* Description textarea */}
            <textarea
              rows={2}
              placeholder="Ghi chú về bản nhạc này..."
              className="w-full resize-none rounded-[13px] border border-bvc-border bg-white px-3 py-[10px] text-[14px] text-bvc-ink placeholder:text-bvc-faint focus:outline-none"
            />
          </div>

          {/* Bottom spacer for fixed bottom bar */}
          <div className="h-[110px]" />
        </div>

        {/* Bottom actions */}
        <div className="shrink-0 mx-[14px] pb-5 pt-3">
          <button
            type="button"
            className="h-[54px] w-full cursor-pointer rounded-[16px] bg-bvc-ink text-[16px] font-bold text-white"
          >
            Tải lên
          </button>
          <p className="mt-2 cursor-pointer text-center text-[13px] text-bvc-accent-text">
            Tải lên và gửi duyệt
          </p>
        </div>
      </div>
    </div>
  );
}
