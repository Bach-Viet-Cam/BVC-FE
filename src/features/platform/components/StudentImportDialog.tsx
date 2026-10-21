import { useState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { StatCard } from "@/shared/components/bvc";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogDescription, DialogPopup, DialogTitle } from "@/shared/components/ui/dialog";
import {
  IMPORT_ACCEPT,
  IMPORT_ACTION_BADGE,
  IMPORT_ACTION_LABELS,
  IMPORT_MAX_ROWS,
} from "@/features/platform/constants/userImportConstants";
import { useStudentImport } from "@/features/platform/hooks/useStudentImport";
import { type StudentImportAction, type StudentImportMode } from "@/features/platform/types/userImportTypes";
import { downloadStudentTemplate } from "@/features/platform/utils/studentExcelTemplate";
import { cn } from "@/shared/utils/cn";

type RowFilter = "ALL" | StudentImportAction;

const MODE_OPTIONS: { value: StudentImportMode; label: string; hint: string }[] = [
  { value: "skip", label: "Bỏ qua tài khoản đã tồn tại", hint: "Giữ nguyên dữ liệu hiện có (mặc định)." },
  {
    value: "update",
    label: "Cập nhật họ tên và mã SV nếu email đã có",
    hint: "Không đổi email, vai trò hay trạng thái.",
  },
];

const FILTERS: { value: RowFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "CREATE", label: "Tạo mới" },
  { value: "UPDATE", label: "Cập nhật" },
  { value: "SKIP", label: "Bỏ qua" },
  { value: "ERROR", label: "Lỗi" },
];

interface StudentImportContentProps {
  onClose: () => void;
  onImported: () => void;
}

