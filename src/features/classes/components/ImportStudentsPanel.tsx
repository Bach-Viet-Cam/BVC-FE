import { useRef } from "react";
import { ActionButton } from "@/features/classes/components/ActionButton";
import { FooterActions } from "@/features/classes/components/FooterActions";
import { ImportRowCard } from "@/features/classes/components/ImportRowCard";
import { type ImportPhase, NO_VALID_ROW_MESSAGE } from "@/features/classes/hooks/useImportStudents";
import { type ImportPreview } from "@/features/classes/types/classTypes";
import { cn } from "@/shared/utils/cn";

const REQUIRED_COLUMNS_TEXT = "cột Mã sinh viên, Họ tên, Email";

interface ImportStudentsPanelProps {
  phase: ImportPhase;
  fileName: string | null;
  fileError: string | null;
  preview: ImportPreview | null;
  onSelectFile: (file: File) => void;
  onDownloadTemplate: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}

interface StepProps {
  label: string;
  isReached: boolean;
  isCurrent: boolean;
}

function Step({ label, isReached, isCurrent }: StepProps) {
  return (
    <span className="flex flex-1 flex-col gap-[7px]" aria-current={isCurrent ? "step" : undefined}>
      <span className={cn("h-[4px] rounded-[2px]", isReached ? "bg-bvc-ink" : "bg-bvc-bar")} />
      <span className={cn("text-[12.5px]", isCurrent ? "font-bold text-bvc-ink" : "text-bvc-muted")}>{label}</span>
    </span>
  );
}

export function ImportStudentsPanel(props: ImportStudentsPanelProps) {
  const { phase, fileName, fileError, preview, onSelectFile, onDownloadTemplate, onCancel, onConfirm } = props;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasPreview = preview !== null && (phase === "preview" || phase === "confirming");
  const validRows = hasPreview ? preview.validRows : 0;
  const canConfirm = hasPreview && validRows > 0 && phase === "preview";

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onSelectFile(file);
  };

  return (
    <>
      <div className="flex grow flex-col gap-[14px] px-[18px] pb-[16px] pt-[4px] lg:px-[32px] lg:pb-[24px] lg:pt-[22px]">
        <div className="flex gap-[10px] lg:max-w-[720px]">
          <Step label="1 · Tải file mẫu & tải lên" isReached isCurrent={!hasPreview} />
          <Step label="2 · Kiểm tra & xác nhận" isReached={hasPreview} isCurrent={hasPreview} />
        </div>

        <div className="flex flex-col gap-[10px] rounded-[16px] border border-bvc-border px-[14px] py-[12px] lg:max-w-[720px] lg:p-[18px]">
          <span className="flex flex-col gap-[2px]">
            <span className="break-all text-[14px] font-semibold">{fileName ?? "Chưa chọn file"}</span>
            <span className="text-[12px] text-bvc-muted">
              {hasPreview
                ? `${preview.totalRows} dòng · ${REQUIRED_COLUMNS_TEXT}`
                : `File cần có ${REQUIRED_COLUMNS_TEXT}`}
            </span>
          </span>
          <div className="flex flex-wrap gap-[8px]">
            <ActionButton onClick={onDownloadTemplate}>Tải file mẫu .xlsx</ActionButton>
            <ActionButton
              variant={fileName ? "outline" : "primary"}
              onClick={() => fileInputRef.current?.click()}
              disabled={phase === "uploading" || phase === "confirming"}
            >
              {fileName ? "Đổi file" : "Chọn file"}
            </ActionButton>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              onChange={handleFileChange}
              className="hidden"
              data-testid="import-file-input"
            />
          </div>
          {fileError && (
            <p role="alert" className="m-0 text-[12.5px] text-bvc-error">
              {fileError}
            </p>
          )}
        </div>

        {phase === "uploading" && (
          <div aria-busy="true" className="flex flex-col gap-[8px]">
            <span className="text-[12.5px] text-bvc-muted">Đang kiểm tra file…</span>
            <div className="h-[70px] animate-pulse rounded-[14px] bg-bvc-soft" />
          </div>
        )}

        {hasPreview && (
          <>
            <div className="grid grid-cols-2 gap-[8px] lg:max-w-[720px]">
              <div className="rounded-[14px] bg-bvc-soft p-[12px]">
                <div className="font-bvc-mono text-[27px] font-semibold">{preview.validRows}</div>
                <div className="text-[12.5px] text-bvc-muted">dòng hợp lệ</div>
              </div>
              <div className="rounded-[14px] bg-bvc-accent-tint p-[12px]">
                <div className="font-bvc-mono text-[27px] font-semibold text-bvc-accent-text">{preview.errorRows}</div>
                <div className="text-[12.5px] text-bvc-accent-text">dòng bị bỏ qua</div>
              </div>
            </div>
            {validRows === 0 && (
              <p role="alert" className="m-0 text-[12.5px] text-bvc-error">
                {NO_VALID_ROW_MESSAGE}
              </p>
            )}
            <div className="grid gap-[8px] lg:grid-cols-2 2xl:grid-cols-3">
              {preview.rows.map((row) => (
                <ImportRowCard key={row.rowNumber} row={row} />
              ))}
            </div>
          </>
        )}

        <span className="text-[12px] leading-[1.5] text-bvc-muted">
          .xlsx hoặc .csv, tối đa 2 MB và 200 dòng. SV chưa có tài khoản được tạo ở trạng thái Chờ kích hoạt.
        </span>
      </div>
      <FooterActions>
        <ActionButton size="lg" onClick={onCancel} disabled={phase === "confirming"}>
          Hủy
        </ActionButton>
        <ActionButton size="lg" variant="primary" onClick={onConfirm} disabled={!canConfirm}>
          {phase === "confirming" ? "Đang nhập…" : `Nhập ${validRows} SV`}
        </ActionButton>
      </FooterActions>
    </>
  );
}
