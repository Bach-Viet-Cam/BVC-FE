import { useRef } from "react";
import { type ClassFileImportPreview } from "@/features/classes/types/classTypes";
import { ImportRowCard } from "@/features/classes/components/ImportRowCard";
import { useClassFileImport } from "@/features/classes/hooks/useClassFileImport";
import { formatIsoDate } from "@/features/classes/utils/classFormat";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { FormDialog } from "@/shared/components/bvc/FormDialog";
import { toast } from "@/shared/components/ui/toast";

const FILE_HINT = "File Students_[Mã môn]_[Mã lớp].xlsx, sheet Students, tối đa 2 MB và 200 dòng.";

interface ClassFileImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-[13.5px]">
      <span className="text-bvc-muted">{label}</span>
      <span className="text-right font-semibold text-bvc-ink">{value}</span>
    </div>
  );
}

function PreviewSummary({ preview }: { preview: ClassFileImportPreview }) {
  const { classInfo } = preview;
  const subject = classInfo.instrument
    ? `${classInfo.subjectCode} · ${classInfo.instrument.name}`
    : classInfo.subjectCode;
  const term =
    classInfo.startDate && classInfo.endDate
      ? `${classInfo.cohort} · ${formatIsoDate(classInfo.startDate)} – ${formatIsoDate(classInfo.endDate)}`
      : classInfo.cohort;
  return (
    <>
      <div className="flex flex-col gap-1.5 rounded-[14px] border border-bvc-border bg-white px-[14px] py-[12px]">
        <InfoRow label="Tên lớp" value={classInfo.name} />
        <InfoRow label="Mã môn" value={subject} />
        <InfoRow label="Kì học" value={term} />
      </div>
      <div className="flex gap-6 text-[13px] text-bvc-muted">
        <span>
          <strong className="font-bvc-mono text-[16px] text-bvc-ink">{preview.validRows}</strong> dòng hợp lệ
        </span>
        <span>
          <strong className="font-bvc-mono text-[16px] text-bvc-ink">{preview.errorRows}</strong> dòng bị bỏ qua
        </span>
      </div>
      <div className="flex max-h-[260px] flex-col gap-[8px] overflow-y-auto">
        {preview.rows.map((row) => (
          <ImportRowCard key={row.rowNumber} row={row} />
        ))}
      </div>
    </>
  );
}

export function ClassFileImportDialog({ open, onClose, onImported }: ClassFileImportDialogProps) {
  const { phase, file, fileError, preview, canConfirm, selectFile, confirm, reset } = useClassFileImport();
  const inputRef = useRef<HTMLInputElement>(null);
  const isBusy = phase === "uploading" || phase === "confirming";

  const close = () => {
    reset();
    onClose();
  };

  const handleConfirm = async () => {
    const outcome = await confirm();
    if ("error" in outcome) {
      toast.error(outcome.error);
      return;
    }
    toast.success(outcome.message);
    reset();
    onImported();
    onClose();
  };

  return (
    <FormDialog open={open} onClose={close} title="Nhập file SV">
      {(requestClose) => (
        <div className="flex flex-col gap-3 px-6 pt-3 pb-6 sm:px-[30px]">
          <div className="flex flex-wrap items-center gap-[10px]">
            <span className="min-w-0 grow text-[13.5px] font-semibold wrap-break-word text-bvc-ink">
              {file?.name ?? "Chưa chọn file"}
            </span>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx"
              hidden
              data-testid="class-file-input"
              onChange={(event) => {
                const picked = event.target.files?.[0];
                event.target.value = "";
                if (picked) void selectFile(picked);
              }}
            />
            <ActionButton variant="secondary" disabled={isBusy} onClick={() => inputRef.current?.click()}>
              {file ? "Đổi file" : "Chọn file"}
            </ActionButton>
          </div>
          <p className="text-[12.5px] text-bvc-muted">{FILE_HINT}</p>
          {phase === "uploading" && <p className="text-[13px] text-bvc-muted">Đang đọc file…</p>}
          {fileError && (
            <p role="alert" className="text-[13px] text-bvc-accent">
              {fileError}
            </p>
          )}
          {preview?.blockingErrors.map((message) => (
            <p
              key={message}
              role="alert"
              className="rounded-[12px] border border-bvc-accent-border bg-bvc-accent-tint px-[12px] py-[9px] text-[13px] text-bvc-ink"
            >
              {message}
            </p>
          ))}
          {preview && <PreviewSummary preview={preview} />}
          <div className="flex justify-end gap-[10px] pt-1">
            <ActionButton variant="secondary" onClick={requestClose} disabled={phase === "confirming"}>
              Hủy
            </ActionButton>
            <ActionButton onClick={handleConfirm} disabled={!canConfirm}>
              {phase === "confirming" ? "Đang tạo lớp…" : `Tạo lớp & nhập ${preview?.validRows ?? 0} SV`}
            </ActionButton>
          </div>
        </div>
      )}
    </FormDialog>
  );
}