function StudentImportContent({ onClose, onImported }: StudentImportContentProps) {
  const importer = useStudentImport(onImported);
  const { phase, fileName, mode, analysis, isBusy, error } = importer;
  const [filter, setFilter] = useState<RowFilter>("ALL");
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (file) void importer.selectFile(file);
  };

  if (phase === "select") {
    return (
      <>
        <DialogTitle className="text-[17px] font-bold text-bvc-ink">Nhập sinh viên từ Excel</DialogTitle>
        <DialogDescription className="text-[13px] leading-relaxed text-bvc-muted">
          Tối đa {IMPORT_MAX_ROWS} dòng, file không quá 5 MB. Cần đủ 3 cột: Mã sinh viên, Họ và tên, Email.
        </DialogDescription>
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            if (!isBusy) handleFile(event.dataTransfer.files[0]);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] border-2 border-dashed p-10 text-center",
            isDragging ? "border-bvc-ink bg-bvc-surface" : "border-bvc-border-strong",
            isBusy && "pointer-events-none opacity-60"
          )}
        >
          <Upload size={28} className="text-bvc-muted" />
          <span className="text-[14px] font-semibold text-bvc-ink">
            {isBusy ? "Đang đọc và kiểm tra file..." : "Kéo thả file .xlsx vào đây hoặc bấm để chọn"}
          </span>
          <input
            type="file"
            accept={IMPORT_ACCEPT}
            disabled={isBusy}
            className="sr-only"
            onChange={(event) => {
              handleFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
        {error && (
          <p role="alert" className="text-[13px] text-bvc-accent-text">
            {error}
          </p>
        )}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={downloadStudentTemplate}
            className="flex cursor-pointer items-center gap-2 text-[13px] font-semibold text-bvc-ink underline-offset-2 hover:underline"
          >
            <FileSpreadsheet size={16} />
            Tải file mẫu (.xlsx)
          </button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy
          </Button>
        </div>
      </>
    );
  }

  if (!analysis) return null;
  const { summary } = analysis;
  const actionable = summary.create + summary.update;

  if (phase === "done") {
    return (
      <>
        <DialogTitle className="text-[17px] font-bold text-bvc-ink">Import hoàn tất</DialogTitle>
        <DialogDescription className="text-[13px] leading-relaxed text-bvc-muted">
          Đã tạo {analysis.createdCount} tài khoản, cập nhật {analysis.updatedCount}, bỏ qua {summary.skip}, lỗi{" "}
          {summary.error}. Tài khoản mới ở trạng thái “Chờ kích hoạt” và tự kích hoạt khi sinh viên đăng nhập Google lần
          đầu.
        </DialogDescription>
        <div className="flex justify-end">
          <Button type="button" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </>
    );
  }

  const visibleRows =
    filter === "ALL" ? analysis.results : analysis.results.filter((result) => result.action === filter);

  return (
    <>
      <DialogTitle className="text-[17px] font-bold text-bvc-ink">Xem trước: {fileName}</DialogTitle>
      <DialogDescription className="text-[13px] leading-relaxed text-bvc-muted">
        Kiểm tra kết quả bên dưới rồi xác nhận. Dòng lỗi sẽ được bỏ qua, các dòng còn lại vẫn được import.
      </DialogDescription>

      <div className="grid grid-cols-4 gap-[10px]">
        <StatCard label="Tổng số dòng" value={summary.total} />
        <StatCard label="Sẽ import" value={actionable} variant="ok" />
        <StatCard label="Bỏ qua" value={summary.skip} variant="surface" />
        <StatCard label="Lỗi" value={summary.error} variant="accent" />
      </div>

      <fieldset disabled={isBusy} className="flex flex-col gap-2">
        {MODE_OPTIONS.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-start gap-2 text-[13px] text-bvc-ink">
            <input
              type="radio"
              name="import-mode"
              checked={mode === option.value}
              onChange={() => void importer.changeMode(option.value)}
              className="mt-[3px]"
            />
            <span>
              <span className="font-semibold">{option.label}</span>
              <span className="ml-2 text-bvc-muted">{option.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={cn(
              "cursor-pointer rounded-[11px] px-3 py-1.5 text-[13px]",
              filter === item.value
                ? "bg-bvc-ink font-bold text-white"
                : "border border-bvc-border-strong text-bvc-muted"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="max-h-[300px] overflow-auto rounded-[14px] border border-bvc-border">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead className="sticky top-0 bg-bvc-surface text-[12px] uppercase tracking-[0.06em] text-bvc-muted">
            <tr>
              <th className="px-3 py-2">Dòng</th>
              <th className="px-3 py-2">Mã SV</th>
              <th className="px-3 py-2">Họ tên</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Kết quả</th>
              <th className="px-3 py-2">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center text-bvc-muted">
                  Không có dòng nào.
                </td>
              </tr>
            )}
            {visibleRows.map((result) => (
              <tr key={result.rowNumber} className="border-t border-bvc-line align-top">
                <td className="px-3 py-2 font-mono text-bvc-muted">{result.rowNumber}</td>
                <td className="px-3 py-2 font-mono">{result.studentCode}</td>
                <td className="px-3 py-2">{result.username}</td>
                <td className="px-3 py-2">{result.email}</td>
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      "rounded-[8px] px-2 py-0.5 text-[11px] font-semibold",
                      IMPORT_ACTION_BADGE[result.action]
                    )}
                  >
                    {IMPORT_ACTION_LABELS[result.action]}
                  </span>
                </td>
                <td className="px-3 py-2 text-bvc-muted">{result.messages.join(" ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <p role="alert" className="text-[13px] text-bvc-accent-text">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" disabled={isBusy} onClick={importer.reset}>
          Chọn file khác
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="button" isLoading={isBusy} disabled={actionable === 0} onClick={() => void importer.confirm()}>
            Xác nhận import {actionable} sinh viên
          </Button>
        </div>
      </div>
    </>
  );
}

interface StudentImportDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onImported: () => void;
}

export function StudentImportDialog({ isOpen, onOpenChange, onImported }: StudentImportDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-[920px] rounded-[18px] border-bvc-border p-6">
        {isOpen && <StudentImportContent onClose={() => onOpenChange(false)} onImported={onImported} />}
      </DialogPopup>
    </Dialog>
  );
}
